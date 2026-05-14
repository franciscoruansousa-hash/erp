'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LogIn, Lock, Mail, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoginViewProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onForgotPassword?: (email: string) => Promise<void>;
  error?: string | null;
  loading?: boolean;
}

export function LoginView({ onLogin, onForgotPassword, error, loading }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    await onLogin(email, password);
  };

  const handleForgot = async () => {
    if (!email) {
      alert('Por favor, insira seu e-mail para recuperar a senha.');
      return;
    }
    if (onForgotPassword) {
      await onForgotPassword(email);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center size-16 bg-blue-600 rounded-2xl shadow-xl shadow-blue-600/20 mb-4">
            <ShieldCheck className="size-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">StockFlow ERP</h1>
          <p className="text-slate-500 font-medium mt-2">Acesse sua conta para gerenciar seu estoque</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2"
              >
                <AlertCircle className="size-4 shrink-0" />
                {error}
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-transparent rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-transparent rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button 
                type="button"
                onClick={handleForgot}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Esqueci minha senha?
              </button>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98] tracking-widest uppercase text-sm"
            >
              {loading ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <>
                  <LogIn className="size-5" />
                  ENTRAR NO SISTEMA
                </>
              )}
            </button>
          </form>

          <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400 font-medium">
              Não tem uma conta? <span className="text-blue-600 font-bold cursor-pointer hover:underline">Contate o administrador</span>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">© 2026 StockFlow ERP • v1.2.0</p>
        </div>
      </motion.div>
    </div>
  );
}
