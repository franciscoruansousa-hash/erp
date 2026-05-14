'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Edit2, Trash2, FileDown, Laptop, Armchair, Keyboard, Package, Barcode as BarcodeIcon, Printer, ChevronLeft, ChevronRight } from 'lucide-react';
import JsBarcode from 'jsbarcode';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Product } from '@/types';
import { cn } from '@/lib/utils';

// Form Validation Schema
const productSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório'),
  sku: z.string().optional(),
  category: z.string().min(1, 'A categoria é obrigatória'),
  price: z.number().positive('O preço deve ser um número positivo'),
  costPrice: z.number().positive('O preço de custo deve ser um número positivo'),
  stock: z.number().int().nonnegative('O estoque deve ser um número inteiro não negativo'),
  lowStockThreshold: z.number().int().positive('O limite deve ser um número inteiro positivo'),
});

type ProductFormData = z.infer<typeof productSchema>;

interface InventoryViewProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct: (id: string, product: Partial<Product>) => void;
  onDeleteProduct: (id: string) => void;
}

export function InventoryView({ products, onAddProduct, onUpdateProduct, onDeleteProduct }: InventoryViewProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      sku: '',
      category: 'Eletrônicos',
      price: 0,
      costPrice: 0,
      stock: 0,
      lowStockThreshold: 5,
    },
  });

  const watchPrice = watch('price') || 0;
  const watchCostPrice = watch('costPrice') || 0;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'Todas' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const categories = ['Todas', ...Array.from(new Set(products.map(p => p.category)))];

  const onSubmit = (data: ProductFormData) => {
    const finalSku = data.sku || `SF-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    if (editingId) {
      onUpdateProduct(editingId, {
        name: data.name,
        sku: finalSku,
        category: data.category,
        price: data.price,
        costPrice: data.costPrice,
        stock: data.stock,
        lowStockThreshold: data.lowStockThreshold,
      });
      setEditingId(null);
    } else {
      onAddProduct({
        name: data.name,
        sku: finalSku,
        category: data.category,
        price: data.price,
        costPrice: data.costPrice,
        stock: data.stock,
        lowStockThreshold: data.lowStockThreshold,
        image: `https://picsum.photos/seed/${data.name}/400/400`
      });
    }
    
    reset();
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    reset({
      name: product.name,
      sku: product.sku,
      category: product.category,
      price: product.price,
      costPrice: product.costPrice || 0,
      stock: product.stock,
      lowStockThreshold: product.lowStockThreshold || 5,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const printBarcode = (sku: string, name: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Imprimir Código de Barras - ${name}</title>
          <style>
            body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: sans-serif; }
            .label { border: 1px dashed #ccc; padding: 40px; text-align: center; }
            h2 { margin: 0 0 20px 0; font-size: 24px; }
            svg { width: 100%; max-width: 400px; }
          </style>
        </head>
        <body>
          <div class="label">
            <h2>${name}</h2>
            <svg id="barcode"></svg>
          </div>
          <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
          <script>
            window.onload = () => {
              JsBarcode("#barcode", "${sku}", {
                format: "CODE128",
                width: 2,
                height: 100,
                displayValue: true,
                fontSize: 20
              });
              setTimeout(() => {
                window.print();
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const Barcode = ({ value }: { value: string }) => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
      if (svgRef.current) {
        try {
          JsBarcode(svgRef.current, value, {
            format: "CODE128",
            width: 1.2,
            height: 30,
            displayValue: false,
            margin: 0
          });
        } catch (e) {
          console.error("Barcode generation failed", e);
        }
      }
    }, [value]);

    return <svg ref={svgRef} className="max-w-full"></svg>;
  };

  const cancelEdit = () => {
    setEditingId(null);
    reset({
      name: '',
      sku: '',
      category: 'Eletrônicos',
      price: 0,
      costPrice: 0,
      stock: 0,
      lowStockThreshold: 5,
    });
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
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {editingId ? 'Editar Produto' : 'Cadastro de Produto'}
            </h1>
            <p className="text-slate-500 text-sm">
              {editingId ? 'Atualize as informações deste item no seu catálogo.' : 'Adicione novos itens ao seu catálogo global de inventário.'}
            </p>
          </div>
          {editingId && (
            <button 
              onClick={cancelEdit}
              className="text-slate-500 hover:text-slate-700 font-semibold text-sm px-4 py-2 rounded-full border border-slate-200 hover:bg-slate-50 transition-all"
            >
              Cancelar Edição
            </button>
          )}
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Nome do Produto</label>
              <input 
                {...register('name')}
                className={cn(
                  "w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all",
                  errors.name ? "border-red-500 bg-red-50" : "border-slate-200"
                )}
                placeholder="ex: Mouse Sem Fio"
              />
              {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">SKU (Unidade de Manutenção de Estoque)</label>
              <input 
                {...register('sku')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="WM-102-BL"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Categoria</label>
              <select 
                {...register('category')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none bg-white"
              >
                <option>Eletrônicos</option>
                <option>Suprimentos de Escritório</option>
                <option>Móveis</option>
                <option>Hardware</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Preço de Custo (CMV)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">R$</span>
                <input 
                  type="number"
                  step="0.01"
                  {...register('costPrice', { valueAsNumber: true })}
                  className={cn(
                    "w-full pl-10 pr-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all",
                    errors.costPrice ? "border-red-500 bg-red-50" : "border-slate-200"
                  )}
                  placeholder="0,00"
                />
              </div>
              {errors.costPrice && <p className="text-xs text-red-500 font-medium">{errors.costPrice.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Preço de Venda (R$)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">R$</span>
                <input 
                  type="number"
                  step="0.01"
                  {...register('price', { valueAsNumber: true })}
                  className={cn(
                    "w-full pl-10 pr-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all",
                    errors.price ? "border-red-500 bg-red-50" : "border-slate-200"
                  )}
                  placeholder="0,00"
                />
              </div>
              {errors.price && <p className="text-xs text-red-500 font-medium">{errors.price.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Lucro Estimado</label>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs text-blue-600 font-bold">R$</span>
                  <input 
                    type="text"
                    readOnly
                    className="w-full pl-8 pr-2 py-2.5 rounded-xl border border-slate-100 bg-blue-50 text-blue-700 font-bold outline-none cursor-not-allowed text-sm"
                    value={(watchPrice - watchCostPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  />
                </div>
                <div className="relative">
                  <input 
                    type="text"
                    readOnly
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-100 bg-blue-50 text-blue-700 font-bold outline-none cursor-not-allowed text-sm text-center"
                    value={watchCostPrice === 0 ? '0%' : `${(((watchPrice - watchCostPrice) / watchCostPrice) * 100).toFixed(2)}%`}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Quantidade Inicial em Estoque</label>
              <input 
                type="number"
                {...register('stock', { valueAsNumber: true })}
                className={cn(
                  "w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all",
                  errors.stock ? "border-red-500 bg-red-50" : "border-slate-200"
                )}
                placeholder="0"
              />
              {errors.stock && <p className="text-xs text-red-500 font-medium">{errors.stock.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Limite de Alerta (Estoque Baixo)</label>
              <input 
                type="number"
                {...register('lowStockThreshold', { valueAsNumber: true })}
                className={cn(
                  "w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all",
                  errors.lowStockThreshold ? "border-red-500 bg-red-50" : "border-slate-200"
                )}
                placeholder="5"
              />
              {errors.lowStockThreshold && <p className="text-xs text-red-500 font-medium">{errors.lowStockThreshold.message}</p>}
            </div>
            <div className="flex items-end">
              <button 
                type="submit"
                className={cn(
                  "w-full font-bold py-3 px-6 rounded-full transition-all flex items-center justify-center gap-2 shadow-lg",
                  editingId 
                    ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20" 
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20"
                )}
              >
                {editingId ? <Edit2 className="size-5" /> : <Plus className="size-5" />}
                {editingId ? 'Salvar Alterações' : 'Cadastrar Produto'}
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
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Inventário de Produtos</h2>
            <p className="text-slate-500 text-sm">Atualmente rastreando {products.length} itens em seu catálogo.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <input 
                type="text"
                placeholder="Buscar por nome ou SKU..."
                className="w-full pl-4 pr-4 py-2 rounded-full border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="px-4 py-2 rounded-full border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <button className="flex items-center gap-2 text-blue-600 border border-blue-200 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-full text-sm font-semibold transition-colors">
              <FileDown className="size-4" />
              Exportar CSV
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Produto</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Código / SKU</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Categoria</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Custo</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Venda</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Lucro</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Estoque</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence mode="popLayout" initial={false}>
                {paginatedProducts.map((product, index) => (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ delay: index * 0.02 }}
                    key={product.id} 
                    className="hover:bg-slate-50 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4" onClick={() => handleEdit(product)}>
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden relative">
                        {product.image ? (
                          <Image 
                            src={product.image} 
                            alt={product.name} 
                            fill
                            className="object-cover" 
                            referrerPolicy="no-referrer" 
                          />
                        ) : (
                          getCategoryIcon(product.category)
                        )}
                      </div>
                      <span className="font-medium text-slate-900">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-slate-600 font-mono text-xs font-bold">{product.sku}</span>
                      <div className="h-8 w-32 bg-white border border-slate-100 rounded p-1 flex items-center justify-center overflow-hidden">
                        <Barcode value={product.sku} />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-100 text-blue-700 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-sm">R${(product.costPrice || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900">R${product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className={cn(
                        "text-xs font-bold px-2 py-0.5 rounded-lg w-fit",
                        (product.price - (product.costPrice || 0)) > 0 ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"
                      )}>
                        R$ {(product.price - (product.costPrice || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 ml-2">
                        {product.costPrice ? `${(((product.price - product.costPrice) / product.costPrice) * 100).toFixed(1)}%` : '0%'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "size-2 rounded-full",
                          product.stock > (product.lowStockThreshold || 5) ? "bg-blue-500" : product.stock > 0 ? "bg-amber-500 animate-pulse" : "bg-red-500 animate-pulse"
                        )}></span>
                        <span className={cn(
                          "text-sm font-medium",
                          product.stock <= (product.lowStockThreshold || 5) ? "text-amber-600 font-bold" : "text-slate-900"
                        )}>
                          {product.stock} Unidades
                        </span>
                      </div>
                      {product.stock <= (product.lowStockThreshold || 5) && (
                        <span className="text-[10px] text-amber-500 font-bold uppercase mt-1">
                          Estoque Baixo (Limite: {product.lowStockThreshold || 5})
                        </span>
                      )}
                    </div>
                  </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            printBarcode(product.sku, product.name);
                          }}
                          className="p-2 text-slate-400 hover:text-blue-500 transition-colors"
                          title="Imprimir Etiqueta"
                        >
                          <Printer className="size-4" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(product);
                          }}
                          className="p-2 text-slate-400 hover:text-blue-500 transition-colors"
                        >
                          <Edit2 className="size-4" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteProduct(product.id);
                          }}
                          className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <span className="text-xs text-slate-500">
            Mostrando {Math.min(filteredProducts.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(filteredProducts.length, currentPage * itemsPerPage)} de {filteredProducts.length} produtos
          </span>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-slate-200 hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="size-4 text-slate-600" />
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  // Show current, first, last, and pages around current
                  return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                })
                .map((page, index, array) => {
                  const showEllipsis = index > 0 && page - array[index - 1] > 1;
                  
                  return (
                    <React.Fragment key={page}>
                      {showEllipsis && <span className="text-slate-400 px-1 text-sm">...</span>}
                      <button 
                        onClick={() => setCurrentPage(page)}
                        className={cn(
                          "size-8 rounded-lg text-xs font-bold transition-all",
                          currentPage === page 
                            ? "bg-blue-600 text-white shadow-md shadow-blue-200" 
                            : "border border-slate-200 hover:bg-white text-slate-600"
                        )}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  );
                })}
            </div>

            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-2 rounded-lg border border-slate-200 hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="size-4 text-slate-600" />
            </button>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
