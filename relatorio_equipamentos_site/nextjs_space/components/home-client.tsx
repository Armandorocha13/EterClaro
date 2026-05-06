'use client';

import { useState, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { UploadZone } from './upload-zone';
import { Dashboard } from './dashboard';
import { BarChart3, Upload, LogIn, LogOut, Shield } from 'lucide-react';
import { UserManagement } from './user-management';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface UploadInfo {
  id: string;
  fileName: string;
  recordCount: number;
  createdAt: string;
}

export function HomeClient({ latestUpload }: { latestUpload: UploadInfo | null }) {
  const { data: session, status } = useSession() || {};
  const isLoggedIn = status === 'authenticated' && !!session;
  const router = useRouter();
  const [uploadId, setUploadId] = useState<string | null>(latestUpload?.id ?? null);
  const [showUpload, setShowUpload] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [loading, setLoading] = useState(false);

  const isAdmin = session?.user?.email?.toLowerCase() === 'thiagosouza@ffainfraestrutura.com.br' || (session?.user as any)?.role === 'admin';

  const handleUploadSuccess = useCallback((newUploadId: string) => {
    setUploadId(newUploadId);
    setShowUpload(false);
    toast.success('Arquivo processado com sucesso!');
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-black/10 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <div className="relative h-12 w-12 flex-shrink-0">
                <Image
                  src="/logo.png"
                  alt="Logo ETER"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="h-8 w-[1px] bg-black/10 hidden sm:block"></div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-black uppercase">
                  PROJEÇÃO DE REPOSIÇÃO DE MATERIAL CLARO - ETER
                </h1>
                <p className="text-black/60 text-xs sm:text-sm font-medium">Dashboard Corporativo de Gestão</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {uploadId && latestUpload && (
                <div className="hidden lg:flex items-center gap-2 mr-6 py-1.5 border-r border-black/10 pr-6">
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)] animate-pulse" />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-black/40 uppercase tracking-[0.2em] leading-none mb-0.5">Sistema Sincronizado</span>
                    <span className="text-[11px] font-bold text-black leading-none">{new Date(latestUpload.createdAt).toLocaleString('pt-BR')}</span>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                {isAdmin && uploadId && (
                  <>
                    <button
                      onClick={() => { setShowUpload(true); setShowUsers(false); }}
                      className="flex items-center gap-2 px-4 py-2 bg-[#020617] text-white rounded-lg hover:bg-black transition-all shadow-lg shadow-blue-200 text-xs font-black uppercase tracking-widest"
                    >
                      <Upload className="h-4 w-4" />
                      Novo Upload
                    </button>
                    <button
                      onClick={() => { setShowUsers(true); setShowUpload(false); }}
                      className="flex items-center gap-2 px-4 py-2 border-2 border-[#020617] text-[#020617] rounded-lg hover:bg-slate-50 transition-all text-xs font-black uppercase tracking-widest"
                    >
                      <Shield className="h-4 w-4" />
                      Acessos
                    </button>
                  </>
                )}
                {isLoggedIn ? (
                  <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="flex items-center gap-2 px-4 py-2 border border-black hover:bg-black hover:text-white rounded-md text-sm font-semibold transition-all shadow-sm"
                  >
                    <LogOut className="h-4 w-4" />
                    Sair
                  </button>
                ) : (
                  <button
                    onClick={() => router.push('/login')}
                    className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-black/80 text-white rounded-md text-sm font-semibold transition-all shadow-sm"
                  >
                    <LogIn className="h-4 w-4" />
                    Login
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showUpload && isLoggedIn ? (
          <UploadZone onSuccess={handleUploadSuccess} />
        ) : showUsers && isAdmin ? (
          <UserManagement onBack={() => setShowUsers(false)} />
        ) : uploadId ? (
          <Dashboard uploadId={uploadId} />
        ) : (
          <div className="text-center py-32">
            <div className="relative h-24 w-24 mx-auto mb-6 opacity-20 grayscale">
              <Image
                src="/logo.png"
                alt="Logo ETER"
                fill
                className="object-contain"
              />
            </div>
            <h2 className="text-2xl font-bold mb-2">Bem-vindo ao Sistema de Projeção</h2>
            <p className="text-black/60 mb-8 max-w-md mx-auto">Nenhum relatório foi processado recentemente. Por favor, realize o upload de um arquivo Excel para visualizar os dados.</p>
            {isLoggedIn ? (
              <button
                onClick={() => setShowUpload(true)}
                className="px-8 py-3 bg-black text-white rounded-md font-bold uppercase tracking-widest hover:bg-black/80 transition-all shadow-lg"
              >
                Fazer Upload do Relatório
              </button>
            ) : (
              <button
                onClick={() => router.push('/login')}
                className="px-8 py-3 bg-black text-white rounded-md font-bold uppercase tracking-widest hover:bg-black/80 transition-all shadow-lg"
              >
                Fazer Login para Iniciar
              </button>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-black/10 mt-12">
        <div className="max-w-[1440px] mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold uppercase tracking-widest text-black/40">
          <div>© {new Date().getFullYear()} ETER - CLARO</div>
          <div className="flex items-center gap-4">
            <span>PROJEÇÃO DE REPOSIÇÃO</span>
            <span className="h-1 w-1 bg-black/20 rounded-full"></span>
            <span>SISTEMA INTERNO</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
