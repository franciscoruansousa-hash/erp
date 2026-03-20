'use client';

import React from 'react';
import { LayoutGrid, Package, ShoppingCart, BarChart3, Search, Bell, LogOut, Receipt } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavbarProps {
  activeView: 'inventory' | 'pos' | 'sales' | 'reports';
  onViewChange: (view: 'inventory' | 'pos' | 'sales' | 'reports') => void;
}

export function Navbar({ activeView, onViewChange }: NavbarProps) {
  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-slate-200 bg-white px-6 py-3 shrink-0">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3 text-emerald-500">
          <div className="size-10 flex items-center justify-center bg-emerald-50 rounded-lg">
            <Package className="size-6" />
          </div>
          <h2 className="text-slate-900 text-xl font-bold leading-tight tracking-tight">StockFlow ERP</h2>
        </div>
        
        <nav className="hidden md:flex items-center gap-1">
          <button 
            onClick={() => onViewChange('inventory')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              activeView === 'inventory' ? "bg-emerald-50 text-emerald-600" : "text-slate-600 hover:bg-slate-50"
            )}
          >
            <LayoutGrid className="size-4" />
            Inventário
          </button>
          <button 
            onClick={() => onViewChange('pos')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              activeView === 'pos' ? "bg-emerald-50 text-emerald-600" : "text-slate-600 hover:bg-slate-50"
            )}
          >
            <ShoppingCart className="size-4" />
            Terminal PDV
          </button>
          <button 
            onClick={() => onViewChange('sales')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              activeView === 'sales' ? "bg-emerald-50 text-emerald-600" : "text-slate-600 hover:bg-slate-50"
            )}
          >
            <Receipt className="size-4" />
            Vendas
          </button>
          <button 
            onClick={() => onViewChange('reports')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              activeView === 'reports' ? "bg-emerald-50 text-emerald-600" : "text-slate-600 hover:bg-slate-50"
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
          <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative">
            <Bell className="size-5" />
            <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          
          <div className="h-8 w-px bg-slate-200 mx-1"></div>
          
          <div className="flex items-center gap-3 pl-2">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-900">Alex Thompson</p>
              <p className="text-xs text-slate-500">Gerente</p>
            </div>
            <img 
              src="https://picsum.photos/seed/manager/100/100" 
              alt="Profile" 
              className="size-10 rounded-full border-2 border-emerald-500 object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          
          <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full">
            <LogOut className="size-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
