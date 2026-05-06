'use client';

import { BarChart3, Users, Box, TrendingUp, Calendar } from 'lucide-react';
import type { KPIs } from '@/lib/excel-utils';
import { useInView } from 'react-intersection-observer';
import { useEffect, useState } from 'react';

function AnimatedNumber({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [current, setCurrent] = useState(0);
  const { ref, inView } = useInView({ triggerOnce: true });

  useEffect(() => {
    if (!inView) return;
    const start = 0;
    const end = value ?? 0;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setCurrent(Math.round(start + (end - start) * progress));
      if (progress < 1) requestAnimationFrame(animate);
    };
    animate();
  }, [inView, value, duration]);

  return <span ref={ref}>{current?.toLocaleString?.('pt-BR') ?? '0'}</span>;
}

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
                  <AnimatedNumber value={val} />
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}