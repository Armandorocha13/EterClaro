'use client';

import type { ResumoTecnico } from '@/lib/excel-utils';

function VolumeBadge({ volume }: { volume: string }) {
  const cls = (volume ?? '') === 'Alto'
    ? 'bg-red-100 text-red-700'
    : (volume ?? '') === 'Médio'
    ? 'bg-amber-100 text-amber-700'
    : 'bg-green-100 text-green-700';
  return <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>{volume ?? ''}</span>;
}

export function SummaryTecnico({ data }: { data: ResumoTecnico[] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <h2 className="text-sm font-bold text-slate-700 mb-3">👷 Resumo por Técnico — Total de Reposição 7 Dias</h2>
      <div className="max-h-[500px] overflow-auto border border-slate-200 rounded-lg">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="bg-slate-50">
              <th className="text-left px-3 py-2.5 font-semibold text-slate-700 border-b-2 border-slate-200">Técnico</th>
              <th className="text-right px-3 py-2.5 font-semibold text-slate-700 border-b-2 border-slate-200">Total Inst.</th>
              <th className="text-right px-3 py-2.5 font-semibold text-slate-700 border-b-2 border-slate-200">Dias Rel.</th>
              <th className="text-right px-3 py-2.5 font-semibold text-slate-700 border-b-2 border-slate-200">Média Diária</th>
              <th className="text-right px-3 py-2.5 font-semibold text-slate-700 border-b-2 border-slate-200">Repo. 7 Dias</th>
              <th className="text-center px-3 py-2.5 font-semibold text-slate-700 border-b-2 border-slate-200">Volume</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? [])?.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-slate-400">Nenhum dado encontrado</td></tr>
            ) : (data ?? []).map((row: ResumoTecnico, i: number) => (
              <tr key={`${row?.tecnico}-${i}`} className="hover:bg-blue-50/50 transition-colors">
                <td className="px-3 py-2 font-medium text-blue-700 border-b border-slate-100">{row?.tecnico ?? ''}</td>
                <td className="px-3 py-2 text-right font-mono border-b border-slate-100">{row?.totalInstalacoes ?? 0}</td>
                <td className="px-3 py-2 text-right font-mono text-slate-500 border-b border-slate-100">{row?.diasRelatorio ?? 0}</td>
                <td className="px-3 py-2 text-right font-mono border-b border-slate-100">{row?.mediaDiariaTotal?.toFixed?.(2) ?? '0.00'}</td>
                <td className="px-3 py-2 text-right font-mono font-bold border-b border-slate-100">{row?.reposicao7Dias ?? 0}</td>
                <td className="px-3 py-2 text-center border-b border-slate-100"><VolumeBadge volume={row?.volume ?? 'Baixo'} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
