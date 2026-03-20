'use client';

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { TrendingUp, Package, DollarSign, ShoppingBag, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Sale, Product } from '@/types';
import { motion } from 'motion/react';

interface ReportsViewProps {
  sales: Sale[];
  products: Product[];
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function ReportsView({ sales, products }: ReportsViewProps) {
  const productSalesData = useMemo(() => {
    const stats: Record<string, { name: string, quantity: number, revenue: number }> = {};

    sales.forEach(sale => {
      sale.items.forEach(item => {
        if (!stats[item.id]) {
          stats[item.id] = { name: item.name, quantity: 0, revenue: 0 };
        }
        stats[item.id].quantity += item.quantity;
        stats[item.id].revenue += item.price * item.quantity;
      });
    });

    return Object.values(stats).sort((a, b) => b.quantity - a.quantity);
  }, [sales]);

  const totalRevenue = useMemo(() => sales.reduce((acc, s) => acc + s.total, 0), [sales]);
  const totalItemsSold = useMemo(() => sales.reduce((acc, s) => acc + s.items.reduce((sum, i) => sum + i.quantity, 0), 0), [sales]);
  const averageTicket = sales.length > 0 ? totalRevenue / sales.length : 0;

  const topProducts = productSalesData.slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Relatórios e Insights</h1>
          <p className="text-slate-500 text-sm">Análise detalhada de vendas e desempenho de produtos.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Receita Total', value: `R$ ${totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Itens Vendidos', value: totalItemsSold, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Ticket Médio', value: `R$ ${averageTicket.toFixed(2)}`, icon: ShoppingBag, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Total de Vendas', value: sales.length, icon: TrendingUp, color: 'text-violet-600', bg: 'bg-violet-50' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bg} p-3 rounded-xl`}>
                <stat.icon className={`size-6 ${stat.color}`} />
              </div>
              <div className="flex items-center gap-1 text-emerald-500 text-xs font-bold">
                <ArrowUpRight className="size-3" />
                12%
              </div>
            </div>
            <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Products Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
        >
          <h3 className="text-lg font-bold text-slate-900 mb-6">Top 5 Produtos (Quantidade)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="vertical" margin={{ left: 40, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={100} 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="quantity" radius={[0, 4, 4, 0]} barSize={32}>
                  {topProducts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Revenue Distribution */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
        >
          <h3 className="text-lg font-bold text-slate-900 mb-6">Distribuição de Receita</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={topProducts}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="revenue"
                >
                  {topProducts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {topProducts.map((product, i) => (
              <div key={product.name} className="flex items-center gap-2">
                <div className="size-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                <span className="text-xs text-slate-600 truncate">{product.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Detailed Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">Desempenho por Produto</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Produto</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Qtd. Vendida</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Receita Total</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Participação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {productSalesData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    Nenhum dado de vendas disponível.
                  </td>
                </tr>
              ) : (
                productSalesData.map((item) => (
                  <tr key={item.name} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-slate-900">{item.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">{item.quantity} unidades</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-900">R$ {item.revenue.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 rounded-full" 
                            style={{ width: `${(item.revenue / totalRevenue * 100) || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-bold text-slate-500 w-10">
                          {((item.revenue / totalRevenue * 100) || 0).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
