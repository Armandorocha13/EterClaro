export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { html_content } = await request.json();

    const createResponse = await fetch('https://apps.abacus.ai/api/createConvertHtmlToPdfRequest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deployment_token: process.env.ABACUSAI_API_KEY,
        html_content,
        pdf_options: { format: 'A4', landscape: true, print_background: true, margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' } },
        base_url: process.env.NEXTAUTH_URL || '',
      }),
    });

    if (!createResponse.ok) {
      return NextResponse.json({ success: false, error: 'Falha ao criar PDF' }, { status: 500 });
    }

    const { request_id } = await createResponse.json();
    if (!request_id) {
      return NextResponse.json({ success: false, error: 'Sem request_id' }, { status: 500 });
    }

    const maxAttempts = 120;
    let attempts = 0;
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const statusResponse = await fetch('https://apps.abacus.ai/api/getConvertHtmlToPdfStatus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id, deployment_token: process.env.ABACUSAI_API_KEY }),
      });
      const statusResult = await statusResponse.json();
      const status = statusResult?.status ?? 'FAILED';
      if (status === 'SUCCESS') {
        const result = statusResult?.result;
        if (result?.result) {
          const pdfBuffer = Buffer.from(result.result, 'base64');
          return new NextResponse(pdfBuffer, {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': 'attachment; filename="relatorio-instalacoes.pdf"',
            },
          });
        }
        return NextResponse.json({ success: false, error: 'PDF vazio' }, { status: 500 });
      } else if (status === 'FAILED') {
        return NextResponse.json({ success: false, error: 'Geração do PDF falhou' }, { status: 500 });
      }
      attempts++;
    }
    return NextResponse.json({ success: false, error: 'Timeout na geração do PDF' }, { status: 500 });
  } catch (error: any) {
    console.error('PDF error:', error);
    return NextResponse.json({ success: false, error: error?.message ?? 'Erro' }, { status: 500 });
  }
}
