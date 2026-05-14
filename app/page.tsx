'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Navbar } from '@/components/Navbar';
import { Product, CartItem, Sale } from '@/types';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Dynamic imports for view components to split chunks and prevent ChunkLoadError
const InventoryView = dynamic(() => import('@/components/InventoryView').then(mod => mod.InventoryView), {
  loading: () => <div className="flex-1 flex items-center justify-center bg-slate-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
});

const POSView = dynamic(() => import('@/components/POSView').then(mod => mod.POSView), {
  loading: () => <div className="flex-1 flex items-center justify-center bg-slate-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
});

const SalesHistoryView = dynamic(() => import('@/components/SalesHistoryView').then(mod => mod.SalesHistoryView), {
  loading: () => <div className="flex-1 flex items-center justify-center bg-slate-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
});

const ReportsView = dynamic(() => import('@/components/ReportsView').then(mod => mod.ReportsView), {
  loading: () => <div className="flex-1 flex items-center justify-center bg-slate-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
});

const LoginView = dynamic(() => import('@/components/LoginView').then(mod => mod.LoginView), {
  loading: () => <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
});

const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'MacBook Pro M2',
    sku: 'MBP-2023-SIL',
    category: 'Eletrônicos',
    price: 2499.00,
    costPrice: 1800.00,
    stock: 12,
    lowStockThreshold: 5,
    image: 'https://picsum.photos/seed/macbook/400/400'
  },
  {
    id: '2',
    name: 'Cadeira Ergonômica',
    sku: 'FUR-ERGO-01',
    category: 'Móveis',
    price: 450.00,
    costPrice: 280.00,
    stock: 3,
    lowStockThreshold: 5,
    image: 'https://picsum.photos/seed/chair/400/400'
  },
  {
    id: '3',
    name: 'Teclado Mecânico',
    sku: 'ACC-KBD-RGB',
    category: 'Hardware',
    price: 129.00,
    costPrice: 75.00,
    stock: 0,
    lowStockThreshold: 10,
    image: 'https://picsum.photos/seed/keyboard/400/400'
  },
  {
    id: '4',
    name: 'Café Orgânico',
    sku: 'COF-ORG-01',
    category: 'Orgânicos',
    price: 12.50,
    costPrice: 6.00,
    stock: 14,
    lowStockThreshold: 10,
    image: 'https://picsum.photos/seed/coffee/400/400'
  },
  {
    id: '5',
    name: 'Pão Integral',
    sku: 'BRD-WHT-01',
    category: 'Padaria',
    price: 3.20,
    costPrice: 1.50,
    stock: 8,
    lowStockThreshold: 20,
    image: 'https://picsum.photos/seed/bread/400/400'
  }
];

