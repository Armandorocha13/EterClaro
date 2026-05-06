'use client';

import { useState, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { UploadZone } from './upload-zone';
import { Dashboard } from './dashboard';
import { BarChart3, Upload, LogIn, LogOut } from 'lucide-react';
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
  const [loading, setLoading] = useState(false);

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
            <div className="flex items-center gap-2">
              {isLoggedIn && uploadId && (
                <button
                  onClick={() => setShowUpload(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-black/80 text-white rounded-md text-sm font-semibold transition-all"
                >
                  <Upload className="h-4 w-4" />
                  Novo Upload
                </button>
              )}
              {isLoggedIn ? (
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="flex items-center gap-2 px-4 py-2 border border-black hover:bg-black hover:text-white rounded-md text-sm font-semibold transition-all"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </button>
              ) : (
                <button
                  onClick={() => router.push('/login')}
                  className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-black/80 text-white rounded-md text-sm font-semibold transition-all"
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showUpload && isLoggedIn ? (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white border border-black/10 rounded-xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold mb-6 text-center">Importar Relatório Excel</h2>
              <UploadZone onSuccess={handleUploadSuccess} />
              {uploadId && (
                <button
                  onClick={() => setShowUpload(false)}
                  className="mt-6 w-full text-center text-sm font-bold uppercase tracking-wider hover:underline"
                >
                  ← Voltar ao Dashboard
                </button>
              )}
            </div>
          </div>
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
