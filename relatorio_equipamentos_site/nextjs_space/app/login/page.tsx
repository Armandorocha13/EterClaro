'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
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
        setError('E-mail ou senha incorretos');
      } else {
        router.replace('/');
      }
    } catch {
      setError('Erro ao processar login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 selection:bg-black selection:text-white">
      <div className="w-full max-w-md">
        {/* Login Card */}
        <div className="bg-white border-2 border-black rounded-sm shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 sm:p-12">
          <div className="flex flex-col items-center mb-10">
            <div className="relative h-20 w-48 mb-8">
              <Image
                src="/logo.png"
                alt="Logo ETER"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="space-y-1 text-center">
              <h1 className="text-xl font-black uppercase tracking-tighter text-black">Acesso ao Sistema</h1>
              <p className="text-[10px] font-bold text-black/40 uppercase tracking-[0.2em]">PROJEÇÃO DE MATERIAL CLARO</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-black uppercase tracking-widest block ml-1">E-mail Corporativo</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black transition-transform group-focus-within:scale-110" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-black rounded-sm focus:bg-black/5 outline-none font-bold text-sm placeholder:text-black/20 placeholder:font-medium transition-all"
                  placeholder="EX: NOME@ETER.COM.BR"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-black uppercase tracking-widest block ml-1">Senha de Acesso</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black transition-transform group-focus-within:scale-110" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 border-2 border-black rounded-sm focus:bg-black/5 outline-none font-bold text-sm placeholder:text-black/20 placeholder:font-medium transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 hover:text-black transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-black text-white text-[10px] font-black uppercase tracking-widest px-4 py-3 border-2 border-black text-center animate-shake">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-4 rounded-sm font-black uppercase tracking-[0.2em] text-xs hover:bg-white hover:text-black border-2 border-black transition-all disabled:opacity-30 active:translate-y-1 active:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              {loading ? 'AUTENTICANDO...' : 'ENTRAR NO SISTEMA'}
            </button>
          </form>
        </div>

        <div className="mt-12 text-center space-y-4">
          <p className="text-[10px] font-black text-black/20 uppercase tracking-[0.3em]">
            ETER - Eletricidade e Telecomunicações Ltda
          </p>
          <div className="flex items-center justify-center gap-4 text-[9px] font-bold text-black/40 uppercase tracking-widest">
            <span>Privacidade</span>
            <span className="h-1 w-1 bg-black/10 rounded-full"></span>
            <span>Termos de Uso</span>
            <span className="h-1 w-1 bg-black/10 rounded-full"></span>
            <span>Suporte TI</span>
          </div>
        </div>
      </div>
    </div>
  );
}
