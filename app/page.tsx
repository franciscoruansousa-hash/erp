'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { InventoryView } from '@/components/InventoryView';
import { POSView } from '@/components/POSView';
import { SalesHistoryView } from '@/components/SalesHistoryView';
import { ReportsView } from '@/components/ReportsView';
import { Product, CartItem, Sale } from '@/types';

const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'MacBook Pro M2',
    sku: 'MBP-2023-SIL',
    category: 'Eletrônicos',
    price: 2499.00,
    stock: 12,
    image: 'https://picsum.photos/seed/macbook/400/400'
  },
  {
    id: '2',
    name: 'Cadeira Ergonômica',
    sku: 'FUR-ERGO-01',
    category: 'Móveis',
    price: 450.00,
    stock: 3,
    image: 'https://picsum.photos/seed/chair/400/400'
  },
  {
    id: '3',
    name: 'Teclado Mecânico',
    sku: 'ACC-KBD-RGB',
    category: 'Hardware',
    price: 129.00,
    stock: 0,
    image: 'https://picsum.photos/seed/keyboard/400/400'
  },
  {
    id: '4',
    name: 'Café Orgânico',
    sku: 'COF-ORG-01',
    category: 'Orgânicos',
    price: 12.50,
    stock: 14,
    image: 'https://picsum.photos/seed/coffee/400/400'
  },
  {
    id: '5',
    name: 'Pão Integral',
    sku: 'BRD-WHT-01',
    category: 'Padaria',
    price: 3.20,
    stock: 8,
    image: 'https://picsum.photos/seed/bread/400/400'
  }
];

export default function Home() {
  const [activeView, setActiveView] = useState<'inventory' | 'pos' | 'sales' | 'reports'>('inventory');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [sales, setSales] = useState<Sale[]>([]);

  const handleAddProduct = (newProduct: Omit<Product, 'id'>) => {
    const product: Product = {
      ...newProduct,
      id: Math.random().toString(36).substr(2, 9)
    };
    setProducts(prev => [product, ...prev]);
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleCompleteSale = (saleData: Omit<Sale, 'id' | 'timestamp'>) => {
    const newSale: Sale = {
      ...saleData,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString()
    };

    setProducts(prev => prev.map(p => {
      const cartItem = saleData.items.find(item => item.id === p.id);
      if (cartItem) {
        return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
      }
      return p;
    }));

    setSales(prev => [newSale, ...prev]);
    alert('Venda concluída com sucesso!');
  };

  const handleDeleteSale = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este registro de venda?')) {
      setSales(prev => prev.filter(s => s.id !== id));
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar activeView={activeView} onViewChange={setActiveView} />
      
      <div className="flex-1 overflow-auto">
        {activeView === 'inventory' ? (
          <InventoryView 
            products={products} 
            onAddProduct={handleAddProduct} 
            onDeleteProduct={handleDeleteProduct} 
          />
        ) : activeView === 'pos' ? (
          <POSView 
            products={products} 
            onCompleteSale={handleCompleteSale} 
          />
        ) : activeView === 'sales' ? (
          <SalesHistoryView 
            sales={sales}
            onDeleteSale={handleDeleteSale}
          />
        ) : (
          <ReportsView 
            sales={sales}
            products={products}
          />
        )}
      </div>

      <footer className="px-10 py-6 border-t border-slate-200 text-center text-slate-500 text-xs bg-white">
        <p>© {new Date().getFullYear()} StockFlow ERP Systems. Todos os direitos reservados. Módulo de Gestão de Inventário v2.4.1</p>
      </footer>
    </main>
  );
}
