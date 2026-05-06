'use client';

import type { TecnicoModeloStats } from '@/lib/excel-utils';
import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

type SortKey = 'tecnico' | 'modelo' | 'qtdTotal' | 'mediaDiaria' | 'projecao7Dias';

export function DetailTable({ data }: { data: TecnicoModeloStats[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('projecao7Dias');
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = [...(data ?? [])].sort((a: TecnicoModeloStats, b: TecnicoModeloStats) => {
    const aVal = a?.[sortKey] ?? '';
    const bVal = b?.[sortKey] ?? '';
    if (typeof aVal === 'string') return sortAsc ? (aVal as string).localeCompare(bVal as string) : (bVal as string).localeCompare(aVal as string);
    return sortAsc ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return null;
    return sortAsc ? <ChevronUp className="h-3 w-3 inline" /> : <ChevronDown className="h-3 w-3 inline" />;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <h2 className="text-sm font-bold text-slate-700 mb-3">Tabela Detalhada — Técnico × Modelo</h2>
      <div className="max-h-[500px] overflow-auto border border-slate-200 rounded-lg">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="bg-slate-50">
              <th onClick={() => toggleSort('tecnico')} className="text-left px-3 py-2.5 font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 whitespace-nowrap border-b-2 border-slate-200">Técnico <SortIcon col="tecnico" /></th>
              <th onClick={() => toggleSort('modelo')} className="text-left px-3 py-2.5 font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 whitespace-nowrap border-b-2 border-slate-200">Modelo <SortIcon col="modelo" /></th>
              <th onClick={() => toggleSort('qtdTotal')} className="text-right px-3 py-2.5 font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 whitespace-nowrap border-b-2 border-slate-200">Qtd Total <SortIcon col="qtdTotal" /></th>
              <th className="text-right px-3 py-2.5 font-semibold text-slate-700 whitespace-nowrap border-b-2 border-slate-200">Dias Rel.</th>
              <th onClick={() => toggleSort('mediaDiaria')} className="text-right px-3 py-2.5 font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 whitespace-nowrap border-b-2 border-slate-200">Média Diária <SortIcon col="mediaDiaria" /></th>
              <th onClick={() => toggleSort('projecao7Dias')} className="text-right px-3 py-2.5 font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 whitespace-nowrap border-b-2 border-slate-200">Proj. 7 Dias <SortIcon col="projecao7Dias" /></th>
            </tr>
          </thead>
          <tbody>
            {sorted?.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-slate-400">Nenhum dado encontrado</td></tr>
            ) : sorted.map((row: TecnicoModeloStats, i: number) => (
              <tr key={`${row?.tecnico}-${row?.modelo}-${i}`} className="hover:bg-blue-50/50 transition-colors">
                <td className="px-3 py-2 font-medium text-blue-700 border-b border-slate-100">{row?.tecnico?.toUpperCase?.() ?? ''}</td>
                <td className="px-3 py-2 border-b border-slate-100">{row?.modelo ?? ''}</td>
                <td className="px-3 py-2 text-right font-mono border-b border-slate-100">{row?.qtdTotal ?? 0}</td>
                <td className="px-3 py-2 text-right font-mono text-slate-500 border-b border-slate-100">{row?.diasRelatorio ?? 0}</td>
                <td className="px-3 py-2 text-right font-mono border-b border-slate-100">{row?.mediaDiaria?.toFixed?.(2) ?? '0.00'}</td>
                <td className="px-3 py-2 text-right font-mono font-bold border-b border-slate-100 bg-amber-50/50">{row?.projecao7Dias ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
