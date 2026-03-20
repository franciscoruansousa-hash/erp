export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  image?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Sale {
  id: string;
  items: CartItem[];
  total: number;
  subtotal: number;
  tax: number;
  paymentMethod: 'card' | 'cash';
  timestamp: string;
}