export default function Home() {
  const [activeView, setActiveView] = useState<'inventory' | 'pos' | 'sales' | 'reports'>('inventory');
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(true);
  const [isDatabaseReady, setIsDatabaseReady] = useState(true);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Check for session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setIsAuthReady(true);
      }
    };
    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      setSession(data.session);
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Check for demo credentials as a fallback
      const isDemoUser = (email === 'admin@stockflow.com' && password === 'admin123') || 
                        (email === 'francisco.ruan.sousa@uemasul.edu.br' && password === 'admin123');

      if (isDemoUser) {
        console.warn('Using demo credentials fallback.');
        setSession({ user: { email: email } });
        setAuthError(null);
        return;
      }

      // Specific handling for network errors (Failed to fetch)
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        const errorMsg = 'Não foi possível conectar ao Supabase. Verifique sua conexão ou se a URL do Supabase está correta nas variáveis de ambiente.';
        setAuthError(errorMsg);
        
        // If it failed to fetch, Supabase is effectively not configured or unreachable
        setIsConfigured(false);
        return;
      }

      setAuthError(error.message || 'Erro ao fazer login. Verifique suas credenciais.');
      
      // If not configured, remind about demo credentials
      if (!isConfigured) {
        setAuthError('Supabase não configurado. Use as credenciais de demonstração: admin@stockflow.com / admin123');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleResetPassword = async (email: string) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin
      });
      if (error) throw error;
      setAuthError('Link de recuperação enviado para seu e-mail!');
    } catch (error: any) {
      console.error('Reset error:', error);
      setAuthError(error.message || 'Erro ao enviar e-mail de recuperação.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
    } catch (error) {
      console.error('Logout error:', error);
      setSession(null); // Force logout locally
    }
  };

  // Check Supabase configuration on mount
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    const hasUrl = url.trim() !== '' && !url.includes('your-project') && !url.includes('YOUR_SUPABASE_URL');
    const hasKey = key.trim() !== '' && key.length > 50; // Supabase keys are long

    if (!hasUrl || !hasKey) {
      console.warn('Supabase is not configured. Using local storage fallback.');
      setIsConfigured(false);
      setProducts(INITIAL_PRODUCTS);
      setLoading(false);
    }
  }, []);

  // Fetch initial data from Supabase
  useEffect(() => {
    if (!session || !isConfigured) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (productsError) throw productsError;
        
        // Map snake_case to camelCase
        const mappedProducts = (productsData || []).map((p: any) => ({
          ...p,
          costPrice: p.cost_price,
          lowStockThreshold: p.low_stock_threshold || 5
        }));
        setProducts(mappedProducts);

        // Fetch sales with items
        const { data: salesData, error: salesError } = await supabase
          .from('sales')
          .select(`
            *,
            items:sale_items(*)
          `)
          .order('timestamp', { ascending: false });

        if (salesError) throw salesError;
        
        // Map snake_case to camelCase for sales
        const mappedSales = (salesData || []).map((s: any) => ({
          ...s,
          deliveryFee: s.delivery_fee || 0,
          installmentValue: s.installment_value,
          items: (s.items || []).map((i: any) => ({
            ...i,
            id: i.product_id || i.id // Map product_id to id for consistency with Product type
          }))
        }));
        setSales(mappedSales);
      } catch (error: any) {
        let errorMessage = 'Erro desconhecido';
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === 'object' && error !== null) {
          errorMessage = error.message || error.error_description || error.error || JSON.stringify(error);
        } else {
          errorMessage = String(error);
        }
        
        console.error('Error fetching data from Supabase:', errorMessage);
        
        // Specific check for missing tables or columns or network issues
        if (
          errorMessage.includes('public.products') || 
          errorMessage.includes('schema cache') || 
          errorMessage.includes('cost_price') ||
          errorMessage.includes('installment_value')
        ) {
          setIsDatabaseReady(false);
        }

        if (errorMessage.includes('Failed to fetch')) {
          console.warn('Network error fetching from Supabase. Falling back to local data.');
          setIsConfigured(false);
        }

        // Fallback to initial data if Supabase is not configured yet or unreachable
        setProducts(INITIAL_PRODUCTS);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, isConfigured]);

  const handleAddProduct = async (newProduct: Omit<Product, 'id'>) => {
    if (!isConfigured || !isDatabaseReady) {
      const product: Product = {
        ...newProduct,
        id: Math.random().toString(36).substr(2, 9)
      };
      setProducts(prev => [product, ...prev]);
      return;
    }

    try {
      // Map camelCase to snake_case
      const { costPrice, lowStockThreshold, ...rest } = newProduct;
      const supabaseProduct = {
        ...rest,
        cost_price: costPrice,
        low_stock_threshold: lowStockThreshold
      };

      let { data, error } = await supabase
        .from('products')
        .insert([supabaseProduct])
        .select()
        .single();

      // Fallback if columns are missing
      if (error && (error.message.includes('cost_price') || error.message.includes('low_stock_threshold'))) {
        console.warn('Columns missing, retrying without cost_price and low_stock_threshold');
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('products')
          .insert([rest])
          .select()
          .single();
        
        if (fallbackError) throw fallbackError;
        data = fallbackData;
        setIsDatabaseReady(false); // Alert user that schema is out of sync
      } else if (error) {
        throw error;
      }
      
      // Map back to camelCase
      const mappedData = {
        ...data,
        costPrice: data.cost_price || 0,
        lowStockThreshold: data.low_stock_threshold || 5
      };
      setProducts(prev => [mappedData, ...prev]);
    } catch (error: any) {
      let errorMessage = 'Erro adicionando produto ao Supabase';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        errorMessage = error.message || error.error_description || error.error || JSON.stringify(error);
      } else {
        errorMessage = String(error);
      }
      
      console.error('Error adding product to Supabase:', errorMessage);
      
      // Check for missing columns
      if (errorMessage.includes('cost_price') || errorMessage.includes('low_stock_threshold')) {
        setIsDatabaseReady(false);
      }
      
      // Fallback local update
      const product: Product = {
        ...newProduct,
        id: Math.random().toString(36).substr(2, 9)
      };
      setProducts(prev => [product, ...prev]);
    }
  };

  const handleUpdateProduct = async (id: string, updatedProduct: Partial<Product>) => {
    if (!isConfigured || !isDatabaseReady) {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedProduct } : p));
      return;
    }

    try {
      // Map camelCase to snake_case
      const { costPrice, lowStockThreshold, ...rest } = updatedProduct;
      const supabaseUpdate = {
        ...rest,
        ...(costPrice !== undefined ? { cost_price: costPrice } : {}),
        ...(lowStockThreshold !== undefined ? { low_stock_threshold: lowStockThreshold } : {})
      };

      let { data, error } = await supabase
        .from('products')
        .update(supabaseUpdate)
        .eq('id', id)
        .select()
        .single();

      // Fallback if columns are missing
      if (error && (error.message.includes('cost_price') || error.message.includes('low_stock_threshold'))) {
        console.warn('Columns missing during update, retrying without cost_price and low_stock_threshold');
        const { cost_price, low_stock_threshold, ...fallbackUpdate } = supabaseUpdate as any;
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('products')
          .update(fallbackUpdate)
          .eq('id', id)
          .select()
          .single();
        
        if (fallbackError) throw fallbackError;
        data = fallbackData;
        setIsDatabaseReady(false);
      } else if (error) {
        throw error;
      }
      
      // Map back to camelCase
      const mappedData = {
        ...data,
        costPrice: data.cost_price || 0,
        lowStockThreshold: data.low_stock_threshold || 5
      };
      setProducts(prev => prev.map(p => p.id === id ? mappedData : p));
    } catch (error: any) {
      let errorMessage = 'Erro atualizando produto no Supabase';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        errorMessage = error.message || error.error_description || error.error || JSON.stringify(error);
      } else {
        errorMessage = String(error);
      }
      
      console.error('Error updating product in Supabase:', errorMessage);
      
      // Check for missing columns
      if (errorMessage.includes('cost_price') || errorMessage.includes('low_stock_threshold')) {
        setIsDatabaseReady(false);
      }
      
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedProduct } : p));
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!isConfigured || !isDatabaseReady) {
      setProducts(prev => prev.filter(p => p.id !== id));
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (error: any) {
      let errorMessage = 'Erro desconhecido';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        errorMessage = error.message || error.error_description || error.error || JSON.stringify(error);
      } else {
        errorMessage = String(error);
      }
      
      console.error('Error deleting product from Supabase:', errorMessage);
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleCompleteSale = async (saleData: Omit<Sale, 'id' | 'timestamp'>) => {
    if (!isConfigured || !isDatabaseReady) {
      const newSale: Sale = {
        ...saleData,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString()
      };

      setProducts(prev => prev.map(p => {
        const cartItem = saleData.items.find(item => item.id === p.id);
        if (cartItem) {
          return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
        }
        return p;
      }));

      setSales(prev => [newSale, ...prev]);
      setShowSuccessModal(true);
      return;
    }

    try {
      // 1. Create the sale record
      const salePayload = {
        total: saleData.total,
        subtotal: saleData.subtotal,
        tax: saleData.tax,
        discount: saleData.discount || 0,
        delivery_fee: saleData.deliveryFee || 0,
        payment_method: saleData.payments[0]?.method || 'cash',
        payments: saleData.payments,
        installments: saleData.installments,
        installment_value: saleData.installmentValue
      };

      let { data: saleRecord, error: saleError } = await supabase
        .from('sales')
        .insert([salePayload])
        .select()
        .single();

      // Fallback if columns are missing in sales table
      if (saleError && (saleError.message.includes('discount') || saleError.message.includes('delivery_fee') || saleError.message.includes('payments') || saleError.message.includes('installments'))) {
        console.warn('Columns missing in sales table, retrying with minimal fields');
        const minimalPayload = {
          total: saleData.total,
          subtotal: saleData.subtotal,
          tax: saleData.tax,
          payment_method: saleData.payments[0]?.method || 'cash'
        };
        const { data: fallbackRecord, error: fallbackError } = await supabase
          .from('sales')
          .insert([minimalPayload])
          .select()
          .single();
        
        if (fallbackError) throw fallbackError;
        saleRecord = fallbackRecord;
        setIsDatabaseReady(false);
      } else if (saleError) {
        throw saleError;
      }

      // 2. Create the sale items
      const saleItems = saleData.items.map(item => ({
        sale_id: saleRecord.id,
        product_id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems);

      if (itemsError) throw itemsError;

      // 3. Update product stock in Supabase
      for (const item of saleData.items) {
        const product = products.find(p => p.id === item.id);
        if (product) {
          await supabase
            .from('products')
            .update({ stock: Math.max(0, product.stock - item.quantity) })
            .eq('id', item.id);
        }
      }

      // 4. Update local state
      const newSale: Sale = {
        ...saleData,
        id: saleRecord.id,
        timestamp: saleRecord.timestamp,
        items: saleData.items // Keep the original items for local state
      };

      setProducts(prev => prev.map(p => {
        const cartItem = saleData.items.find(item => item.id === p.id);
        if (cartItem) {
          return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
        }
        return p;
      }));

      setSales(prev => [newSale, ...prev]);
      setShowSuccessModal(true);
    } catch (error: any) {
      let errorMessage = 'Erro desconhecido';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        errorMessage = error.message || error.error_description || error.error || JSON.stringify(error);
      } else {
        errorMessage = String(error);
      }
      
      console.error('Error completing sale in Supabase:', errorMessage);
      // Fallback local update
      const newSale: Sale = {
        ...saleData,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString()
      };

      setProducts(prev => prev.map(p => {
        const cartItem = saleData.items.find(item => item.id === p.id);
        if (cartItem) {
          return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
        }
        return p;
      }));

      setSales(prev => [newSale, ...prev]);
      setShowSuccessModal(true);
    }
  };

  const closeModal = () => {
    setShowSuccessModal(false);
  };

  const handleDeleteSale = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este registro de venda? O estoque dos produtos será recuperado.')) {
      const saleToDelete = sales.find(s => s.id === id);
      if (!saleToDelete) return;

      if (!isConfigured || !isDatabaseReady) {
        // Recover stock locally
        setProducts(prev => prev.map(p => {
          const saleItem = saleToDelete.items.find(item => item.id === p.id);
          if (saleItem) {
            return { ...p, stock: p.stock + saleItem.quantity };
          }
          return p;
        }));
        setSales(prev => prev.filter(s => s.id !== id));
        return;
      }

      try {
        // 1. Delete the sale from Supabase
        // (sale_items will be deleted automatically due to CASCADE in the schema)
        const { error } = await supabase
          .from('sales')
          .delete()
          .eq('id', id);

        if (error) throw error;

        // 2. Recover stock in Supabase for each product in the sale
        for (const item of saleToDelete.items) {
          const product = products.find(p => p.id === item.id);
          if (product) {
            await supabase
              .from('products')
              .update({ stock: product.stock + item.quantity })
              .eq('id', item.id);
          }
        }

        // 3. Update local state
        setProducts(prev => prev.map(p => {
          const saleItem = saleToDelete.items.find(item => item.id === p.id);
          if (saleItem) {
            return { ...p, stock: p.stock + saleItem.quantity };
          }
          return p;
        }));
        
        setSales(prev => prev.filter(s => s.id !== id));
      } catch (error) {
        console.error('Error deleting sale from Supabase:', error);
        // Fallback local update if delete from DB failed? Or maybe just keep UI in sync.
        // If delete failed, it's safer to not filter sales locally.
        alert('Erro ao excluir a venda. Por favor, tente novamente.');
      }
    }
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <LoginView 
        onLogin={handleLogin} 
        onForgotPassword={handleResetPassword}
        error={authError} 
        loading={authLoading} 
      />
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar activeView={activeView} onViewChange={setActiveView} products={products} onLogout={handleLogout} session={session} />
      
      {!isConfigured && !bannerDismissed && (
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold">i</span>
            </div>
            <p className="text-sm text-blue-800">
              <span className="font-bold text-blue-900">Modo de Demonstração Habilitado:</span> O Supabase ainda não foi configurado. Seus dados serão perdidos ao atualizar a página. 
              <button 
                onClick={() => setShowSetupModal(true)} 
                className="ml-2 underline font-bold hover:text-blue-900 transition-colors"
              >
                Como configurar persistência real?
              </button>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowSetupModal(true)}
              className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md shadow-blue-600/20 active:scale-95"
            >
              Configurar Agora
            </button>
            <button 
              onClick={() => setBannerDismissed(true)} 
              className="text-blue-400 hover:text-blue-600 transition-colors p-1"
              title="Ignorar aviso"
            >
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      )}

      {isConfigured && !isDatabaseReady && !bannerDismissed && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-8 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 font-bold">!</span>
            </div>
            <p className="text-sm text-red-800">
              <span className="font-bold">Erro de Esquema:</span> O Supabase está conectado, mas algumas colunas (como <code className="bg-red-100 px-1 rounded">cost_price</code> ou <code className="bg-red-100 px-1 rounded">low_stock_threshold</code>) estão faltando na tabela <code className="bg-red-100 px-1 rounded">products</code>. 
              <button 
                onClick={() => {
                  const sql = `-- Initial Schema for StockFlow ERP\n\nCREATE TABLE IF NOT EXISTS products (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  name TEXT NOT NULL,\n  sku TEXT UNIQUE NOT NULL,\n  category TEXT NOT NULL,\n  price DECIMAL(10, 2) NOT NULL,\n  cost_price DECIMAL(10, 2) NOT NULL DEFAULT 0,\n  low_stock_threshold INTEGER NOT NULL DEFAULT 5,\n  stock INTEGER NOT NULL DEFAULT 0,\n  image TEXT,\n  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL\n);\n\n-- Fix for existing tables missing columns\nDO $$\nBEGIN\n    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='cost_price') THEN\n        ALTER TABLE products ADD COLUMN cost_price DECIMAL(10, 2) NOT NULL DEFAULT 0;\n    END IF;\n    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='low_stock_threshold') THEN\n        ALTER TABLE products ADD COLUMN low_stock_threshold INTEGER NOT NULL DEFAULT 5;\n    END IF;\nEND $$;\n\nCREATE TABLE IF NOT EXISTS sales (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  total DECIMAL(10, 2) NOT NULL,\n  subtotal DECIMAL(10, 2) NOT NULL,\n  tax DECIMAL(10, 2) NOT NULL,\n  discount DECIMAL(10, 2) DEFAULT 0,\n  delivery_fee DECIMAL(10, 2) DEFAULT 0,\n  payment_method TEXT NOT NULL,\n  payments JSONB DEFAULT '[]'::jsonb,\n  installments INTEGER DEFAULT 1,\n  installment_value DECIMAL(10, 2),\n  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL\n);\n\n-- Fix for existing tables missing columns in sales\nDO $$\nBEGIN\n    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sales' AND column_name='discount') THEN\n        ALTER TABLE sales ADD COLUMN discount DECIMAL(10, 2) DEFAULT 0;\n    END IF;\n    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sales' AND column_name='delivery_fee') THEN\n        ALTER TABLE sales ADD COLUMN delivery_fee DECIMAL(10, 2) DEFAULT 0;\n    END IF;\n    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sales' AND column_name='payments') THEN\n        ALTER TABLE sales ADD COLUMN payments JSONB DEFAULT '[]'::jsonb;\n    END IF;\n    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sales' AND column_name='installments') THEN\n        ALTER TABLE sales ADD COLUMN installments INTEGER DEFAULT 1;\n    END IF;\n    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sales' AND column_name='installment_value') THEN\n        ALTER TABLE sales ADD COLUMN installment_value DECIMAL(10, 2);\n    END IF;\nEND $$;\n\nCREATE TABLE IF NOT EXISTS sale_items (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,\n  product_id UUID REFERENCES products(id),\n  name TEXT NOT NULL,\n  price DECIMAL(10, 2) NOT NULL,\n  quantity INTEGER NOT NULL,\n  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL\n);\n\nALTER TABLE products ENABLE ROW LEVEL SECURITY;\nALTER TABLE sales ENABLE ROW LEVEL SECURITY;\nALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;\n\nCREATE POLICY "Allow all access to products" ON products FOR ALL USING (true) WITH CHECK (true);\nCREATE POLICY "Allow all access to sales" ON sales FOR ALL USING (true) WITH CHECK (true);\nCREATE POLICY "Allow all access to sale_items" ON sale_items FOR ALL USING (true) WITH CHECK (true);\n\n-- Force schema cache reload\nNOTIFY pgrst, 'reload schema';`;
                  navigator.clipboard.writeText(sql);
                  alert('SQL copiado! Cole no SQL Editor do Supabase e clique em Run.');
                }}
                className="ml-2 underline font-bold hover:text-red-900"
              >
                Copiar SQL de Migração
              </button>
            </p>
          </div>
          <button 
            onClick={() => setBannerDismissed(true)} 
            className="text-red-500 hover:text-red-700 text-xs font-bold uppercase tracking-wider"
          >
            Ignorar
          </button>
        </div>
      )}
      
      <div className="flex-1 overflow-auto relative">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center h-full"
            >
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </motion.div>
          ) : activeView === 'inventory' ? (
            <motion.div
              key="inventory"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <InventoryView 
                products={products} 
                onAddProduct={handleAddProduct} 
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct} 
              />
            </motion.div>
          ) : activeView === 'pos' ? (
            <motion.div
              key="pos"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <POSView 
                products={products} 
                onCompleteSale={handleCompleteSale} 
              />
            </motion.div>
          ) : activeView === 'sales' ? (
            <motion.div
              key="sales"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <SalesHistoryView 
                sales={sales}
                onDeleteSale={handleDeleteSale}
              />
            </motion.div>
          ) : (
            <motion.div
              key="reports"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <ReportsView 
                sales={sales}
                products={products}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="px-10 py-6 border-t border-slate-200 text-center text-slate-500 text-xs bg-white">
        <p>© {new Date().getFullYear()} StockFlow ERP Systems. Todos os direitos reservados. Módulo de Gestão de Inventário v2.4.1</p>
      </footer>

      <AnimatePresence>
        {showSetupModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4"
            onClick={() => setShowSetupModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[32px] p-8 shadow-2xl max-w-2xl w-full relative overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setShowSetupModal(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>

              <h2 className="text-3xl font-black text-slate-900 mb-2">Habilitar Persistência Real</h2>
              <p className="text-slate-500 mb-8 font-medium italic">Siga estes passos rápidos para salvar seus dados permanentemente.</p>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="size-10 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0 font-bold text-blue-600 border border-blue-200">1</div>
                  <div>
                    <p className="font-bold text-slate-900">Crie um projeto no Supabase</p>
                    <p className="text-sm text-slate-500">Acesse <a href="https://supabase.com" target="_blank" className="text-blue-600 font-bold hover:underline">supabase.com</a> e crie um novo projeto gratuito.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="size-10 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0 font-bold text-blue-600 border border-blue-200">2</div>
                  <div>
                    <p className="font-bold text-slate-900">Obtenha as credenciais da API</p>
                    <p className="text-sm text-slate-500">Vá em <span className="font-bold text-slate-700">Project Settings &gt; API</span> e copie o <span className="italic">Project URL</span> e a <span className="italic">anon public key</span>.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="size-10 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0 font-bold text-blue-600 border border-blue-200">3</div>
                  <div>
                    <p className="font-bold text-slate-900">Adicione ao AI Studio</p>
                    <p className="text-sm text-slate-500">Clique em <span className="font-bold text-slate-700">Settings</span> (ícone de engrenagem) aqui no AI Studio e adicione: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-blue-600 font-mono text-[11px] font-bold">NEXT_PUBLIC_SUPABASE_URL</code> e <code className="bg-slate-100 px-1.5 py-0.5 rounded text-blue-600 font-mono text-[11px] font-bold">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="size-10 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0 font-bold text-blue-600 border border-blue-200">4</div>
                  <div>
                    <p className="font-bold text-slate-900">Execute as Migrações SQL</p>
                    <p className="text-sm text-slate-500">O app irá detectar a conexão e poderá mostrar um erro de esquema. Clique em <span className="font-bold text-slate-700">Copiar SQL de Migração</span> no banner vermelho, cole no SQL Editor do Supabase e execute.</p>
                  </div>
                </div>
              </div>

              <div className="mt-10 p-5 bg-amber-50 rounded-[24px] border border-amber-100 flex gap-4">
                <div className="size-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0 text-amber-600 font-black">!</div>
                <p className="text-xs text-amber-900 leading-relaxed font-medium">
                  Atualmente o sistema está em <span className="font-bold">Modo de Demo</span>. Seus dados são salvos apenas na memória do navegador. Ao fechar a aba ou recarregar, tudo será resetado para o estado inicial.
                </p>
              </div>

              <button 
                onClick={() => setShowSetupModal(false)}
                className="w-full mt-8 py-5 bg-slate-900 hover:bg-black text-white rounded-2xl font-black uppercase tracking-widest transition-all active:scale-[0.98] shadow-xl shadow-slate-900/20"
              >
                Entendi, continuar em Demo
              </button>
            </motion.div>
          </motion.div>
        )}

        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full text-center relative overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Decorative background element */}
              <div className="absolute top-0 left-0 w-full h-2 bg-blue-600" />
              
              <button 
                onClick={closeModal}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="mb-6 inline-flex items-center justify-center size-20 bg-blue-100 rounded-full text-blue-600">
                <CheckCircle2 size={40} />
              </div>
              
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Venda Concluída!</h2>
              <p className="text-slate-600 mb-8 leading-relaxed">
                A transação foi processada com sucesso e o estoque foi atualizado.
              </p>
              
              <button 
                onClick={closeModal}
                className="w-full py-4 px-6 rounded-2xl font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-lg shadow-blue-600/25 active:scale-[0.98]"
              >
                Continuar Vendendo
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
