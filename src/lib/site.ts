import 'server-only';
import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm';
import { db, t } from '@/db';
import { CHAVES_FOTO } from '@/lib/formato';

export const CONTATOS = [
  { nome: 'Sumaia Taha', creci: 'CRECI 300840-F', tel: '(11) 95208-0085', wa: '5511952080085' },
  { nome: 'Allan Venancio', creci: 'CRECI 285513-F', tel: '(11) 95822-8812', wa: '5511958228812' },
];
export const WHATS = 'https://wa.me/' + CONTATOS[1].wa;
export const INSTAGRAM = 'https://instagram.com/casalcorretoroficial';

const capa = sql<string | null>`(select f.key from fotos f where f.imovel_id = imoveis.id order by f.ordem, f.id limit 1)`;
const thumb = sql<string | null>`(select f.thumb_key from fotos f where f.imovel_id = imoveis.id order by f.ordem, f.id limit 1)`;

export type CardImovel = Awaited<ReturnType<typeof destaques>>[number];

export async function destaques() {
  return db.select({
    id: t.imoveis.id, codigo: t.imoveis.codigo, titulo: t.imoveis.titulo, negocio: t.imoveis.negocio, tipo: t.imoveis.tipo,
    status: t.imoveis.status, preco: t.imoveis.preco, area: t.imoveis.area, quartos: t.imoveis.quartos, vagas: t.imoveis.vagas,
    bairro: t.imoveis.bairro, cidade: t.imoveis.cidade, principal: t.imoveis.destaquePrincipal, capa, thumb,
  }).from(t.imoveis)
    .where(and(eq(t.imoveis.destaque, true), eq(t.imoveis.visivel, true)))
    .orderBy(asc(t.imoveis.destaqueOrdem), desc(t.imoveis.id)).limit(8);
}

export async function bairros() {
  const r = await db.select({ b: t.imoveis.bairro, n: sql<number>`count(*)` }).from(t.imoveis)
    .where(and(eq(t.imoveis.visivel, true), sql`${t.imoveis.bairro} is not null`))
    .groupBy(t.imoveis.bairro).orderBy(desc(sql`count(*)`)).limit(8);
  return r.map((x) => x.b!).filter(Boolean);
}

export async function construtoras() {
  return db.select({ id: t.construtoras.id, nome: t.construtoras.nome, logoKey: t.construtoras.logoKey, link: t.construtoras.link })
    .from(t.construtoras).where(and(eq(t.construtoras.ativo, true), sql`${t.construtoras.logoKey} is not null`))
    .orderBy(asc(t.construtoras.ordem), asc(t.construtoras.id));
}

type Foto = { key: string; thumbKey: string; largura: number; altura: number };
export async function fotosSite() {
  const r = await db.select().from(t.configuracoes).where(inArray(t.configuracoes.chave, [...CHAVES_FOTO]));
  return Object.fromEntries(r.map((x) => [x.chave, x.valor as Foto])) as Partial<Record<(typeof CHAVES_FOTO)[number], Foto>>;
}

export const precoCurto = (p: { preco: number | null; negocio: string }) => {
  if (p.preco == null) return 'Valor sob consulta';
  const v = 'R$ ' + p.preco.toLocaleString('pt-BR');
  return p.negocio === 'aluguel' ? v + '/mês' : v;
};
export const infoCurta = (p: { area: string | null; quartos: number | null; vagas: number | null }) =>
  [p.area ? `${String(Number(p.area)).replace('.', ',')} m²` : null, p.quartos ? `${p.quartos} quarto${p.quartos > 1 ? 's' : ''}` : null, p.vagas ? `${p.vagas} vaga${p.vagas > 1 ? 's' : ''}` : null]
    .filter(Boolean).join(' · ');

/** Capa do imóvel publicado mais recente (pro topo da home quando não há destaque). */
export async function ultimaCapa() {
  const [r] = await db.select({ key: sql<string>`f.key` }).from(t.imoveis)
    .innerJoin(sql`fotos f`, sql`f.imovel_id = ${t.imoveis.id}`)
    .where(and(eq(t.imoveis.visivel, true), sql`${t.imoveis.status} <> 'vendido'`))
    .orderBy(sql`${t.imoveis.publicadoEm} desc nulls last`, desc(t.imoveis.id), sql`f.ordem`, sql`f.id`).limit(1);
  return r?.key ?? null;
}
