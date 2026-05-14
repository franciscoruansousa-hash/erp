'use client';

import React, { useState, useMemo } from 'react';
import { Trash2, Calendar, CreditCard, Banknote, Eye, Receipt, Filter, ChevronDown, Smartphone, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Sale } from '@/types';
import { cn } from '@/lib/utils';

interface SalesHistoryViewProps {
  sales: Sale[];
  onDeleteSale: (id: string) => void;
}

type FilterPeriod = 'all' | 'day' | 'week' | 'month' | 'custom';

export function SalesHistoryView({ sales, onDeleteSale }: SalesHistoryViewProps) {
  const [filter, setFilter] = useState<FilterPeriod>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [saleToDelete, setSaleToDelete] = useState<string | null>(null);

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
      if (filter === 'custom') {
        const start = startDate ? new Date(startDate).getTime() : 0;
        const end = endDate ? new Date(endDate + 'T23:59:59').getTime() : Infinity;
        return saleDate >= start && saleDate <= end;
      }
      return true;
    });
  }, [sales, filter, startDate, endDate]);

  const filterOptions = [
    { id: 'all', label: 'Tudo' },
    { id: 'day', label: 'Hoje' },
    { id: 'week', label: 'Esta Semana' },
    { id: 'month', label: 'Este Mês' },
    { id: 'custom', label: 'Personalizado' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Histórico de Vendas</h1>
          <p className="text-slate-500 text-sm">Visualize e gerencie todas as transações realizadas no PDV.</p>
        </div>
        
        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm overflow-x-auto no-scrollbar max-w-full">
            {filterOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setFilter(option.id as FilterPeriod)}
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
                  filter === option.id 
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" 
                    : "text-slate-500 hover:bg-slate-50"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          <AnimatePresence>
            {filter === 'custom' && (
              <motion.div 
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm overflow-hidden"
              >
                <div className="flex items-center gap-2 px-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">De</span>
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="text-xs font-bold text-slate-700 bg-slate-50 p-1.5 rounded-lg border-none focus:ring-0 cursor-pointer"
                  />
                </div>
                <div className="w-px h-4 bg-slate-200" />
                <div className="flex items-center gap-2 px-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Até</span>
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="text-xs font-bold text-slate-700 bg-slate-50 p-1.5 rounded-lg border-none focus:ring-0 cursor-pointer"
                  />
                </div>
                { (startDate || endDate) && (
                  <button 
                    onClick={() => { setStartDate(''); setEndDate(''); }}
                    className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                    title="Limpar Datas"
                  >
                    <X size={14} strokeWidth={3} />
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
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
          <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-bold">
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
              <AnimatePresence mode="popLayout" initial={false}>
                {filteredSales.length === 0 ? (
                  <motion.tr
                    key="empty"
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
                  filteredSales.map((sale, index) => (
                    <motion.tr 
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ delay: index * 0.03 }}
                      key={sale.id} 
                      className="hover:bg-slate-50 transition-colors group cursor-pointer"
                      onClick={() => setSelectedSale(sale)}
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
                        <div className="flex flex-col gap-1">
                          {sale.payments && sale.payments.length > 0 ? (
                            sale.payments.map((p, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                {p.method === 'card' && <CreditCard className="size-3 text-blue-600" />}
                                {p.method === 'cash' && <Banknote className="size-3 text-blue-600" />}
                                {p.method === 'pix' && <Smartphone className="size-3 text-blue-600" />}
                                <span className="text-xs capitalize text-slate-700">
                                  {p.method}: R${p.amount.toFixed(2)}
                                  {p.method === 'card' && p.installments && p.installments > 1 && (
                                    <span className="text-[10px] text-slate-500 ml-1">
                                      ({p.installments}x)
                                    </span>
                                  )}
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className="flex items-center gap-2">
                              {(sale as any).paymentMethod === 'card' ? (
                                <CreditCard className="size-4 text-blue-600" />
                              ) : (
                                <Banknote className="size-4 text-blue-600" />
                              )}
                              <span className="text-sm capitalize text-slate-700">
                                {(sale as any).paymentMethod === 'card' ? 'Cartão' : 'Dinheiro'}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-col items-end">
                           <span className="font-bold text-slate-900">
                             R${sale.total.toFixed(2)}
                           </span>
                           {sale.discount && sale.discount > 0 && (
                             <span className="text-[10px] font-bold text-red-500">
                                Desc: -R${sale.discount.toFixed(2)}
                             </span>
                           )}
                           {sale.deliveryFee && sale.deliveryFee > 0 && (
                             <span className="text-[10px] font-bold text-blue-500">
                                Entrega: +R${sale.deliveryFee.toFixed(2)}
                             </span>
                           )}
                           {(!sale.discount && !sale.deliveryFee) && (
                             <span className="text-[10px] font-bold text-slate-400">
                                Sem Adicionais
                             </span>
                           )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            className="p-2 text-slate-400 hover:text-blue-600 transition-colors" 
                            title="Ver Detalhes"
                          >
                            <Eye className="size-4" />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSaleToDelete(sale.id);
                            }}
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

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {saleToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">Confirmar Exclusão?</h3>
                <p className="text-slate-500 text-sm mb-8">
                  Esta ação não pode ser desfeita. O registro da venda será removido permanentemente do histórico.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSaleToDelete(null)}
                    className="px-6 py-3 rounded-2xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200 transition-colors"
                  >
                    Calcelar
                  </button>
                  <button
                    onClick={() => {
                      onDeleteSale(saleToDelete);
                      setSaleToDelete(null);
                    }}
                    className="px-6 py-3 rounded-2xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sale Details Modal */}
      <AnimatePresence>
        {selectedSale && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight">Detalhes da Venda</h3>
                  <p className="text-xs text-slate-500 font-mono">ID: #{selectedSale.id.toUpperCase()}</p>
                </div>
                <button 
                  onClick={() => setSelectedSale(null)}
                  className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-1.5 border-r border-slate-200 pr-4">
                      <Calendar className="size-4 text-slate-400" />
                      <span className="font-medium">{new Date(selectedSale.timestamp).toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Receipt className="size-4 text-slate-400" />
                      <span className="font-medium">{selectedSale.items.reduce((acc, i) => acc + i.quantity, 0)} Itens Comprados</span>
                    </div>
                  </div>

                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                        <th className="py-2">Produto</th>
                        <th className="py-2 text-center">Un.</th>
                        <th className="py-2 text-center">Qtd.</th>
                        <th className="py-2 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedSale.items.map((item) => (
                        <tr key={item.id} className="text-sm">
                          <td className="py-3 font-bold text-slate-900">{item.name}</td>
                          <td className="py-3 text-center text-slate-500 font-mono">R${item.price.toFixed(2)}</td>
                          <td className="py-3 text-center font-black text-slate-900">{item.quantity}</td>
                          <td className="py-3 text-right font-black text-blue-600">R${(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-200">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">Subtotal</span>
                    <span className="font-bold text-slate-900">R${selectedSale.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">Imposto (8%)</span>
                    <span className="font-bold text-slate-900">R${selectedSale.tax.toFixed(2)}</span>
                  </div>
                  {selectedSale.discount && selectedSale.discount > 0 && (
                    <div className="flex justify-between text-sm text-red-500">
                      <span className="font-medium">Desconto</span>
                      <span className="font-bold">- R${selectedSale.discount.toFixed(2)}</span>
                    </div>
                  )}
                  {selectedSale.deliveryFee && selectedSale.deliveryFee > 0 && (
                    <div className="flex justify-between text-sm text-blue-500">
                      <span className="font-medium">Taxa de Entrega</span>
                      <span className="font-bold">+ R${selectedSale.deliveryFee.toFixed(2)}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between items-center p-4 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-600/20">
                  <span className="font-black uppercase tracking-widest text-xs opacity-80">Total Pago</span>
                  <span className="text-3xl font-black">R${selectedSale.total.toFixed(2)}</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
