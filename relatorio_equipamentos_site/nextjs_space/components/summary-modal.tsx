'use client';

import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, AlertTriangle, Users, TrendingUp } from 'lucide-react';
import type { ResumoModelo } from '@/lib/excel-utils';

interface SummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  detailData: any[];
  resumoModelos: ResumoModelo[];
}

export function SummaryModal({ isOpen, onClose, detailData, resumoModelos }: SummaryModalProps) {
  // Pegar apenas os itens individuais (Técnico x Modelo) > 10 e selecionar os top 5
  const allCriticalItems = (detailData ?? [])
    .filter(row => (row.projecao7Dias ?? 0) > 10)
    .sort((a, b) => (b.projecao7Dias ?? 0) - (a.projecao7Dias ?? 0));

  const topAlerts = allCriticalItems.slice(0, 5);
  const criticalCount = allCriticalItems.length;
  const criticalProjectionSum = allCriticalItems.reduce((acc, curr) => acc + (curr.projecao7Dias ?? 0), 0);
  
  const allItemsCount = (detailData ?? []).length;
  const gaugeValue = allItemsCount > 0 ? (criticalCount / allItemsCount) * 100 : 0;
  
  const gaugeData = [
    { value: gaugeValue },
    { value: 100 - gaugeValue },
  ];

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[100]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-2xl transition-all border border-black/5">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#ee1111] p-2 rounded-lg shadow-lg shadow-red-200">
                      <AlertTriangle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <Dialog.Title as="h3" className="text-xl font-black text-[#020617] uppercase tracking-tight">
                        Resumo de Alertas
                      </Dialog.Title>
                      <p className="text-black/40 text-xs font-bold uppercase tracking-widest">Necessidade de Reposição (Próximos 7 Dias)</p>
                    </div>
                  </div>
                  <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                    <X className="h-5 w-5 text-black/40" />
                  </button>
                </div>

                <div className="space-y-8">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-inner">
                    <p className="text-sm font-bold text-[#020617] leading-relaxed">
                      Os técnicos abaixo estão em situação crítica (necessidade acima de 10 unidades):
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* Alertas Críticos por Técnico x Modelo */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-black/60 mb-2">
                        <Users className="h-4 w-4" />
                        <h4 className="text-xs font-black uppercase tracking-widest">Alertas Prioritários (Técnico x Modelo)</h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {topAlerts.length > 0 ? topAlerts.map((row, i) => (
                          <div key={i} className="flex flex-col p-4 bg-red-50 rounded-xl border border-red-200 shadow-sm transition-all hover:border-red-400 hover:shadow-md">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-xs font-black text-red-900 uppercase tracking-wider">{row.tecnico?.toUpperCase()}</span>
                              <div className="flex flex-col items-end">
                                <span className="text-lg font-black text-[#ee1111] leading-none">+{row.projecao7Dias}</span>
                                <span className="text-[8px] font-bold text-red-400 uppercase">UNIDADES</span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-red-100/50">
                              <span className="text-xs font-bold text-red-700/70 truncate max-w-[180px]">{row.modelo}</span>
                              <div className="px-2 py-0.5 bg-red-100 rounded text-[9px] font-black text-red-600 uppercase tracking-tighter">Projeção 7D</div>
                            </div>
                          </div>
                        )) : (
                          <p className="text-xs text-black/40 italic text-center col-span-2 py-8">Nenhum alerta crítico detectado para o período.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-10 pt-6 border-t border-black/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest">Cálculo: (Média Diária × 7 Dias)</span>
                  </div>
                  <button
                    onClick={onClose}
                    className="px-8 py-3 bg-[#020617] text-white rounded-lg font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-blue-200"
                  >
                    Entendido
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
