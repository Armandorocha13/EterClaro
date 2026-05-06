'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, FileSpreadsheet, Loader2, AlertCircle } from 'lucide-react';

export function UploadZone({ onSuccess }: { onSuccess: (uploadId: string) => void }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File | null | undefined) => {
    if (!file) return;
    setError(null);
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
      onSuccess?.(data?.uploadId);
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
    <div className="bg-white rounded-2xl shadow-md p-8">
      <div className="text-center mb-6">
        <FileSpreadsheet className="h-12 w-12 text-blue-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800 font-display">Upload do Relatório</h2>
        <p className="text-sm text-slate-500 mt-1">Selecione o arquivo <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">relatorio_equipamento.xlsx</code></p>
      </div>

      <div
        onDragOver={(e: React.DragEvent) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => fileRef?.current?.click?.()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
          dragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50/50'
        } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
            <p className="text-sm text-slate-600 font-medium">Processando arquivo...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Upload className="h-10 w-10 text-slate-400" />
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-blue-600">Clique para selecionar</span> ou arraste o arquivo aqui
            </p>
            <p className="text-xs text-slate-400">Formatos aceitos: .xlsx, .xls</p>
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
        <div className="mt-4 flex items-start gap-2 bg-red-50 text-red-700 p-3 rounded-lg text-sm">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
        <p className="text-sm text-slate-700">
          <strong>Colunas necessárias:</strong> TÉCNICO, DESCRICAO (modelo), SERIAL e DATA
        </p>
        <p className="text-xs text-slate-500 mt-1">
          A projeção de 7 dias é arredondada para cima (ideal para reposição de material).
        </p>
      </div>
    </div>
  );
}
