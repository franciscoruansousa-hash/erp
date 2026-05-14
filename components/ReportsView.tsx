'use client';

import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Sector } from 'recharts';
import { TrendingUp, Package, DollarSign, ShoppingBag, ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';
import { Sale, Product } from '@/types';
import { motion } from 'motion/react';

interface ReportsViewProps {
  sales: Sale[];
  products: Product[];
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6'];

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  type: 'bar' | 'pie';
}

const CustomTooltip = ({ active, payload, label, type }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 min-w-[240px] animate-in fade-in zoom-in duration-300">
        <div className="flex items-center gap-2 mb-3 border-b border-slate-100 pb-2">
          <div className="size-2 rounded-full" style={{ backgroundColor: payload[0].color || payload[0].fill }}></div>
          <p className="text-sm font-black text-slate-900 truncate max-w-[180px]">
            {type === 'bar' ? label : data.name}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-y-3 gap-x-4">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Vendas</span>
            <span className="text-sm font-bold text-slate-700">{data.quantity} un</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Receita</span>
            <span className="text-sm font-bold text-blue-600">
              R$ {data.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Lucro</span>
            <span className="text-sm font-bold text-emerald-600">
              R$ {(data.profit || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Margem</span>
            <span className="text-sm font-black text-indigo-600">
              {(data.margin || 0).toFixed(1)}%
            </span>
          </div>
        </div>
        <div className="mt-3 pt-2 border-t border-slate-50 flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
          <Info size={10} />
          {type === 'pie' ? 'Interativo: Arraste ou clique' : 'Detalhes do desempenho'}
        </div>
      </div>
    );
  }
  return null;
};

export function ReportsView({ sales, products }: ReportsViewProps) {
  const [activeIndex, setActiveIndex] = useState(-1);

  const productSalesData = useMemo(() => {
    const stats: Record<string, { id: string, name: string, quantity: number, revenue: number, profit: number, margin: number }> = {};

    sales.forEach(sale => {
      sale.items.forEach(item => {
        if (!stats[item.id]) {
          const product = products.find(p => p.id === item.id);
          stats[item.id] = { 
            id: item.id, 
            name: item.name, 
            quantity: 0, 
            revenue: 0,
            profit: 0,
            margin: 0
          };
        }
        const product = products.find(p => p.id === item.id);
        const cost = (product?.costPrice || 0) * item.quantity;
        const revenue = item.price * item.quantity;
        
        stats[item.id].quantity += item.quantity;
        stats[item.id].revenue += revenue;
        stats[item.id].profit += (revenue - cost);
      });
    });

    return Object.values(stats).map(item => ({
      ...item,
      margin: item.revenue > 0 ? (item.profit / item.revenue) * 100 : 0
    })).sort((a, b) => b.quantity - a.quantity);
  }, [sales, products]);

  const totalRevenue = useMemo(() => sales.reduce((acc, s) => acc + s.total, 0), [sales]);
  const totalCost = useMemo(() => {
    return sales.reduce((acc, sale) => {
      return acc + sale.items.reduce((sum, item) => {
        const product = products.find(p => p.id === item.id);
        return sum + ((product?.costPrice || 0) * item.quantity);
      }, 0);
    }, 0);
  }, [sales, products]);
  const totalProfit = totalRevenue - totalCost;
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
          { label: 'Receita Total', value: `R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Lucro Total', value: `R$ ${totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Ticket Médio', value: `R$ ${averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: ShoppingBag, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Itens Vendidos', value: totalItemsSold, icon: Package, color: 'text-violet-600', bg: 'bg-violet-50' },
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
              <div className="flex items-center gap-1 text-blue-500 text-xs font-bold">
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
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            Top 5 Produtos em Volume
          </h3>
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
                  tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc', radius: 4 }}
                  content={<CustomTooltip type="bar" />}
                />
                <Bar 
                  dataKey="quantity" 
                  radius={[0, 8, 8, 0]} 
                  barSize={24}
                  animationBegin={200}
                  animationDuration={1500}
                  animationEasing="ease-out"
                >
                  {topProducts.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                      className="hover:opacity-80 transition-opacity cursor-pointer"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Revenue Distribution */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            Distribuição de Receita
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={topProducts}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="revenue"
                  animationBegin={400}
                  animationDuration={1500}
                >
                  {topProducts.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                      stroke="none"
                      className="cursor-pointer transition-all duration-300"
                      onMouseEnter={() => setActiveIndex(index)}
                      onMouseLeave={() => setActiveIndex(-1)}
                      {...(activeIndex === index ? { outerRadius: 110 } : {})}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  content={<CustomTooltip type="pie" />}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {topProducts.map((product, i) => (
              <div key={product.id} className="flex items-center gap-2">
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
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Lucro Total</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Participação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {productSalesData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    Nenhum dado de vendas disponível.
                  </td>
                </tr>
              ) : (
                productSalesData.map((item) => {
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-slate-900">{item.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">{item.quantity} unidades</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-slate-900">R$ {item.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-emerald-600">R$ {item.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 rounded-full" 
                              style={{ width: `${(item.revenue / totalRevenue * 100) || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-bold text-slate-500 w-10">
                            {((item.revenue / totalRevenue * 100) || 0).toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
