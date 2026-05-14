'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Search, Plus, Minus, Trash2, CreditCard, Banknote, ReceiptText, ShoppingCart, Package, Smartphone, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, CartItem, Sale, PaymentEntry, PaymentMethod } from '@/types';
import { cn } from '@/lib/utils';

interface POSViewProps {
  products: Product[];
  onCompleteSale: (sale: Omit<Sale, 'id' | 'timestamp'>) => void;
}

export function POSView({ products, onCompleteSale }: POSViewProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos os Produtos');
  const [payments, setPayments] = useState<PaymentEntry[]>([]);
  const [currentMethod, setCurrentMethod] = useState<PaymentMethod>('card');
  const [installments, setInstallments] = useState(1);
  const [addedAmount, setAddedAmount] = useState<string>('');
  const [discountValue, setDiscountValue] = useState<string>('');
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('fixed');
  const [deliveryFee, setDeliveryFee] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);

  const updateRemainingAmount = useCallback((currentTotal: number, currentPayments: PaymentEntry[]) => {
    const paid = currentPayments.reduce((sum, p) => sum + p.amount, 0);
    const rem = Math.max(0, currentTotal - paid);
    setAddedAmount(rem > 0 ? rem.toFixed(2) : '');
  }, []);

  const categories = ['Todos os Produtos', 'Bebidas', 'Padaria', 'Laticínios', 'Orgânicos'];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'Todos os Produtos' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus search input on mount
    searchInputRef.current?.focus();
  }, []);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const val = searchQuery.trim();
      if (val) {
        const product = products.find(p => p.sku.toLowerCase() === val.toLowerCase());
        if (product) {
          addToCart(product);
          setSearchQuery('');
          e.preventDefault();
        }
      }
    }
  };

  const addToCart = useCallback((product: Product) => {
    if (product.stock <= 0) return; // Prevent adding out of stock products

    setCart(prev => {
      const newCart = (() => {
        const existing = prev.find(item => item.id === product.id);
        if (existing) {
          return prev.map(item => 
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        return [...prev, { ...product, quantity: 1 }];
      })();
      
      // Update suggested amount
      const newSubtotal = newCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const newdiscountAmount = (() => {
        const val = parseFloat(discountValue) || 0;
        if (discountType === 'percent') return (newSubtotal * val) / 100;
        return val;
      })();
      const newTax = newSubtotal * 0.08;
      const dFee = parseFloat(deliveryFee) || 0;
      const newTotal = Math.max(0, newSubtotal - newdiscountAmount + newTax + dFee);
      updateRemainingAmount(newTotal, payments);
      
      return newCart;
    });

    // Refocus search input after adding
    setTimeout(() => searchInputRef.current?.focus(), 0);
  }, [discountValue, discountType, payments, updateRemainingAmount, deliveryFee]);

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => {
      const newCart = prev.map(item => {
        if (item.id === id) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      });

      const newSubtotal = newCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const newdiscountAmount = (() => {
        const val = parseFloat(discountValue) || 0;
        if (discountType === 'percent') return (newSubtotal * val) / 100;
        return val;
      })();
      const newTax = newSubtotal * 0.08;
      const dFee = parseFloat(deliveryFee) || 0;
      const newTotal = Math.max(0, newSubtotal - newdiscountAmount + newTax + dFee);
      updateRemainingAmount(newTotal, payments);

      return newCart;
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => {
      const newCart = prev.filter(item => item.id !== id);
      
      const newSubtotal = newCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const newdiscountAmount = (() => {
        const val = parseFloat(discountValue) || 0;
        if (discountType === 'percent') return (newSubtotal * val) / 100;
        return val;
      })();
      const newTax = newSubtotal * 0.08;
      const dFee = parseFloat(deliveryFee) || 0;
      const newTotal = Math.max(0, newSubtotal - newdiscountAmount + newTax + dFee);
      updateRemainingAmount(newTotal, payments);

      return newCart;
    });
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = (() => {
    const val = parseFloat(discountValue) || 0;
    if (discountType === 'percent') return (subtotal * val) / 100;
    return val;
  })();
  const tax = subtotal * 0.08;
  const dFee = parseFloat(deliveryFee) || 0;
  const total = Math.max(0, subtotal - discountAmount + tax + dFee);

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = Math.max(0, total - totalPaid);

  const addPayment = () => {
    const amount = parseFloat(addedAmount);
    if (isNaN(amount) || amount <= 0) return;
    
    const finalAmount = Math.min(amount, remaining);
    if (finalAmount <= 0) return;

    const newPayments = [...payments, { 
      method: currentMethod, 
      amount: finalAmount,
      installments: currentMethod === 'card' ? installments : undefined
    }];
    setPayments(newPayments);
    setAddedAmount('');
    setInstallments(1);

    // Update remaining for next payment
    const newPaid = newPayments.reduce((sum, p) => sum + p.amount, 0);
    const newRem = Math.max(0, total - newPaid);
    if (newRem > 0) setAddedAmount(newRem.toFixed(2));
  };

  const removePayment = (index: number) => {
    const newPayments = payments.filter((_, i) => i !== index);
    setPayments(newPayments);

    const newPaid = newPayments.reduce((sum, p) => sum + p.amount, 0);
    const newRem = Math.max(0, total - newPaid);
    setAddedAmount(newRem.toFixed(2));
  };

  const handleCheckout = () => {
    if (totalPaid < total - 0.01) return;

    const cardPayment = payments.find(p => p.method === 'card');

    onCompleteSale({
      items: cart,
      total,
      subtotal,
      tax,
      discount: discountAmount,
      deliveryFee: dFee,
      payments,
      installments: cardPayment?.installments || 1,
      installmentValue: cardPayment ? cardPayment.amount / (cardPayment.installments || 1) : total
    });
    setCart([]);
    setPayments([]);
    setInstallments(1);
    setDiscountValue('');
    
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

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
                ref={searchInputRef}
                type="text" 
                placeholder="Pesquisar produtos por nome, SKU ou código de barras..." 
                className="w-full bg-slate-50 border-none rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 text-sm"
                value={searchQuery}
                onKeyDown={handleSearchKeyDown}
                onChange={e => {
                  const val = e.target.value;
                  setSearchQuery(val);
                  if (val.trim()) {
                    const product = products.find(p => p.sku.toLowerCase() === val.trim().toLowerCase());
                    if (product) {
                      addToCart(product);
                      setSearchQuery('');
                    }
                  }
                }}
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
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                      : "bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600"
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
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            key={activeCategory + searchQuery}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
          >
            {filteredProducts.map((product) => (
              <motion.div 
                layout
                variants={itemVariants}
                key={product.id}
                whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.98 }}
                onClick={() => addToCart(product)}
                className="bg-white rounded-2xl p-3 shadow-sm border border-slate-200 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10 transition-colors cursor-pointer group relative overflow-hidden"
              >
                <div className="aspect-square rounded-xl bg-slate-50 mb-3 relative overflow-hidden">
                  <Image 
                    src={product.image || `https://picsum.photos/seed/${product.id}/400/400`} 
                    alt={product.name} 
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/20 transition-colors flex items-center justify-center">
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      whileHover={{ scale: 1, opacity: 1 }}
                      className="bg-white/90 p-2 rounded-full shadow-lg"
                    >
                      <Plus className="size-6 text-blue-600" />
                    </motion.div>
                  </div>
                </div>
                <h3 className="text-sm font-semibold mb-1 line-clamp-1 text-slate-900">{product.name}</h3>
                <div className="flex justify-between items-center">
                  <span className="text-blue-600 font-bold">R${product.price.toFixed(2)}</span>
                  <span className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase",
                    product.stock > 5 ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
                  )}>
                    {product.stock > 0 ? `${product.stock} em Estoque` : 'Sem Estoque'}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
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
            onClick={() => {
              setCart([]);
              setPayments([]);
            }}
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
                  <div className="h-14 w-14 rounded-xl bg-slate-50 shrink-0 overflow-hidden border border-slate-100 relative">
                    {item.image ? (
                      <Image 
                        src={item.image} 
                        alt={item.name} 
                        fill
                        className="object-cover" 
                        referrerPolicy="no-referrer" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Package className="size-5" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{item.name}</h4>
                    <p className="text-xs text-slate-500">R${item.price.toFixed(2)} / un</p>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 rounded-full p-1 border border-slate-100">
                    <button 
                      onClick={() => updateQuantity(item.id, -1)}
                      className="h-8 w-8 flex items-center justify-center rounded-full bg-white text-slate-600 shadow-sm hover:text-blue-600 transition-colors"
                    >
                      <Minus className="size-4" />
                    </button>
                    <span className="text-sm font-bold w-6 text-center text-slate-900">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, 1)}
                      className="h-8 w-8 flex items-center justify-center rounded-full bg-white text-slate-600 shadow-sm hover:text-blue-600 transition-colors"
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

        {/* Payment and Checkout Section */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
          <div className="space-y-3 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 font-medium">Subtotal</span>
              <span className="font-bold text-slate-900">R${subtotal.toFixed(2)}</span>
            </div>
            
            <div className="space-y-2 py-2 border-y border-slate-100">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Desconto</span>
                <div className="flex bg-white border border-slate-200 rounded-lg overflow-hidden h-8">
                  <button 
                    onClick={() => {
                      setDiscountType('percent');
                      const val = parseFloat(discountValue) || 0;
                      const dAmount = (subtotal * val) / 100;
                      const newTotal = Math.max(0, subtotal - dAmount + tax);
                      updateRemainingAmount(newTotal, payments);
                    }}
                    className={cn(
                      "px-2 text-[10px] font-black transition-colors",
                      discountType === 'percent' ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-50"
                    )}
                  >
                    %
                  </button>
                  <button 
                    onClick={() => {
                      setDiscountType('fixed');
                      const val = parseFloat(discountValue) || 0;
                      const dAmount = val;
                      const newTotal = Math.max(0, subtotal - dAmount + tax);
                      updateRemainingAmount(newTotal, payments);
                    }}
                    className={cn(
                      "px-2 text-[10px] font-black transition-colors",
                      discountType === 'fixed' ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-50"
                    )}
                  >
                    $
                  </button>
                </div>
              </div>
              <div className="relative">
                <input 
                  type="number"
                  placeholder="Valor do desconto..."
                  value={discountValue}
                  onChange={e => {
                    const newVal = e.target.value;
                    setDiscountValue(newVal);
                    
                    const val = parseFloat(newVal) || 0;
                    const dAmount = discountType === 'percent' ? (subtotal * val) / 100 : val;
                    const newTotal = Math.max(0, subtotal - dAmount + tax + dFee);
                    updateRemainingAmount(newTotal, payments);
                  }}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold outline-none focus:border-blue-500"
                />
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-xs text-red-500 font-bold">
                  <span>Desconto Aplicado</span>
                  <span>- R${discountAmount.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="space-y-2 py-2 border-b border-slate-100">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Taxa de Entrega</span>
              </div>
              <div className="relative">
                <input 
                  type="number"
                  placeholder="Valor da entrega..."
                  value={deliveryFee}
                  onChange={e => {
                    const newVal = e.target.value;
                    setDeliveryFee(newVal);
                    
                    const val = parseFloat(newVal) || 0;
                    const dAmount = discountType === 'percent' ? (subtotal * parseFloat(discountValue || '0')) / 100 : parseFloat(discountValue || '0');
                    const newTotal = Math.max(0, subtotal - dAmount + tax + val);
                    updateRemainingAmount(newTotal, payments);
                  }}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-slate-500 font-medium">Imposto (8%)</span>
              <span className="font-bold text-slate-900">R${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500 font-medium">Total do Pedido</span>
              <span className="text-xl font-black text-slate-900">R${total.toFixed(2)}</span>
            </div>
            
            {(payments.length > 0 || total > 0) && (
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <div className="flex justify-between items-end mb-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Progresso do Pagamento</p>
                  <span className="text-[10px] font-bold text-blue-600">
                    {((totalPaid / total) * 100).toFixed(0)}% Pago
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (totalPaid / total) * 100)}%` }}
                    className={cn(
                      "h-full transition-all duration-500",
                      totalPaid >= total ? "bg-emerald-500" : "bg-blue-600"
                    )}
                  />
                </div>

                {payments.length > 0 && (
                  <div className="space-y-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                    <AnimatePresence mode="popLayout">
                      {payments.map((p, idx) => (
                        <motion.div 
                          layout
                          initial={{ opacity: 0, scale: 0.9, x: 20 }}
                          animate={{ opacity: 1, scale: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.9, x: -20 }}
                          key={idx} 
                          className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="size-8 rounded-lg bg-blue-50 flex items-center justify-center">
                              {p.method === 'card' && <CreditCard className="size-4 text-blue-600" />}
                              {p.method === 'cash' && <Banknote className="size-4 text-blue-600" />}
                              {p.method === 'pix' && <Smartphone className="size-4 text-blue-600" />}
                            </div>
                            <div>
                              <span className="text-xs font-bold capitalize block leading-none mb-1">{p.method}</span>
                              {p.installments && p.installments > 1 && (
                                <span className="text-[10px] text-slate-500 font-medium">{p.installments}x de R${(p.amount / p.installments).toFixed(2)}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-black text-slate-900">R${p.amount.toFixed(2)}</span>
                            <button 
                              onClick={() => removePayment(idx)} 
                              className="size-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <X size={14} strokeWidth={3} />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            )}

            <div className={cn(
              "flex justify-between items-center p-4 rounded-2xl transition-all duration-300",
              remaining > 0 
                ? "bg-amber-50 border border-amber-100 text-amber-900" 
                : "bg-emerald-50 border border-emerald-100 text-emerald-900"
            )}>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                  {remaining > 0 ? "Saldo Restante" : "Valor Total Pago"}
                </span>
                <span className="text-2xl font-black tabular-nums">
                  R${(remaining > 0 ? remaining : totalPaid).toFixed(2)}
                </span>
              </div>
              {remaining > 0 && (
                <div className="size-10 bg-amber-200/50 rounded-full flex items-center justify-center animate-pulse">
                  <Banknote className="size-5 text-amber-700" />
                </div>
              )}
            </div>
          </div>

          {remaining > 0 ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="grid grid-cols-3 gap-3">
                {(['card', 'cash', 'pix'] as PaymentMethod[]).map(method => (
                  <button 
                    key={method}
                    onClick={() => setCurrentMethod(method)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 p-3 rounded-xl border-2 transition-all bg-white",
                      currentMethod === method ? "border-blue-500 bg-blue-50" : "border-slate-200"
                    )}
                  >
                    {method === 'card' && <CreditCard className="size-4 text-blue-600" />}
                    {method === 'cash' && <Banknote className="size-4 text-blue-600" />}
                    {method === 'pix' && <Smartphone className="size-4 text-blue-600" />}
                    <span className="text-[8px] font-black uppercase tracking-tighter">{method}</span>
                  </button>
                ))}
              </div>

              {currentMethod === 'card' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-1.5"
                >
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Parcelamento</label>
                  <select 
                    value={installments}
                    onChange={(e) => setInstallments(parseInt(e.target.value))}
                    className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-900 outline-none focus:border-blue-500 appearance-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24].map(n => (
                      <option key={n} value={n}>{n}x {n === 1 ? 'à vista' : `de R$ ${(parseFloat(addedAmount || '0') / n).toFixed(2)}`}</option>
                    ))}
                  </select>
                </motion.div>
              )}

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">R$</span>
                  <input 
                    type="number"
                    value={addedAmount}
                    onChange={e => setAddedAmount(e.target.value)}
                    className="w-full bg-white border-2 border-slate-200 rounded-xl pl-9 pr-4 py-3 text-sm font-bold outline-none focus:border-blue-500"
                    step="0.01"
                  />
                </div>
                <button 
                  onClick={addPayment}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl shadow-lg transition-all"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>
          ) : (
            <motion.button 
              disabled={cart.length === 0}
              onClick={handleCheckout}
              animate={remaining === 0 && cart.length > 0 ? { 
                scale: [1, 1.02, 1],
                boxShadow: ["0 10px 15px -3px rgba(37, 99, 235, 0.2)", "0 20px 25px -5px rgba(37, 99, 235, 0.4)", "0 10px 15px -3px rgba(37, 99, 235, 0.2)"]
              } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98] tracking-widest uppercase text-sm"
            >
              <ReceiptText className="size-5" />
              FINALIZAR TRANSAÇÃO
            </motion.button>
          )}
          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="fixed bottom-8 right-8 z-50 bg-blue-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-bold"
              >
                <div className="size-6 bg-white/20 rounded-full flex items-center justify-center">
                  <Plus className="size-4" />
                </div>
                Venda concluída com sucesso!
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
