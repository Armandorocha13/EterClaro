'use client';

import { useState, useEffect, useMemo } from 'react';
import { Loader2, Download, Search, BarChart3, Users, Box, TrendingUp, Info } from 'lucide-react';
import { KpiCards } from './kpi-cards';
import { ChartsGrid } from './charts-grid';
import { DetailTable } from './detail-table';
import { SummaryTecnico } from './summary-tecnico';
import { SummaryModelo } from './summary-modelo';
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
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterTecnico, setFilterTecnico] = useState('');
  const [filterModelo, setFilterModelo] = useState('');
  const [searchText, setSearchText] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/data?uploadId=${uploadId}`);
        if (!res.ok) throw new Error('Erro ao carregar dados');
        const json = await res.json();
        setData(json);
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

  const handlePdf = async () => {
    setPdfLoading(true);
    try {
      const htmlContent = buildPdfHtml(filtered, data?.uploadInfo);
      const res = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html_content: htmlContent }),
      });
      if (!res.ok) throw new Error('Falha na geração do PDF');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'relatorio-projecao.pdf';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('PDF baixado com sucesso!');
    } catch (err: any) {
      toast.error(err?.message ?? 'Erro ao gerar PDF');
    } finally {
      setPdfLoading(false);
    }
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
      {/* Info box */}
      <div className="bg-black text-white p-5 rounded-lg flex items-start gap-4 shadow-lg">
        <div className="bg-white/10 p-2 rounded">
          <Info className="h-5 w-5 text-white" />
        </div>
        <div className="text-xs sm:text-sm font-medium tracking-wide leading-relaxed">
          <span className="opacity-60 uppercase font-bold mr-2">RELATÓRIO ATIVO:</span> 
          <span className="font-bold">{data?.uploadInfo?.fileName ?? 'N/A'}</span>
          <span className="mx-3 opacity-20">|</span>
          <span className="opacity-60 uppercase font-bold mr-2">REGISTROS:</span>
          <span className="font-bold">{data?.uploadInfo?.recordCount ?? 0}</span>
          <div className="mt-1 opacity-60">
            Regra de Negócio: Projeção baseada em 7 dias fixos trabalhados. Valores arredondados superiormente.
          </div>
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
        <div className="flex flex-col gap-1.5 pt-5">
          <button
            onClick={handlePdf}
            disabled={pdfLoading}
            className="flex items-center justify-center gap-3 px-6 py-2.5 bg-black hover:bg-black/80 text-white rounded-md text-xs font-black uppercase tracking-widest transition-all disabled:opacity-30 shadow-md"
          >
            {pdfLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {pdfLoading ? 'PROCESSANDO...' : 'EXPORTAR PDF'}
          </button>
        </div>
      </div>

      {/* KPIs */}
      <KpiCards kpis={filtered.kpis} />

      {/* Charts */}
      <ChartsGrid chartData={filtered.chartData} />

      {/* Detail Table */}
      <DetailTable data={filtered.detailTable} />

      {/* Summary by Technician */}
      <SummaryTecnico data={filtered.resumoTecnicos} />

      {/* Summary by Model */}
      <SummaryModelo data={filtered.resumoModelos} />
    </div>
  );
}

function buildPdfHtml(filtered: any, uploadInfo: any) {
  const detailRows = (filtered?.detailTable ?? []).map((r: any) =>
    `<tr><td>${(r?.tecnico ?? '').toUpperCase()}</td><td>${r?.modelo ?? ''}</td><td class="num">${r?.qtdTotal ?? 0}</td><td class="num">${r?.diasRelatorio ?? 0}</td><td class="num">${r?.mediaDiaria ?? 0}</td><td class="num">${r?.projecao7Dias ?? 0}</td></tr>`
  ).join('');
  const tecRows = (filtered?.resumoTecnicos ?? []).map((r: any) =>
    `<tr><td>${(r?.tecnico ?? '').toUpperCase()}</td><td class="num">${r?.totalInstalacoes ?? 0}</td><td class="num">${r?.diasRelatorio ?? 0}</td><td class="num">${r?.mediaDiariaTotal ?? 0}</td><td class="num">${r?.reposicao7Dias ?? 0}</td><td><span class="badge badge-${(r?.volume ?? 'Baixo') === 'Alto' ? 'high' : (r?.volume ?? 'Baixo') === 'Médio' ? 'med' : 'low'}">${r?.volume ?? ''}</span></td></tr>`
  ).join('');
  const modRows = (filtered?.resumoModelos ?? []).map((r: any) =>
    `<tr><td>${r?.modelo ?? ''}</td><td class="num">${r?.qtdTotal ?? 0}</td><td class="num">${r?.tecnicosQueInstalam ?? 0}</td><td class="num">${r?.mediaDiariaGeral ?? 0}</td><td class="num">${r?.reposicao7Dias ?? 0}</td></tr>`
  ).join('');

  return `<!DOCTYPE html><html><head><style>
    body{font-family:'Helvetica',Arial,sans-serif;font-size:10px;color:#000;padding:40px;line-height:1.4;}
    .header{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #000;padding-bottom:20px;margin-bottom:30px;}
    .logo-placeholder{font-size:24px;font-weight:bold;letter-spacing:-1px;}
    .title-area{text-align:right;}
    h1{font-size:16px;text-transform:uppercase;margin:0;letter-spacing:1px;}
    .report-info{font-size:9px;color:#666;text-transform:uppercase;margin-top:5px;font-weight:bold;}
    h2{font-size:12px;margin:30px 0 15px;text-transform:uppercase;border-left:4px solid #000;padding-left:10px;letter-spacing:1px;}
    table{width:100%;border-collapse:collapse;margin-bottom:20px;}
    th{background:#f0f0f0;padding:8px 10px;text-align:left;font-size:9px;text-transform:uppercase;border:1px solid #ddd;font-weight:bold;}
    td{padding:6px 10px;border:1px solid #eee;font-size:9px;}
    .num{text-align:right;font-family:monospace;}
    .badge{padding:2px 6px;border-radius:2px;font-size:8px;font-weight:bold;text-transform:uppercase;}
    .badge-high{background:#000;color:#fff;}
    .badge-med{background:#666;color:#fff;}
    .badge-low{background:#ccc;color:#000;}
    .kpi-row{display:flex;gap:15px;margin-bottom:30px;}
    .kpi{background:#fff;border:1px solid #000;padding:12px 15px;flex:1;}
    .kpi .label{font-size:8px;text-transform:uppercase;color:#666;font-weight:bold;margin-bottom:5px;}
    .kpi .value{font-size:20px;font-weight:bold;color:#000;}
    .footer{margin-top:50px;font-size:8px;color:#999;text-align:center;text-transform:uppercase;letter-spacing:2px;border-top:1px solid #eee;padding-top:20px;}
  </style></head><body>
    <div class="header">
      <div class="logo-placeholder">ETER - CLARO</div>
      <div class="title-area">
        <h1>Projeção de Reposição de Material</h1>
        <div class="report-info">Arquivo: ${uploadInfo?.fileName ?? 'N/A'} • Registros: ${uploadInfo?.recordCount ?? 0}</div>
      </div>
    </div>
    <div class="kpi-row">
      <div class="kpi"><div class="label">Total Instalações</div><div class="value">${filtered?.kpis?.totalInstalacoes ?? 0}</div></div>
      <div class="kpi"><div class="label">Técnicos Ativos</div><div class="value">${filtered?.kpis?.tecnicosAtivos ?? 0}</div></div>
      <div class="kpi"><div class="label">Modelos Distintos</div><div class="value">${filtered?.kpis?.modelosDistintos ?? 0}</div></div>
      <div class="kpi"><div class="label">Projeção 7 Dias</div><div class="value">${filtered?.kpis?.projecaoTotal7Dias ?? 0}</div></div>
    </div>
    <h2>Resumo Consolidado por Técnico</h2>
    <table><thead><tr><th>Técnico</th><th class="num">Total Inst.</th><th class="num">Dias Rel.</th><th class="num">Média Diária</th><th class="num">Projeção 7D</th><th>Volume</th></tr></thead><tbody>${tecRows}</tbody></table>
    <h2>Análise por Modelo de Terminal</h2>
    <table><thead><tr><th>Modelo</th><th class="num">Qtd Total</th><th class="num">Técnicos</th><th class="num">Média Geral</th><th class="num">Projeção 7D</th></tr></thead><tbody>${modRows}</tbody></table>
    <div class="footer">Sistema Interno ETER - Geração em ${new Date().toLocaleDateString('pt-BR')}</div>
  </body></html>`;
}