import { baixar } from '@/lib/s3';

export async function GET(_: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key } = await params;
  const k = key.join('/');
  if (k.includes('..')) return new Response('Not found', { status: 404 });
  try {
    const obj = await baixar(k);
    const body = obj.Body?.transformToWebStream();
    return new Response(body as ReadableStream, {
      headers: { 'Content-Type': obj.ContentType || 'application/octet-stream', 'Cache-Control': 'public, max-age=31536000, immutable' },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
