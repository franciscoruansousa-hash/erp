'use client';

import React from 'react';
import Image from 'next/image';
import { LayoutGrid, Package, ShoppingCart, BarChart3, Search, Bell, LogOut, Receipt, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Product } from '@/types';

interface NavbarProps {
  activeView: 'inventory' | 'pos' | 'sales' | 'reports';
  onViewChange: (view: 'inventory' | 'pos' | 'sales' | 'reports') => void;
  products: Product[];
  onLogout: () => void;
  session?: any;
}

export function Navbar({ activeView, onViewChange, products, onLogout, session }: NavbarProps) {
  const lowStockProducts = products.filter(p => p.stock <= (p.lowStockThreshold || 5));
  const hasLowStock = lowStockProducts.length > 0;
  
  const userEmail = session?.user?.email || 'Usuário';
  const userName = userEmail.split('@')[0];

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-slate-200 bg-white px-6 py-3 shrink-0">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3 text-blue-600">
          <div className="size-10 flex items-center justify-center bg-blue-50 rounded-lg">
            <Package className="size-6" />
          </div>
          <h2 className="text-slate-900 text-xl font-bold leading-tight tracking-tight">StockFlow ERP</h2>
        </div>
        
        <nav className="hidden md:flex items-center gap-1">
          <button 
            onClick={() => onViewChange('inventory')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              activeView === 'inventory' ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"
            )}
          >
            <LayoutGrid className="size-4" />
            Inventário
          </button>
          <button 
            onClick={() => onViewChange('pos')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              activeView === 'pos' ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"
            )}
          >
            <ShoppingCart className="size-4" />
            Terminal PDV
          </button>
          <button 
            onClick={() => onViewChange('sales')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              activeView === 'sales' ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"
            )}
          >
            <Receipt className="size-4" />
            Vendas
          </button>
          <button 
            onClick={() => onViewChange('reports')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              activeView === 'reports' ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"
            )}
          >
            <BarChart3 className="size-4" />
            Relatórios
          </button>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center bg-slate-100 rounded-full px-4 py-2 w-64">
          <Search className="size-4 text-slate-400 mr-2" />
          <input 
            type="text" 
            placeholder="Pesquisar..." 
            className="bg-transparent border-none focus:ring-0 text-sm w-full"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative">
              <Bell className="size-5" />
              {hasLowStock && (
                <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white animate-ping"></span>
              )}
              {hasLowStock && (
                <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>
            
            {/* Notification Dropdown */}
            {hasLowStock && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 py-4 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <div className="px-4 mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Notificações</h3>
                  <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {lowStockProducts.length} Alertas
                  </span>
                </div>
                <div className="max-h-64 overflow-y-auto px-2 space-y-1">
                  {lowStockProducts.map(product => (
                    <div key={product.id} className="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className="size-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                        <AlertTriangle className="size-4 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{product.name}</p>
                        <p className="text-[10px] text-slate-500">Estoque: {product.stock} (Limite: {product.lowStockThreshold || 5})</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 px-4 pt-3 border-t border-slate-50">
                  <button 
                    onClick={() => onViewChange('inventory')}
                    className="w-full text-center text-xs font-bold text-blue-600 hover:text-blue-700"
                  >
                    Ver Inventário Completo
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="h-8 w-px bg-slate-200 mx-1"></div>
          
          <div className="flex items-center gap-3 pl-2">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-900 capitalize">{userName}</p>
              <p className="text-[10px] text-slate-500 truncate max-w-[120px]">{userEmail}</p>
            </div>
            <div className="size-10 rounded-full border-2 border-blue-600 overflow-hidden relative">
              <Image 
                src="https://picsum.photos/seed/manager/100/100" 
                alt="Profile" 
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
          
          <button 
            onClick={onLogout}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-full"
            title="Sair"
          >
            <LogOut className="size-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
