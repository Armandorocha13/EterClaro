import { prisma } from '@/lib/prisma';
import { HomeClient } from '@/components/home-client';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const latestUpload = await prisma.upload.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { id: true, fileName: true, recordCount: true, createdAt: true },
  }).catch(() => null);

  return <HomeClient latestUpload={latestUpload ? {
    id: latestUpload.id,
    fileName: latestUpload.fileName,
    recordCount: latestUpload.recordCount,
    createdAt: latestUpload.createdAt.toISOString(),
  } : null} />;
}
