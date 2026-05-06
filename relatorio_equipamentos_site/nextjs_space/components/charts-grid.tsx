'use client';

import dynamic from 'next/dynamic';
import type { ChartData } from '@/lib/excel-utils';

const BarChartComponent = dynamic(() => import('./charts/bar-chart-component'), { ssr: false, loading: () => <div className="h-[300px] flex items-center justify-center text-slate-400">Carregando gráfico...</div> });
const LineChartComponent = dynamic(() => import('./charts/line-chart-component'), { ssr: false, loading: () => <div className="h-[300px] flex items-center justify-center text-slate-400">Carregando gráfico...</div> });
const HBarChartComponent = dynamic(() => import('./charts/hbar-chart-component'), { ssr: false, loading: () => <div className="h-[300px] flex items-center justify-center text-slate-400">Carregando gráfico...</div> });

export function ChartsGrid({ chartData }: { chartData: ChartData }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            Top 15 Técnicos — Projeção de Reposição 7 Dias
          </h2>
          {(chartData?.top15Tecnicos?.length ?? 0) > 0 ? (
            <HBarChartComponent data={chartData?.top15Tecnicos ?? []} color="#60B5FF" />
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-400 text-sm">Nenhum dado para exibir</div>
          )}
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            Reposição por Modelo (Total Geral)
          </h2>
          {(chartData?.reposicaoPorModelo?.length ?? 0) > 0 ? (
            <BarChartComponent data={chartData?.reposicaoPorModelo ?? []} color="#FF9149" />
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-400 text-sm">Nenhum dado para exibir</div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            Média Diária por Técnico
          </h2>
          {(chartData?.mediaDiariaPorTecnico?.length ?? 0) > 0 ? (
            <BarChartComponent data={chartData?.mediaDiariaPorTecnico ?? []} color="#80D8C3" isTechnician={true} />
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-400 text-sm">Nenhum dado para exibir</div>
          )}
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            Instalações por Data
          </h2>
          {(chartData?.timeline?.length ?? 0) > 0 ? (
            <LineChartComponent data={chartData?.timeline ?? []} />
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-400 text-sm">Nenhum dado para exibir</div>
          )}
        </div>
      </div>
    </div>
  );
}
