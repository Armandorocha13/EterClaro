'use client';

import type { ResumoModelo } from '@/lib/excel-utils';

export function SummaryModelo({ data }: { data: ResumoModelo[] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <h2 className="text-sm font-bold text-slate-700 mb-3">Resumo por Modelo — Total de Reposição 7 Dias</h2>
      <div className="max-h-[500px] overflow-auto border border-slate-200 rounded-lg">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="bg-slate-50">
              <th className="text-left px-3 py-2.5 font-semibold text-slate-700 border-b-2 border-slate-200">Modelo (Descrição)</th>
              <th className="text-right px-3 py-2.5 font-semibold text-slate-700 border-b-2 border-slate-200">Qtd Total</th>
              <th className="text-right px-3 py-2.5 font-semibold text-slate-700 border-b-2 border-slate-200">Técnicos</th>
              <th className="text-right px-3 py-2.5 font-semibold text-slate-700 border-b-2 border-slate-200">Média Diária</th>
              <th className="text-right px-3 py-2.5 font-semibold text-slate-700 border-b-2 border-slate-200">Repo. 7 Dias</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? [])?.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-slate-400">Nenhum dado encontrado</td></tr>
            ) : (data ?? []).map((row: ResumoModelo, i: number) => (
              <tr key={`${row?.modelo}-${i}`} className="hover:bg-blue-50/50 transition-colors">
                <td className="px-3 py-2 font-medium border-b border-slate-100">{row?.modelo ?? ''}</td>
                <td className="px-3 py-2 text-right font-mono border-b border-slate-100">{row?.qtdTotal ?? 0}</td>
                <td className="px-3 py-2 text-right font-mono border-b border-slate-100">{row?.tecnicosQueInstalam ?? 0}</td>
                <td className="px-3 py-2 text-right font-mono border-b border-slate-100">{row?.mediaDiariaGeral?.toFixed?.(2) ?? '0.00'}</td>
                <td className="px-3 py-2 text-right font-mono font-bold border-b border-slate-100 bg-amber-50/50">{row?.reposicao7Dias ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
