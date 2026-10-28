import 'server-only';
import { and, asc, desc, eq, ne, sql, type SQL } from 'drizzle-orm';
import { db, t } from '@/db';
import { lerCodigo } from './codigo';

export type Filtros = {
  negocio: 'todos' | 'venda' | 'aluguel' | 'terreno';
  codigo: string; tipo: string; local: string;
  preco: number | null; quartos: number; vagas: number;
  c: number[]; ordem: 'recentes' | 'menor' | 'maior' | 'area'; pag: number;
};
export const POR_PAGINA = 24;

type SP = Record<string, string | string[] | undefined>;
const um = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? '';
export function lerFiltros(sp: SP): Filtros {
  const neg = um(sp.negocio);
  const ord = um(sp.ordem);
  const n = (v: string) => { const x = parseInt(v, 10); return Number.isFinite(x) && x > 0 ? x : 0; };
  return {
    negocio: (['venda', 'aluguel', 'terreno'] as const).find((x) => x === neg) ?? 'todos',
    codigo: um(sp.codigo).slice(0, 20), tipo: um(sp.tipo).slice(0, 40), local: um(sp.local).slice(0, 60),
    preco: n(um(sp.preco)) || null, quartos: Math.min(n(um(sp.quartos)), 9), vagas: Math.min(n(um(sp.vagas)), 9),
    c: [sp.c].flat().filter(Boolean).map((x) => n(String(x))).filter(Boolean).slice(0, 20),
    ordem: (['menor', 'maior', 'area'] as const).find((x) => x === ord) ?? 'recentes',
    pag: Math.max(1, Math.min(n(um(sp.pag)), 50)),
  };
}

// comparação sem acento nem maiúscula, só com funções nativas do Postgres
const DE = 'áàâãäéèêëíìîïóòôõöúùûüçñ', PARA = 'aaaaaeeeeiiiiooooouuuucn';
const semAcento = (col: SQL | typeof t.imoveis.bairro | typeof t.imoveis.cidade) => sql`translate(lower(coalesce(${col}, '')), ${DE}, ${PARA})`;
const textoSemAcento = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export async function buscar(f: Filtros) {
  const conds: SQL[] = [eq(t.imoveis.visivel, true), ne(t.imoveis.status, 'vendido')];
  const cod = lerCodigo(f.codigo) ?? (f.codigo.replace(/\D/g, '').length >= 3 ? 'CC' + f.codigo.replace(/\D/g, '') : null);
  if (cod) conds.push(sql`${t.imoveis.codigo} like ${cod + '%'}`);
  else {
    // "Todos" mostra compra e aluguel; terrenos e retrofit têm a vitrine própria
    if (f.negocio === 'todos') conds.push(ne(t.imoveis.negocio, 'terreno'));
    else conds.push(eq(t.imoveis.negocio, f.negocio));
    if (f.tipo) conds.push(eq(t.imoveis.tipo, f.tipo));
    if (f.local) {
      const q = '%' + textoSemAcento(f.local) + '%';
      conds.push(sql`(${semAcento(t.imoveis.bairro)} like ${q} or ${semAcento(t.imoveis.cidade)} like ${q})`);
    }
    if (f.preco) conds.push(sql`${t.imoveis.preco} <= ${f.preco}`);
    if (f.quartos) conds.push(sql`coalesce(${t.imoveis.quartos}, 0) >= ${f.quartos}`);
    if (f.vagas) conds.push(sql`coalesce(${t.imoveis.vagas}, 0) >= ${f.vagas}`);
    for (const c of f.c) conds.push(sql`exists (select 1 from imovel_caracteristicas ic where ic.imovel_id = ${t.imoveis.id} and ic.caracteristica_id = ${c})`);
  }
  const where = and(...conds);
  const ordem = {
    recentes: [sql`${t.imoveis.publicadoEm} desc nulls last`, desc(t.imoveis.id)],
    menor: [sql`${t.imoveis.preco} asc nulls last`, desc(t.imoveis.id)],
    maior: [sql`${t.imoveis.preco} desc nulls last`, desc(t.imoveis.id)],
    area: [sql`coalesce(${t.imoveis.area}, ${t.imoveis.areaTerreno}) desc nulls last`, desc(t.imoveis.id)],
  }[f.ordem];
  const thumb = sql<string | null>`(select fo.thumb_key from fotos fo where fo.imovel_id = imoveis.id order by fo.ordem, fo.id limit 1)`;
  const [lista, [{ total }]] = await Promise.all([
    db.select({
      id: t.imoveis.id, codigo: t.imoveis.codigo, titulo: t.imoveis.titulo, negocio: t.imoveis.negocio, tipo: t.imoveis.tipo, status: t.imoveis.status,
      preco: t.imoveis.preco, area: t.imoveis.area, areaTerreno: t.imoveis.areaTerreno, quartos: t.imoveis.quartos, vagas: t.imoveis.vagas,
      bairro: t.imoveis.bairro, cidade: t.imoveis.cidade, estado: t.imoveis.estadoImovel, frente: t.imoveis.frente, thumb,
    }).from(t.imoveis).where(where).orderBy(...ordem).limit(POR_PAGINA * f.pag),
    db.select({ total: sql<number>`count(*)::int` }).from(t.imoveis).where(where),
  ]);
  return { lista, total: Number(total) };
}

export async function opcoesFiltro() {
  const [carac, bairros, tipos] = await Promise.all([
    db.select({ id: t.caracteristicas.id, nome: t.caracteristicas.nome }).from(t.caracteristicas)
      .where(and(eq(t.caracteristicas.filtro, true), eq(t.caracteristicas.tipo, 'simnao'))).orderBy(asc(t.caracteristicas.ordem), asc(t.caracteristicas.nome)),
    db.selectDistinct({ b: t.imoveis.bairro }).from(t.imoveis).where(and(eq(t.imoveis.visivel, true), sql`${t.imoveis.bairro} is not null`)).orderBy(asc(t.imoveis.bairro)),
    db.selectDistinct({ t: t.imoveis.tipo }).from(t.imoveis).where(eq(t.imoveis.visivel, true)).orderBy(asc(t.imoveis.tipo)),
  ]);
  return { carac, bairros: bairros.map((x) => x.b!), tipos: tipos.map((x) => x.t) };
}
