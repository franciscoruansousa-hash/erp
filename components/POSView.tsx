'use client';

import React, { useState } from 'react';
import { Search, Plus, Minus, Trash2, CreditCard, Banknote, ReceiptText, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, CartItem, Sale } from '@/types';
import { cn } from '@/lib/utils';

interface POSViewProps {
  products: Product[];
  onCompleteSale: (sale: Omit<Sale, 'id' | 'timestamp'>) => void;
}

export function POSView({ products, onCompleteSale }: POSViewProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos os Produtos');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card');

  const categories = ['Todos os Produtos', 'Bebidas', 'Padaria', 'Laticínios', 'Orgânicos'];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'Todos os Produtos' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden p-4 gap-4 bg-slate-50">
      {/* Left Side: Product Grid */}
      <div className="flex flex-col flex-1 gap-4 overflow-hidden">
        {/* Search and Categories */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
              <input 
                type="text" 
                placeholder="Pesquisar produtos por nome, SKU ou código de barras..." 
                className="w-full bg-slate-50 border-none rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-emerald-500 text-sm"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "whitespace-nowrap px-5 py-2.5 rounded-xl text-sm font-medium transition-all",
                    activeCategory === cat 
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                      : "bg-slate-50 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProducts.map((product) => (
              <motion.div 
                layout
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-white rounded-2xl p-3 shadow-sm border border-slate-200 hover:border-emerald-500 transition-all cursor-pointer group relative"
              >
                <div className="aspect-square rounded-xl bg-slate-50 mb-3 relative overflow-hidden">
                  <img 
                    src={product.image || `https://picsum.photos/seed/${product.id}/400/400`} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/10 transition-colors flex items-center justify-center">
                    <Plus className="size-10 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                  </div>
                </div>
                <h3 className="text-sm font-semibold mb-1 line-clamp-1 text-slate-900">{product.name}</h3>
                <div className="flex justify-between items-center">
                  <span className="text-emerald-600 font-bold">R${product.price.toFixed(2)}</span>
                  <span className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase",
                    product.stock > 5 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  )}>
                    {product.stock > 0 ? `${product.stock} em Estoque` : 'Sem Estoque'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side: Shopping Cart */}
      <div className="w-full max-w-[420px] flex flex-col bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center shrink-0">
          <div>
            <h2 className="font-bold text-xl text-slate-900">Pedido Atual</h2>
            <p className="text-xs text-slate-500">Pedido #ORD-{new Date().getFullYear()}-001</p>
          </div>
          <button 
            onClick={() => setCart([])}
            className="flex items-center gap-1.5 text-slate-400 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
          >
            <Trash2 className="size-4" />
            <span className="text-sm font-semibold">Limpar</span>
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
                <ShoppingCart className="size-12 opacity-20" />
                <p className="text-sm font-medium">Seu carrinho está vazio</p>
              </div>
            ) : (
              cart.map((item) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  key={item.id} 
                  className="flex items-center gap-4"
                >
                  <div className="h-14 w-14 rounded-xl bg-slate-50 shrink-0 overflow-hidden border border-slate-100">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{item.name}</h4>
                    <p className="text-xs text-slate-500">R${item.price.toFixed(2)} / un</p>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 rounded-full p-1 border border-slate-100">
                    <button 
                      onClick={() => updateQuantity(item.id, -1)}
                      className="h-8 w-8 flex items-center justify-center rounded-full bg-white text-slate-600 shadow-sm hover:text-emerald-500 transition-colors"
                    >
                      <Minus className="size-4" />
                    </button>
                    <span className="text-sm font-bold w-6 text-center text-slate-900">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, 1)}
                      className="h-8 w-8 flex items-center justify-center rounded-full bg-white text-slate-600 shadow-sm hover:text-emerald-500 transition-colors"
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                  <div className="w-20 text-right font-bold text-slate-900 text-sm">
                    R${(item.price * item.quantity).toFixed(2)}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Order Summary & Checkout */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 font-medium">Subtotal</span>
              <span className="font-bold text-slate-900">R${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 font-medium">Imposto (8%)</span>
              <span className="font-bold text-slate-900">R${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-3 border-t border-slate-200">
              <span className="text-lg font-bold text-slate-900">Total</span>
              <span className="text-3xl font-black text-emerald-600">R${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <button 
              onClick={() => setPaymentMethod('card')}
              className={cn(
                "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all group bg-white",
                paymentMethod === 'card' ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:border-emerald-500 hover:bg-emerald-50"
              )}
            >
              <CreditCard className="size-6 text-emerald-500 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Cartão</span>
            </button>
            <button 
              onClick={() => setPaymentMethod('cash')}
              className={cn(
                "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all group bg-white",
                paymentMethod === 'cash' ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:border-emerald-500 hover:bg-emerald-50"
              )}
            >
              <Banknote className="size-6 text-emerald-500 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Dinheiro</span>
            </button>
          </div>

          <button 
            disabled={cart.length === 0}
            onClick={() => {
              onCompleteSale({
                items: cart,
                total,
                subtotal,
                tax,
                paymentMethod
              });
              setCart([]);
            }}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white font-black py-5 rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98] tracking-widest uppercase text-sm"
          >
            <ReceiptText className="size-5" />
            FINALIZAR TRANSAÇÃO
          </button>
        </div>
      </div>
    </div>
  );
}
