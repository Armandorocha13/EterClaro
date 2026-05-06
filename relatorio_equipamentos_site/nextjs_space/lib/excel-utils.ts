export interface InstallationRow {
  tecnico: string;
  descricao: string;
  serial: string;
  data: Date | null;
}

export interface TecnicoModeloStats {
  tecnico: string;
  modelo: string;
  qtdTotal: number;
  diasRelatorio: number;
  mediaDiaria: number;
  projecao7Dias: number;
}

export interface KPIs {
  totalInstalacoes: number;
  tecnicosAtivos: number;
  modelosDistintos: number;
  projecaoTotal7Dias: number;
  diasRelatorio: number;
}

export interface ResumoTecnico {
  tecnico: string;
  totalInstalacoes: number;
  diasRelatorio: number;
  mediaDiariaTotal: number;
  reposicao7Dias: number;
  volume: 'Alto' | 'Médio' | 'Baixo';
}

export interface ResumoModelo {
  modelo: string;
  qtdTotal: number;
  tecnicosQueInstalam: number;
  mediaDiariaGeral: number;
  reposicao7Dias: number;
}

export interface ChartData {
  top15Tecnicos: { name: string; value: number }[];
  reposicaoPorModelo: { name: string; value: number }[];
  mediaDiariaPorTecnico: { name: string; value: number }[];
  timeline: { date: string; count: number }[];
}

export function processData(installations: { tecnico: string; descricao: string; serial: string; data: Date | null | string }[]) {
  // Build tecnico x modelo map
  const tecModelMap: Record<string, Record<string, number>> = {};
  const modelTecSet: Record<string, Set<string>> = {};
  const dateMap: Record<string, number> = {};
  const allDates: Date[] = [];

  for (const row of installations ?? []) {
    const tec = (row?.tecnico ?? '').toString().trim();
    const modelo = (row?.descricao ?? '').toString().trim();
    if (!tec || !modelo) continue;

    if (!tecModelMap[tec]) tecModelMap[tec] = {};
    tecModelMap[tec][modelo] = (tecModelMap[tec]?.[modelo] ?? 0) + 1;

    if (!modelTecSet[modelo]) modelTecSet[modelo] = new Set();
    modelTecSet[modelo].add(tec);

    if (row?.data) {
      const d = new Date(row.data);
      if (!isNaN(d.getTime())) {
        allDates.push(d);
        const dateStr = d.toISOString().split('T')[0] ?? '';
        if (dateStr) dateMap[dateStr] = (dateMap[dateStr] ?? 0) + 1;
      }
    }
  }

  // Calcular dias do relatório baseado no range de datas do Excel
  let diasRelatorio = 1;
  if (allDates.length > 0) {
    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
    const diffMs = maxDate.getTime() - minDate.getTime();
    diasRelatorio = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1); // +1 para incluir ambos os dias
  }

  // Detail table
  const detailTable: TecnicoModeloStats[] = [];
  for (const [tec, modelos] of Object.entries(tecModelMap ?? {})) {
    for (const [modelo, qtd] of Object.entries(modelos ?? {})) {
      const mediaDiaria = qtd / diasRelatorio;
      detailTable.push({
        tecnico: tec,
        modelo,
        qtdTotal: qtd,
        diasRelatorio,
        mediaDiaria: Math.round(mediaDiaria * 100) / 100,
        projecao7Dias: Math.ceil(mediaDiaria * 7),
      });
    }
  }

  // KPIs
  const totalInstalacoes = (installations ?? []).length;
  const tecnicos = Object.keys(tecModelMap ?? {});
  const modelos = Object.keys(modelTecSet ?? {});
  const projecaoTotal = detailTable.reduce((sum: number, r: TecnicoModeloStats) => sum + (r?.projecao7Dias ?? 0), 0);

  const kpis: KPIs = {
    totalInstalacoes,
    tecnicosAtivos: tecnicos?.length ?? 0,
    modelosDistintos: modelos?.length ?? 0,
    projecaoTotal7Dias: projecaoTotal,
    diasRelatorio,
  };

  // Resumo por técnico
  const resumoTecnicos: ResumoTecnico[] = tecnicos.map((tec: string) => {
    const total = Object.values(tecModelMap[tec] ?? {}).reduce((s: number, v: number) => s + v, 0);
    const media = total / diasRelatorio;
    const repo = Math.ceil(media * 7);
    let volume: 'Alto' | 'Médio' | 'Baixo' = 'Baixo';
    if (repo >= 50) volume = 'Alto';
    else if (repo >= 20) volume = 'Médio';
    return {
      tecnico: tec,
      totalInstalacoes: total,
      diasRelatorio,
      mediaDiariaTotal: Math.round(media * 100) / 100,
      reposicao7Dias: repo,
      volume,
    };
  }).sort((a: ResumoTecnico, b: ResumoTecnico) => (b?.reposicao7Dias ?? 0) - (a?.reposicao7Dias ?? 0));

  // Resumo por modelo
  const resumoModelos: ResumoModelo[] = modelos.map((modelo: string) => {
    let qtdTotal = 0;
    for (const tec of Object.keys(tecModelMap ?? {})) {
      qtdTotal += tecModelMap[tec]?.[modelo] ?? 0;
    }
    const media = qtdTotal / diasRelatorio;
    return {
      modelo,
      qtdTotal,
      tecnicosQueInstalam: modelTecSet[modelo]?.size ?? 0,
      mediaDiariaGeral: Math.round(media * 100) / 100,
      reposicao7Dias: Math.ceil(media * 7),
    };
  }).sort((a: ResumoModelo, b: ResumoModelo) => (b?.reposicao7Dias ?? 0) - (a?.reposicao7Dias ?? 0));

  // Charts
  const top15 = [...resumoTecnicos].slice(0, 15).map((t: ResumoTecnico) => ({ name: t?.tecnico ?? '', value: t?.reposicao7Dias ?? 0 }));
  const reposicaoModelo = resumoModelos.map((m: ResumoModelo) => ({ name: m?.modelo ?? '', value: m?.reposicao7Dias ?? 0 }));
  const mediaDiariaTec = [...resumoTecnicos].slice(0, 15).map((t: ResumoTecnico) => ({ name: t?.tecnico ?? '', value: t?.mediaDiariaTotal ?? 0 }));
  const timeline = Object.entries(dateMap ?? {})
    .sort(([a]: [string, number], [b]: [string, number]) => a.localeCompare(b))
    .map(([date, count]: [string, number]) => ({ date, count }));

  const chartData: ChartData = {
    top15Tecnicos: top15,
    reposicaoPorModelo: reposicaoModelo,
    mediaDiariaPorTecnico: mediaDiariaTec,
    timeline,
  };

  return { kpis, detailTable, resumoTecnicos, resumoModelos, chartData };
}
