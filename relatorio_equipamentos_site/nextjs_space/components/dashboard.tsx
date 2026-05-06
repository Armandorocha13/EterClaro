'use client';

import { useState, useEffect, useMemo } from 'react';
import { Loader2, Download, Search, BarChart3, Users, Box, TrendingUp, Info } from 'lucide-react';
import { KpiCards } from './kpi-cards';
import { ChartsGrid } from './charts-grid';
import { DetailTable } from './detail-table';
import { SummaryTecnico } from './summary-tecnico';
import { SummaryModelo } from './summary-modelo';
import { SummaryModal } from './summary-modal';
import { useSession, signOut } from 'next-auth/react';
import { toast } from 'sonner';
import type { KPIs, TecnicoModeloStats, ResumoTecnico, ResumoModelo, ChartData } from '@/lib/excel-utils';

interface DashboardData {
  kpis: KPIs;
  detailTable: TecnicoModeloStats[];
  resumoTecnicos: ResumoTecnico[];
  resumoModelos: ResumoModelo[];
  chartData: ChartData;
  tecnicos: string[];
  modelos: string[];
  uploadInfo: { id: string; fileName: string; recordCount: number; createdAt: string };
}

export function Dashboard({ uploadId }: { uploadId: string }) {
  const { data: session } = useSession();
  const [view, setView] = useState<'dashboard' | 'upload'>('dashboard');
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterTecnico, setFilterTecnico] = useState('');
  const [filterModelo, setFilterModelo] = useState('');
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/data?uploadId=${uploadId}`);
        if (!res.ok) throw new Error('Erro ao carregar dados');
        const json = await res.json();
        setData(json);
        setIsModalOpen(true); // Open modal after data load
      } catch (err: any) {
        setError(err?.message ?? 'Erro');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [uploadId]);

  // Apply filters
  const filtered = useMemo(() => {
    if (!data) return null;
    const lowerSearch = (searchText ?? '').toLowerCase();
    const filteredDetail = (data?.detailTable ?? []).filter((row: TecnicoModeloStats) => {
      if (filterTecnico && row?.tecnico !== filterTecnico) return false;
      if (filterModelo && row?.modelo !== filterModelo) return false;
      if (lowerSearch && !(row?.tecnico ?? '').toLowerCase().includes(lowerSearch) && !(row?.modelo ?? '').toLowerCase().includes(lowerSearch)) return false;
      return true;
    });
    const filteredResumoTec = (data?.resumoTecnicos ?? []).filter((r: ResumoTecnico) => {
      if (filterTecnico && r?.tecnico !== filterTecnico) return false;
      if (lowerSearch && !(r?.tecnico ?? '').toLowerCase().includes(lowerSearch)) return false;
      return true;
    });
    const filteredResumoMod = (data?.resumoModelos ?? []).filter((r: ResumoModelo) => {
      if (filterModelo && r?.modelo !== filterModelo) return false;
      if (lowerSearch && !(r?.modelo ?? '').toLowerCase().includes(lowerSearch)) return false;
      return true;
    });

    // Recalculate KPIs for filtered data
    const totalInstFiltered = filteredDetail.reduce((s: number, r: TecnicoModeloStats) => s + (r?.qtdTotal ?? 0), 0);
    const tecSet = new Set(filteredDetail.map((r: TecnicoModeloStats) => r?.tecnico ?? ''));
    const modSet = new Set(filteredDetail.map((r: TecnicoModeloStats) => r?.modelo ?? ''));
    const projTotal = filteredDetail.reduce((s: number, r: TecnicoModeloStats) => s + (r?.projecao7Dias ?? 0), 0);
    const filteredKpis: KPIs = {
      totalInstalacoes: totalInstFiltered,
      tecnicosAtivos: tecSet?.size ?? 0,
      modelosDistintos: modSet?.size ?? 0,
      projecaoTotal7Dias: projTotal,
      diasRelatorio: data?.kpis?.diasRelatorio ?? 0,
    };

    // Chart data based on filtered resumos
    const top15 = [...filteredResumoTec].slice(0, 15).map((t: ResumoTecnico) => ({ name: t?.tecnico ?? '', value: t?.reposicao7Dias ?? 0 }));
    const reposicaoModelo = filteredResumoMod.map((m: ResumoModelo) => ({ name: m?.modelo ?? '', value: m?.reposicao7Dias ?? 0 }));
    const mediaDiariaTec = [...filteredResumoTec].slice(0, 15).map((t: ResumoTecnico) => ({ name: t?.tecnico ?? '', value: t?.mediaDiariaTotal ?? 0 }));
    const filteredChartData: ChartData = {
      top15Tecnicos: top15,
      reposicaoPorModelo: reposicaoModelo,
      mediaDiariaPorTecnico: mediaDiariaTec,
      timeline: data?.chartData?.timeline ?? [],
    };

    return {
      kpis: filteredKpis,
      detailTable: filteredDetail,
      resumoTecnicos: filteredResumoTec,
      resumoModelos: filteredResumoMod,
      chartData: filteredChartData,
    };
  }, [data, filterTecnico, filterModelo, searchText]);

  const handlePdf = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-12 w-12 text-black animate-spin" />
        <p className="mt-4 text-black/60 font-bold uppercase tracking-widest text-xs">Sincronizando Dados...</p>
      </div>
    );
  }

  if (error || !data || !filtered) {
    return (
      <div className="text-center py-20 border border-black/10 rounded-xl">
        <p className="text-black font-bold">{error ?? 'Falha na comunicação com o servidor'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <SummaryModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        detailData={data?.detailTable ?? []}
        resumoModelos={data?.resumoModelos ?? []}
      />

      {/* Print-only Header */}
      <div className="hidden print:block border-b-2 border-black pb-4 mb-6">
        <h1 className="text-2xl font-bold uppercase">Projeção de Reposição de Material — ETER CLARO</h1>
        <div className="flex justify-between items-end mt-2 text-[10px] font-bold uppercase text-slate-500">
          <div>Arquivo: {data?.uploadInfo?.fileName}</div>
          <div>Gerado em: {new Date().toLocaleString('pt-BR')}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-black/10 rounded-xl p-6 shadow-sm flex flex-wrap items-center gap-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-black/40 uppercase tracking-[0.1em]">Filtrar Técnico</label>
          <select
            value={filterTecnico}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterTecnico(e?.target?.value ?? '')}
            className="border border-black/10 rounded-md px-4 py-2 text-sm bg-white min-w-[200px] focus:ring-1 focus:ring-black focus:border-black outline-none font-semibold transition-all hover:border-black/30"
          >
            <option value="">TODOS OS TÉCNICOS</option>
            {(data?.tecnicos ?? []).map((t: string) => <option key={t} value={t}>{t.toUpperCase()}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-black/40 uppercase tracking-[0.1em]">Filtrar Modelo</label>
          <select
            value={filterModelo}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterModelo(e?.target?.value ?? '')}
            className="border border-black/10 rounded-md px-4 py-2 text-sm bg-white min-w-[200px] focus:ring-1 focus:ring-black focus:border-black outline-none font-semibold transition-all hover:border-black/30"
          >
            <option value="">TODOS OS MODELOS</option>
            {(data?.modelos ?? []).map((m: string) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5 flex-1 min-w-[240px]">
          <label className="text-[10px] font-black text-black/40 uppercase tracking-[0.1em]">Busca Global</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40" />
            <input
              type="text"
              placeholder="PESQUISAR..."
              value={searchText}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchText(e?.target?.value ?? '')}
              className="border border-black/10 rounded-md pl-10 pr-4 py-2 text-sm w-full focus:ring-1 focus:ring-black focus:border-black outline-none font-semibold transition-all hover:border-black/30 placeholder:text-black/20"
            />
          </div>
        </div>
        <div className="flex items-center gap-3 ml-auto pt-4 w-full border-t border-black/5">
          <button
            onClick={handlePdf}
            className="flex items-center justify-center gap-3 px-6 py-2.5 bg-[#020617] hover:bg-black text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-100"
          >
            <Download className="h-4 w-4" />
            EXPORTAR RELATÓRIO PDF
          </button>
        </div>
      </div>

      {/* KPIs */}
      <KpiCards kpis={filtered.kpis} />

      {/* Charts */}
      <ChartsGrid chartData={filtered.chartData} />
      <div className="print-break" />

      {/* Detail Table */}
      <DetailTable data={filtered.detailTable} />

      {/* Summary by Technician */}
      <SummaryTecnico data={filtered.resumoTecnicos} />

      {/* Summary by Model */}
      <SummaryModelo data={filtered.resumoModelos} />
    </div>
  );
}
