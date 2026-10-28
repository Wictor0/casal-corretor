import 'server-only';
import { eq, isNotNull, sql } from 'drizzle-orm';
import { db, t } from '@/db';
import { ehRascunho, norm, zonaPelaTabela, type Zona } from './codigo';

/** Zona automática: tabela de bairros; senão, aprende com imóveis já cadastrados no mesmo bairro. */
export async function zonaAutomatica(bairro: string | null, cidade: string | null, ignorarId?: number): Promise<Zona | null> {
  const z = zonaPelaTabela(bairro, cidade);
  if (z || !bairro) return z;
  const outros = await db.select({ id: t.imoveis.id, bairro: t.imoveis.bairro, zona: t.imoveis.zona }).from(t.imoveis).where(isNotNull(t.imoveis.zona));
  const achou = outros.find((o) => o.id !== ignorarId && norm(o.bairro) === norm(bairro));
  return (achou?.zona as Zona | undefined) ?? null;
}

async function proximoCodigo(z: Zona) {
  const [{ m }] = await db.select({ m: sql<number>`coalesce(max(substring(${t.imoveis.codigo} from 3)::int), 0)` }).from(t.imoveis)
    .where(sql`${t.imoveis.codigo} ~ ${'^CC' + z + '[0-9]{3}$'}`);
  const seq = Number(m) ? Number(m) - z * 1000 + 1 : 1;
  return 'CC' + (z * 1000 + seq);
}

/**
 * Garante o código certo para o imóvel. Depois de publicado, o código nunca muda.
 * Antes disso, acompanha a zona (rascunho "R<id>" enquanto não há zona).
 */
export async function atribuirCodigo(id: number) {
  for (let tentativa = 0; tentativa < 4; tentativa++) {
    const [i] = await db.select({ codigo: t.imoveis.codigo, zona: t.imoveis.zona, pub: t.imoveis.publicadoEm }).from(t.imoveis).where(eq(t.imoveis.id, id));
    if (!i) return;
    if (i.pub && !ehRascunho(i.codigo)) return;
    const z = i.zona as Zona | null;
    if (!z) { if (!ehRascunho(i.codigo)) await db.update(t.imoveis).set({ codigo: 'R' + id }).where(eq(t.imoveis.id, id)); return; }
    if (new RegExp('^CC' + z + '\\d{3}$').test(i.codigo)) return;
    try {
      await db.update(t.imoveis).set({ codigo: await proximoCodigo(z) }).where(eq(t.imoveis.id, id));
      return;
    } catch (e) { if (tentativa === 3) throw e; } // colisão com outro cadastro simultâneo: tenta de novo
  }
}
