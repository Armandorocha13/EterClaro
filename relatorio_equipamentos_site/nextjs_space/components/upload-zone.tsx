'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, FileSpreadsheet, Loader2, AlertCircle, CheckCircle2, ChevronLeft, Info } from 'lucide-react';

export function UploadZone({ onSuccess }: { onSuccess: (uploadId: string) => void }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File | null | undefined) => {
    if (!file) return;
    setError(null);
    setSuccess(false);
    const ext = file?.name?.split('.')?.pop()?.toLowerCase() ?? '';
    if (!['xlsx', 'xls'].includes(ext)) {
      setError('Por favor, selecione um arquivo Excel (.xlsx ou .xls)');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? 'Erro ao processar arquivo');
        return;
      }
      setSuccess(true);
      setTimeout(() => {
        onSuccess?.(data?.uploadId);
      }, 1500);
    } catch (err: any) {
      setError(err?.message ?? 'Erro de conexão');
    } finally {
      setUploading(false);
    }
  }, [onSuccess]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e?.dataTransfer?.files?.[0]);
  }, [handleFile]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-black/5">
        {/* Header Decorativo */}
        <div className="bg-gradient-to-r from-[#020617] to-[#1e293b] p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md border border-white/20">
                <FileSpreadsheet className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tight">Importar Relatório</h2>
            </div>
            <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Atualize a base de dados do sistema</p>
          </div>
        </div>

        <div className="p-10">
          <div
            onDragOver={(e: React.DragEvent) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => fileRef?.current?.click?.()}
            className={`group relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
              dragging 
                ? 'border-[#ee1111] bg-red-50' 
                : 'border-slate-200 hover:border-[#020617] hover:bg-slate-50'
            } ${uploading || success ? 'pointer-events-none' : ''}`}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="relative">
                  <div className="h-16 w-16 border-4 border-slate-100 border-t-[#ee1111] rounded-full animate-spin" />
                  <Loader2 className="h-6 w-6 text-[#ee1111] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <div>
                  <p className="text-sm font-black text-[#020617] uppercase tracking-widest">Processando dados</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Isso pode levar alguns segundos...</p>
                </div>
              </div>
            ) : success ? (
              <div className="flex flex-col items-center gap-4 py-4 animate-in zoom-in duration-300">
                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-black text-green-700 uppercase tracking-widest">Upload Concluído!</p>
                  <p className="text-[10px] text-green-600/60 font-bold uppercase mt-1">Sincronizando dashboard...</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-white group-hover:shadow-lg transition-all duration-300">
                  <Upload className={`h-8 w-8 ${dragging ? 'text-[#ee1111]' : 'text-slate-400 group-hover:text-[#020617]'}`} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-600">
                    <span className="text-[#020617] font-black underline decoration-[#ee1111] decoration-2 underline-offset-4">Clique para selecionar</span> ou arraste o arquivo aqui
                  </p>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2">Formatos aceitos: .xlsx, .xls</p>
                </div>
              </div>
            )}
            
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFile(e?.target?.files?.[0])}
            />
          </div>

          {error && (
            <div className="mt-6 animate-in slide-in-from-top-2 duration-300">
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-[#ee1111] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-black text-red-900 uppercase tracking-widest mb-1">Erro no Processamento</p>
                  <p className="text-xs text-red-700 font-bold">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-10 grid grid-cols-1 gap-4">
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <div className="flex items-center gap-2 mb-3">
                <Info className="h-4 w-4 text-[#020617]" />
                <h4 className="text-[10px] font-black text-black/40 uppercase tracking-widest">Requisitos do Arquivo</h4>
              </div>
              <p className="text-xs font-bold text-slate-700 leading-relaxed">
                Certifique-se de que o arquivo contém as colunas: <span className="text-[#ee1111]">TÉCNICO</span>, <span className="text-[#ee1111]">DESCRICAO</span> (modelo), <span className="text-[#ee1111]">SERIAL</span> e <span className="text-[#ee1111]">DATA</span>.
              </p>
            </div>
          </div>
        </div>
      </div>

      <button 
        onClick={() => window.location.reload()}
        className="mt-8 flex items-center gap-2 mx-auto text-[10px] font-black text-black/40 uppercase tracking-[0.2em] hover:text-[#ee1111] transition-colors"
      >
        <ChevronLeft className="h-3 w-3" />
        Voltar ao Dashboard
      </button>
    </div>
  );
}
