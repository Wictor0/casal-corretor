import type { MetadataRoute } from 'next';
import { and, eq, ne } from 'drizzle-orm';
import { db, t } from '@/db';
import { slugImovel } from '@/lib/codigo';

export const dynamic = 'force-dynamic';
const BASE = (process.env.APP_URL || 'https://casalcorretoroficial.com.br').replace(/\/$/, '');

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const imoveis = await db.select({ codigo: t.imoveis.codigo, tipo: t.imoveis.tipo, bairro: t.imoveis.bairro, updatedAt: t.imoveis.updatedAt })
    .from(t.imoveis).where(and(eq(t.imoveis.visivel, true), ne(t.imoveis.status, 'vendido')));
  return [
    ...['', '/imoveis', '/contato', '/parceiro'].map((p) => ({ url: BASE + p, changeFrequency: 'weekly' as const })),
    ...imoveis.map((i) => ({ url: `${BASE}/imovel/${slugImovel(i)}`, lastModified: i.updatedAt })),
  ];
}
