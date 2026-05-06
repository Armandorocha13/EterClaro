'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Eye, EyeOff, UserPlus, ArrowLeft } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        setError('E-mail ou senha inválidos');
      } else {
        router.replace('/');
      }
    } catch {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col font-sans text-[#202124]">
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[480px] bg-white rounded-[40px] shadow-[0_10px_40px_rgba(0,0,0,0.04)] p-12 sm:p-16 flex flex-col items-center">
          
          {/* Logo Area */}
          <div className="relative h-20 w-20 mb-8">
            <Image
              src="/logo.png"
              alt="Logo ETER"
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Titles */}
          <h1 className="text-[28px] font-bold text-[#0f172a] mb-2 tracking-tight">Área Administrativa</h1>
          <p className="text-sm text-gray-400 mb-12">Acesse para gerenciar relatórios</p>

          <form onSubmit={handleSubmit} className="w-full space-y-8">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em] ml-1">Endereço de Email</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 transition-colors group-focus-within:text-[#0f172a]" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-[#f8fafc] border border-gray-100 rounded-full focus:bg-white focus:ring-1 focus:ring-gray-200 outline-none font-medium text-sm text-[#0f172a] placeholder:text-gray-300 transition-all"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em] ml-1">Senha de Acesso</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 transition-colors group-focus-within:text-[#0f172a]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-14 pr-14 py-4 bg-[#f8fafc] border border-gray-100 rounded-full focus:bg-white focus:ring-1 focus:ring-gray-200 outline-none font-medium text-sm text-[#0f172a] placeholder:text-gray-300 transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-xs text-center font-bold text-red-500 bg-red-50 py-3 rounded-full border border-red-100 animate-shake">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0f172a] text-white py-4 rounded-full font-bold text-sm hover:bg-[#1e293b] transition-all disabled:opacity-50 shadow-lg shadow-gray-200 active:scale-[0.98]"
            >
              {loading ? 'Entrando...' : 'Entrar no Sistema'}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-12 flex items-center gap-2 text-xs font-bold text-gray-500 cursor-pointer hover:text-black transition-colors group">
            <UserPlus className="w-3.5 h-3.5 text-gray-400 group-hover:text-black" />
            <span>Não tem conta? <span className="text-[#0f172a] underline underline-offset-4">Cadastre-se agora</span></span>
          </div>
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="py-6 text-center text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] shrink-0">
        © 2026 • Relatório de Instalações • Gestão de Dados
      </footer>
    </div>
  );
}
