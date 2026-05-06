export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

function detectColumns(headers: string[]) {
  const h = (headers ?? []).map((c: any) => (c ?? '').toString().toUpperCase().trim());
  const col: { tecnico: number | null; descricao: number | null; serial: number | null; data: number | null } = {
    tecnico: null, descricao: null, serial: null, data: null
  };
  for (let i = 0; i < h.length; i++) {
    if (h[i]?.includes('TECNICO') || h[i]?.includes('TÉCNICO')) col.tecnico = i;
    if (h[i] === 'DESCRICAO' || h[i] === 'DESCRIÇÃO' || h[i]?.includes('DESCRICAO') || h[i]?.includes('DESCRI')) col.descricao = i;
    if (h[i] === 'SERIAL' || h[i]?.includes('SERIAL')) col.serial = i;
  }
  // Preferir colunas de data: DATA ALTERAÇÃO > DATA CONTRATO > qualquer coluna com DATA
  for (let i = 0; i < h.length; i++) {
    if (h[i] === 'DATA' || h[i]?.includes('DATA ALTERA')) { col.data = i; break; }
  }
  if (col.data === null) {
    for (let i = 0; i < h.length; i++) {
      if (h[i]?.includes('DATA CONTRATO')) { col.data = i; break; }
    }
  }
  if (col.data === null) {
    for (let i = 0; i < h.length; i++) {
      if (h[i]?.includes('DATA')) { col.data = i; break; }
    }
  }
  return col;
}

function parseExcelDate(val: any): Date | null {
  if (val == null) return null;
  if (typeof val === 'number') {
    try {
      const d = XLSX.SSF.parse_date_code(val);
      if (d) return new Date(d.y, d.m - 1, d.d);
    } catch { /* ignore */ }
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    // Formato brasileiro dd/mm/yyyy
    const brMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (brMatch) {
      const day = parseInt(brMatch[1], 10);
      const month = parseInt(brMatch[2], 10) - 1;
      const year = parseInt(brMatch[3], 10);
      const d = new Date(year, month, day);
      if (!isNaN(d.getTime())) return d;
    }
    // Formato ISO yyyy-mm-dd
    const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (isoMatch) {
      const d = new Date(parseInt(isoMatch[1], 10), parseInt(isoMatch[2], 10) - 1, parseInt(isoMatch[3], 10));
      if (!isNaN(d.getTime())) return d;
    }
    // Fallback
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) return d;
  }
  if (val instanceof Date && !isNaN(val.getTime())) return val;
  return null;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado. Faça login para enviar arquivos.' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
    const sheetName = workbook?.SheetNames?.[0];
    if (!sheetName) {
      return NextResponse.json({ error: 'Arquivo Excel vazio' }, { status: 400 });
    }

    const sheet = workbook?.Sheets?.[sheetName];
    if (!sheet) {
      return NextResponse.json({ error: 'Planilha não encontrada' }, { status: 400 });
    }

    const rawData: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 }) ?? [];
    if (rawData.length < 2) {
      return NextResponse.json({ error: 'Arquivo sem dados suficientes' }, { status: 400 });
    }

    const headers = rawData[0] ?? [];
    const col = detectColumns(headers.map((h: any) => String(h ?? '')));

    if (col.tecnico === null || col.descricao === null || col.serial === null) {
      return NextResponse.json({
        error: `Colunas obrigatórias não encontradas. Encontradas: ${headers.join(', ')}. Necessárias: TÉCNICO, DESCRICAO, SERIAL, DATA`
      }, { status: 400 });
    }

    // Create upload record
    const upload = await prisma.upload.create({
      data: {
        fileName: file?.name ?? 'unknown.xlsx',
        recordCount: rawData.length - 1,
      },
    });

    // Process rows in batches
    const rows = rawData.slice(1).filter((row: any[]) => {
      const tec = row?.[col.tecnico!];
      return tec != null && String(tec).trim() !== '';
    });

    const BATCH_SIZE = 500;
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      const data = batch.map((row: any[]) => ({
        tecnico: String(row?.[col.tecnico!] ?? '').trim(),
        descricao: String(row?.[col.descricao!] ?? '').trim(),
        serial: String(row?.[col.serial!] ?? '').trim(),
        data: col.data !== null ? parseExcelDate(row?.[col.data]) : null,
        uploadId: upload.id,
      }));
      await prisma.installation.createMany({ data });
    }

    // Update record count
    await prisma.upload.update({
      where: { id: upload.id },
      data: { recordCount: rows.length },
    });

    return NextResponse.json({
      success: true,
      uploadId: upload.id,
      recordCount: rows.length,
      fileName: file?.name ?? 'unknown.xlsx',
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error?.message ?? 'Erro ao processar arquivo' }, { status: 500 });
  }
}