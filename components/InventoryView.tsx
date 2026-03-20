'use client';

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, FileDown, Laptop, Armchair, Keyboard, Package } from 'lucide-react';
import { motion } from 'motion/react';
import { Product } from '@/types';
import { cn } from '@/lib/utils';

interface InventoryViewProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onDeleteProduct: (id: string) => void;
}

export function InventoryView({ products, onAddProduct, onDeleteProduct }: InventoryViewProps) {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Eletrônicos',
    price: '',
    stock: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sku) return;
    
    onAddProduct({
      name: formData.name,
      sku: formData.sku,
      category: formData.category,
      price: parseFloat(formData.price) || 0,
      stock: parseInt(formData.stock) || 0,
      image: `https://picsum.photos/seed/${formData.name}/400/400`
    });
    
    setFormData({ name: '', sku: '', category: 'Eletrônicos', price: '', stock: '' });
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'eletrônicos': return <Laptop className="size-5 text-slate-400" />;
      case 'móveis': return <Armchair className="size-5 text-slate-400" />;
      case 'hardware': return <Keyboard className="size-5 text-slate-400" />;
      default: return <Package className="size-5 text-slate-400" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      {/* Product Registration */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-2xl font-bold text-slate-900">Cadastro de Produto</h1>
          <p className="text-slate-500 text-sm">Adicione novos itens ao seu catálogo global de inventário.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Nome do Produto</label>
              <input 
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                placeholder="ex: Mouse Sem Fio"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">SKU (Unidade de Manutenção de Estoque)</label>
              <input 
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                placeholder="WM-102-BL"
                value={formData.sku}
                onChange={e => setFormData({...formData, sku: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Categoria</label>
              <select 
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all appearance-none bg-white"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                <option>Eletrônicos</option>
                <option>Suprimentos de Escritório</option>
                <option>Móveis</option>
                <option>Hardware</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Preço (R$)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">R$</span>
                <input 
                  type="number"
                  step="0.01"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  placeholder="0,00"
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Quantidade Inicial em Estoque</label>
              <input 
                type="number"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                placeholder="0"
                value={formData.stock}
                onChange={e => setFormData({...formData, stock: e.target.value})}
              />
            </div>
            <div className="flex items-end">
              <button 
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-full transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <Plus className="size-5" />
                Cadastrar Produto
              </button>
            </div>
          </div>
        </form>
      </motion.section>

      {/* Product Inventory */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Inventário de Produtos</h2>
            <p className="text-slate-500 text-sm">Atualmente rastreando {products.length} itens em 4 armazéns.</p>
          </div>
          <button className="flex items-center gap-2 text-emerald-600 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-full text-sm font-semibold transition-colors">
            <FileDown className="size-4" />
            Exportar CSV
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Produto</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">SKU</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Categoria</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Preço</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Estoque</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="size-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          getCategoryIcon(product.category)
                        )}
                      </div>
                      <span className="font-medium text-slate-900">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-mono text-sm">{product.sku}</td>
                  <td className="px-6 py-4">
                    <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-900">R${product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "size-2 rounded-full",
                        product.stock > 10 ? "bg-emerald-500" : product.stock > 0 ? "bg-amber-500" : "bg-red-500"
                      )}></span>
                      <span className="text-sm font-medium">{product.stock} Unidades</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-slate-400 hover:text-emerald-500 transition-colors">
                        <Edit2 className="size-4" />
                      </button>
                      <button 
                        onClick={() => onDeleteProduct(product.id)}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <span className="text-xs text-slate-500">Mostrando 1-{products.length} de {products.length} produtos</span>
          <div className="flex gap-1">
            <button className="p-2 rounded-lg border border-slate-200 hover:bg-white transition-colors disabled:opacity-50" disabled>
              <Plus className="size-4 rotate-45" />
            </button>
            <button className="size-8 rounded-lg bg-emerald-500 text-white text-xs font-bold">1</button>
            <button className="size-8 rounded-lg border border-slate-200 hover:bg-white text-xs font-medium">2</button>
            <button className="size-8 rounded-lg border border-slate-200 hover:bg-white text-xs font-medium">3</button>
            <button className="p-2 rounded-lg border border-slate-200 hover:bg-white transition-colors">
              <Plus className="size-4 -rotate-45" />
            </button>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
