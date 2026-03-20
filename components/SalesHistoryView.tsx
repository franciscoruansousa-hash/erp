'use client';

import React, { useState, useMemo } from 'react';
import { Trash2, Calendar, CreditCard, Banknote, Eye, Receipt, Filter, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Sale } from '@/types';
import { cn } from '@/lib/utils';

interface SalesHistoryViewProps {
  sales: Sale[];
  onDeleteSale: (id: string) => void;
}

type FilterPeriod = 'all' | 'day' | 'week' | 'month';

export function SalesHistoryView({ sales, onDeleteSale }: SalesHistoryViewProps) {
  const [filter, setFilter] = useState<FilterPeriod>('all');

  const filteredSales = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = 7 * oneDay;
    const oneMonth = 30 * oneDay;

    return sales.filter(sale => {
      const saleDate = new Date(sale.timestamp).getTime();
      
      if (filter === 'day') {
        return saleDate >= today;
      }
      if (filter === 'week') {
        return saleDate >= (now.getTime() - oneWeek);
      }
      if (filter === 'month') {
        return saleDate >= (now.getTime() - oneMonth);
      }
      return true;
    });
  }, [sales, filter]);

  const filterOptions = [
    { id: 'all', label: 'Tudo' },
    { id: 'day', label: 'Hoje' },
    { id: 'week', label: 'Esta Semana' },
    { id: 'month', label: 'Este Mês' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Histórico de Vendas</h1>
          <p className="text-slate-500 text-sm">Visualize e gerencie todas as transações realizadas no PDV.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          {filterOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setFilter(option.id as FilterPeriod)}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
                filter === option.id 
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20" 
                  : "text-slate-500 hover:bg-slate-50"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-2 text-slate-600">
            <Filter className="size-4" />
            <span className="text-sm font-medium">
              Mostrando {filteredSales.length} de {sales.length} vendas
            </span>
          </div>
          <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-bold">
            Total Filtrado: R$ {filteredSales.reduce((acc, s) => acc + s.total, 0).toFixed(2)}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">ID da Venda</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Data/Hora</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Itens</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Pagamento</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Total</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence mode="popLayout">
                {filteredSales.length === 0 ? (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      <Receipt className="size-12 mx-auto mb-3 opacity-20" />
                      <p>Nenhuma venda encontrada para este período.</p>
                    </td>
                  </motion.tr>
                ) : (
                  filteredSales.map((sale) => (
                    <motion.tr 
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key={sale.id} 
                      className="hover:bg-slate-50 transition-colors group"
                    >
                      <td className="px-6 py-4 font-mono text-xs text-slate-600">
                        #{sale.id.toUpperCase()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                          <Calendar className="size-4 text-slate-400" />
                          {new Date(sale.timestamp).toLocaleString('pt-BR')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-slate-900">
                          {sale.items.reduce((acc, item) => acc + item.quantity, 0)} itens
                        </span>
                        <p className="text-[10px] text-slate-500 truncate max-w-[150px]">
                          {sale.items.map(i => i.name).join(', ')}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {sale.paymentMethod === 'card' ? (
                            <CreditCard className="size-4 text-emerald-500" />
                          ) : (
                            <Banknote className="size-4 text-emerald-500" />
                          )}
                          <span className="text-sm capitalize text-slate-700">
                            {sale.paymentMethod === 'card' ? 'Cartão' : 'Dinheiro'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900">
                          R${sale.total.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 text-slate-400 hover:text-emerald-500 transition-colors" title="Ver Detalhes">
                            <Eye className="size-4" />
                          </button>
                          <button 
                            onClick={() => onDeleteSale(sale.id)}
                            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                            title="Excluir Registro"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.section>
    </div>
  );
}
