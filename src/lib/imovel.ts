import 'server-only';
import { and, asc, desc, eq, ne, sql } from 'drizzle-orm';
import { cache } from 'react';
import { db, t } from '@/db';

export const carregarImovel = cache(async (codigo: string) => {
  const [i] = await db.select().from(t.imoveis).where(and(eq(t.imoveis.codigo, codigo), eq(t.imoveis.visivel, true)));
  if (!i) return null;
  const [fotos, carac] = await Promise.all([
    db.select({ key: t.fotos.key, thumbKey: t.fotos.thumbKey, largura: t.fotos.largura, altura: t.fotos.altura }).from(t.fotos).where(eq(t.fotos.imovelId, i.id)).orderBy(asc(t.fotos.ordem), asc(t.fotos.id)),
    db.select({ nome: t.caracteristicas.nome, tipo: t.caracteristicas.tipo, valor: t.imovelCaracteristicas.valor }).from(t.imovelCaracteristicas)
      .innerJoin(t.caracteristicas, eq(t.caracteristicas.id, t.imovelCaracteristicas.caracteristicaId))
      .where(eq(t.imovelCaracteristicas.imovelId, i.id)).orderBy(asc(t.caracteristicas.ordem), asc(t.caracteristicas.nome)),
  ]);
  return { ...i, fotos, carac };
});

export async function similares(i: { id: number; negocio: 'venda' | 'aluguel' | 'terreno'; zona: number | null; bairro: string | null; preco: number | null }) {
  const thumb = sql<string | null>`(select fo.thumb_key from fotos fo where fo.imovel_id = imoveis.id order by fo.ordem, fo.id limit 1)`;
  // mesmo tipo de negócio; primeiro mesmo bairro, depois mesma zona, depois preço mais próximo
  return db.select({
    id: t.imoveis.id, codigo: t.imoveis.codigo, titulo: t.imoveis.titulo, tipo: t.imoveis.tipo, bairro: t.imoveis.bairro,
    preco: t.imoveis.preco, negocio: t.imoveis.negocio, thumb,
  }).from(t.imoveis)
    .where(and(eq(t.imoveis.visivel, true), ne(t.imoveis.status, 'vendido'), eq(t.imoveis.negocio, i.negocio), ne(t.imoveis.id, i.id)))
    .orderBy(
      sql`case when ${t.imoveis.bairro} = ${i.bairro ?? ''} then 0 when ${t.imoveis.zona} = ${i.zona ?? -1} then 1 else 2 end`,
      sql`abs(coalesce(${t.imoveis.preco}, 0) - ${i.preco ?? 0})`, desc(t.imoveis.id))
    .limit(3);
}
