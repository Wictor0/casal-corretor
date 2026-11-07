import { createHash } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { db, t } from '@/db';
import { COOKIE } from '@/lib/auth';
import { lerCodigo } from '@/lib/codigo';

const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse|facebookexternalhit|pingdom|uptime/i;
const corta = (s: unknown, n = 120) => (typeof s === 'string' && s.trim() ? s.trim().slice(0, n) : null);

// Nomes amigáveis para sites de origem
function nomeOrigem(ref: string | null): string | null {
  if (!ref) return null;
  let h: string;
  try { h = new URL(ref).hostname.replace(/^www\./, ''); } catch { return null; }
  if (h.includes('casalcorretoroficial')) return null;
  if (h.includes('instagram')) return 'instagram';
  if (h.includes('facebook') || h === 'fb.com' || h.includes('fb.me')) return 'facebook';
  if (h.includes('google')) return 'google';
  if (h.includes('whatsapp') || h === 'wa.me') return 'whatsapp';
  if (h.includes('bing')) return 'bing';
  if (h.includes('linkedin') || h === 'lnkd.in') return 'linkedin';
  if (h === 't.co' || h.includes('twitter') || h === 'x.com') return 'x';
  if (h.includes('tiktok')) return 'tiktok';
  return h;
}

export async function POST(req: Request) {
  const ua = req.headers.get('user-agent') ?? '';
  if (BOT.test(ua)) return new Response(null, { status: 204 });
  // Quem está logado no painel (Sumaia, Allan) não conta como visita
  if ((req.headers.get('cookie') ?? '').includes(COOKIE + '=')) return new Response(null, { status: 204 });

  let b: Record<string, unknown>;
  try { b = JSON.parse(await req.text()); } catch { return new Response(null, { status: 400 }); }
  const caminho = corta(b.p, 300);
  if (!caminho || !caminho.startsWith('/') || caminho.startsWith('/painel')) return new Response(null, { status: 204 });
  const tipo = ['pv', 'whats', 'compartilhar'].includes(b.e as string) ? (b.e as string) : 'pv';

  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || req.headers.get('x-real-ip') || '';
  const dia = new Date().toISOString().slice(0, 10);
  const visitante = createHash('sha256').update(`${process.env.SESSION_SECRET ?? 'cc'}|${dia}|${ip}|${ua}`).digest('hex').slice(0, 16);

  let imovelId: number | null = null;
  const m = caminho.match(/^\/imovel\/([^/?#]+)/);
  const codigo = m && lerCodigo(m[1]);
  if (codigo) {
    const [i] = await db.select({ id: t.imoveis.id }).from(t.imoveis).where(eq(t.imoveis.codigo, codigo)).limit(1);
    imovelId = i?.id ?? null;
  }

  await db.insert(t.visitas).values({
    tipo, caminho: caminho.split('?')[0], imovelId, visitante,
    origem: corta(b.us, 60)?.toLowerCase() ?? nomeOrigem(corta(b.r, 300)),
    meio: corta(b.um, 60)?.toLowerCase() ?? null,
    campanha: corta(b.uc, 80) ?? null,
    dispositivo: /mobi|iphone|android/i.test(ua) ? 'celular' : /ipad|tablet/i.test(ua) ? 'tablet' : 'computador',
  });
  return new Response(null, { status: 204 });
}
