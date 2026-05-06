export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { processData } from '@/lib/excel-utils';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado. Faça login para visualizar os dados.' }, { status: 401 });
    }

    const url = new URL(request.url);
    const uploadId = url.searchParams.get('uploadId');

    const latestUpload = uploadId
      ? await prisma.upload.findUnique({ where: { id: uploadId } })
      : await prisma.upload.findFirst({ orderBy: { createdAt: 'desc' } });

    if (!latestUpload) {
      return NextResponse.json({ error: 'Nenhum upload encontrado' }, { status: 404 });
    }

    const installations = await prisma.installation.findMany({
      where: { uploadId: latestUpload.id },
      select: { tecnico: true, descricao: true, serial: true, data: true },
    });

    const serialized = installations.map((i: any) => ({
      tecnico: i?.tecnico ?? '',
      descricao: i?.descricao ?? '',
      serial: i?.serial ?? '',
      data: i?.data ? i.data.toISOString() : null,
    }));

    const result = processData(serialized);

    // Get distinct tecnicos and modelos for filters
    const tecnicos = [...new Set(serialized.map((i: any) => i?.tecnico ?? '').filter(Boolean))].sort();
    const modelos = [...new Set(serialized.map((i: any) => i?.descricao ?? '').filter(Boolean))].sort();

    return NextResponse.json({
      ...result,
      tecnicos,
      modelos,
      uploadInfo: {
        id: latestUpload.id,
        fileName: latestUpload.fileName,
        recordCount: latestUpload.recordCount,
        createdAt: latestUpload.createdAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Data fetch error:', error);
    return NextResponse.json({ error: error?.message ?? 'Erro ao buscar dados' }, { status: 500 });
  }
}
