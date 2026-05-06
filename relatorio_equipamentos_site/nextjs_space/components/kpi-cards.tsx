'use client';

import { BarChart3, Users, Box, TrendingUp, Calendar } from 'lucide-react';
import type { KPIs } from '@/lib/excel-utils';
import { useInView } from 'react-intersection-observer';
import { useEffect, useState } from 'react';



const cards = [
  { key: 'totalInstalacoes', label: 'Total Instalações', icon: BarChart3 },
  { key: 'diasRelatorio', label: 'Dias Base', icon: Calendar },
  { key: 'tecnicosAtivos', label: 'Técnicos Ativos', icon: Users },
  { key: 'modelosDistintos', label: 'Modelos Distintos', icon: Box },
  { key: 'projecaoTotal7Dias', label: 'Projeção 7 Dias', icon: TrendingUp },
];

export function KpiCards({ kpis }: { kpis: KPIs }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
      {cards.map((card: any) => {
        const Icon = card?.icon;
        const val = (kpis as any)?.[card?.key] ?? 0;
        const isHighlight = card.key === 'projecaoTotal7Dias';
        
        return (
          <div 
            key={card?.key} 
            className={`
              bg-white rounded-lg p-6 border-b-2 transition-all group
              ${isHighlight ? 'border-black shadow-md' : 'border-black/5 hover:border-black/20 shadow-sm'}
            `}
          >
            <div className="flex flex-col gap-4">
              <div className={`p-2 w-fit rounded ${isHighlight ? 'bg-black text-white' : 'bg-black/5 text-black'}`}>
                {Icon && <Icon className="h-5 w-5" />}
              </div>
              <div>
                <p className="text-[10px] font-black text-black/40 uppercase tracking-widest">{card?.label}</p>
                <p className="text-3xl font-black mt-1 font-sans text-black">
                  {val?.toLocaleString?.('pt-BR') ?? '0'}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}