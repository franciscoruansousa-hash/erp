export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  costPrice: number;
  stock: number;
  lowStockThreshold: number;
  image?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export type PaymentMethod = 'card' | 'cash' | 'pix';

export interface PaymentEntry {
  method: PaymentMethod;
  amount: number;
  installments?: number;
}

export interface Sale {
  id: string;
  items: CartItem[];
  total: number;
  subtotal: number;
  tax: number;
  discount?: number;
  deliveryFee?: number;
  payments: PaymentEntry[];
  installments?: number;
  installmentValue?: number;
  timestamp: string;
}
