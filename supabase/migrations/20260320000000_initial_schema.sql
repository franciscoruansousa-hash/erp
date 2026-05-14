-- Initial Schema for StockFlow ERP

-- 1. Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  cost_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER NOT NULL DEFAULT 5,
  stock INTEGER NOT NULL DEFAULT 0,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Fix for existing tables missing columns
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='cost_price') THEN
        ALTER TABLE products ADD COLUMN cost_price DECIMAL(10, 2) NOT NULL DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='low_stock_threshold') THEN
        ALTER TABLE products ADD COLUMN low_stock_threshold INTEGER NOT NULL DEFAULT 5;
    END IF;
END $$;

-- 2. Sales Table
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL,
  installments INTEGER DEFAULT 1,
  installment_value DECIMAL(10, 2),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Fix for existing tables missing columns in sales
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sales' AND column_name='installments') THEN
        ALTER TABLE sales ADD COLUMN installments INTEGER DEFAULT 1;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sales' AND column_name='installment_value') THEN
        ALTER TABLE sales ADD COLUMN installment_value DECIMAL(10, 2);
    END IF;
END $$;

-- 3. Sale Items Table (to store products in each sale)
CREATE TABLE IF NOT EXISTS sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

-- 5. Create Policies (Allow all for now for demo purposes, but in production you should restrict this)
-- Note: In a real app, you would use auth.uid() to restrict access.

CREATE POLICY "Allow all access to products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to sales" ON sales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to sale_items" ON sale_items FOR ALL USING (true) WITH CHECK (true);

-- 6. Insert Initial Data (Optional)
-- INSERT INTO products (name, sku, category, price, stock, image) VALUES
-- ('MacBook Pro M2', 'MBP-2023-SIL', 'Eletrônicos', 2499.00, 12, 'https://picsum.photos/seed/macbook/400/400'),
-- ('Cadeira Ergonômica', 'FUR-ERGO-01', 'Móveis', 450.00, 3, 'https://picsum.photos/seed/chair/400/400'),
-- ('Teclado Mecânico', 'ACC-KBD-RGB', 'Hardware', 129.00, 0, 'https://picsum.photos/seed/keyboard/400/400'),
-- ('Café Orgânico', 'COF-ORG-01', 'Orgânicos', 12.50, 14, 'https://picsum.photos/seed/coffee/400/400'),
-- ('Pão Integral', 'BRD-WHT-01', 'Padaria', 3.20, 8, 'https://picsum.photos/seed/bread/400/400');
