'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { eq, and, sql, asc, desc, ne } from 'drizzle-orm';
import { db, t } from '@/db';
import { exigirUsuario } from '@/lib/auth';
import { processarFoto, processarLogo } from '@/lib/imagens';
import { apagar } from '@/lib/s3';
import { int, dec, txt, CHAVES_FOTO, MAX_DESTAQUES } from '@/lib/formato';
import { atribuirCodigo, zonaAutomatica } from '@/lib/codigos-db';
import { ZONAS } from '@/lib/codigo';

const rv = () => revalidatePath('/', 'layout');

/* ---------- Imóveis ---------- */
export async function criarImovel(fd: FormData) {
  await exigirUsuario();
  const negocio = (String(fd.get('negocio') || 'venda')) as 'venda' | 'aluguel' | 'terreno';
  const [r] = await db.insert(t.imoveis).values({ codigo: 'tmp-' + crypto.randomUUID(), titulo: 'Novo imóvel', negocio, tipo: negocio === 'terreno' ? 'Casa' : 'Apartamento' }).returning({ id: t.imoveis.id });
  await db.update(t.imoveis).set({ codigo: 'R' + r.id }).where(eq(t.imoveis.id, r.id));
  redirect(`/painel/imoveis/${r.id}`);
}

export async function salvarImovel(id: number, fd: FormData) {
  await exigirUsuario();
  const negocio = String(fd.get('negocio')) as 'venda' | 'aluguel' | 'terreno';
  const bairro = txt(fd.get('bairro')), cidade = txt(fd.get('cidade'));
  const zSel = Number(fd.get('zona'));
  const zonaManual = zSel in ZONAS;
  const zona = zonaManual ? zSel : await zonaAutomatica(bairro, cidade, id);
  const [antes] = await db.select({ pub: t.imoveis.publicadoEm }).from(t.imoveis).where(eq(t.imoveis.id, id));
  const querVisivel = fd.get('visivel') === 'on';
  const semZona = querVisivel && !zona;
  const videos = String(fd.get('videos') || '').split(/\s+/).map((s) => s.trim()).filter((s) => /^https?:\/\//.test(s));
  await db.update(t.imoveis).set({
    titulo: txt(fd.get('titulo')) || 'Sem título',
    negocio, tipo: txt(fd.get('tipo')) || 'Apartamento',
    status: (String(fd.get('status')) as 'disponivel' | 'negociacao' | 'vendido'),
    preco: int(fd.get('preco')), condominio: int(fd.get('condominio')), iptu: int(fd.get('iptu')),
    area: dec(fd.get('area')), quartos: int(fd.get('quartos')), suites: int(fd.get('suites')), banheiros: int(fd.get('banheiros')), vagas: int(fd.get('vagas')),
    andar: txt(fd.get('andar')), bairro, cidade, zona, zonaManual, endereco: txt(fd.get('endereco')),
    descricao: txt(fd.get('descricao')), videos,
    areaTerreno: dec(fd.get('areaTerreno')), frente: dec(fd.get('frente')), fundo: dec(fd.get('fundo')), areaConstruida: dec(fd.get('areaConstruida')),
    estadoImovel: txt(fd.get('estadoImovel')), topografia: txt(fd.get('topografia')), zoneamento: txt(fd.get('zoneamento')),
    visivel: querVisivel && !semZona,
    ...(querVisivel && !semZona && !antes?.pub ? { publicadoEm: new Date() } : {}),
    updatedAt: new Date(),
  }).where(eq(t.imoveis.id, id));
  // características
  const carac = await db.select().from(t.caracteristicas);
  await db.delete(t.imovelCaracteristicas).where(eq(t.imovelCaracteristicas.imovelId, id));
  const linhas = carac.flatMap((c): { imovelId: number; caracteristicaId: number; valor: string | null }[] => {
    const v = fd.get('c_' + c.id);
    if (c.tipo === 'simnao') return v === 'on' ? [{ imovelId: id, caracteristicaId: c.id, valor: null }] : [];
    const s = txt(v); return s ? [{ imovelId: id, caracteristicaId: c.id, valor: s }] : [];
  });
  if (linhas.length) await db.insert(t.imovelCaracteristicas).values(linhas);
  await atribuirCodigo(id);
  rv();
  redirect(`/painel/imoveis/${id}?${semZona ? 'erro=zona' : 'salvo=1'}`);
}

export async function excluirImovel(id: number) {
  await exigirUsuario();
  const fs = await db.select().from(t.fotos).where(eq(t.fotos.imovelId, id));
  await Promise.all(fs.flatMap((f) => [apagar(f.key), apagar(f.thumbKey)]));
  await db.delete(t.imoveis).where(eq(t.imoveis.id, id));
  rv();
  redirect('/painel?excluido=1');
}

export async function alternar(id: number, campo: 'visivel' | 'destaque') {
  await exigirUsuario();
  const col = campo === 'visivel' ? t.imoveis.visivel : t.imoveis.destaque;
  if (campo === 'destaque') {
    const [atual] = await db.select({ d: t.imoveis.destaque }).from(t.imoveis).where(eq(t.imoveis.id, id));
    if (!atual) return;
    if (atual.d) { await db.update(t.imoveis).set({ destaque: false, destaquePrincipal: false }).where(eq(t.imoveis.id, id)); rv(); return; }
    const [{ n }] = await db.select({ n: sql<number>`count(*)` }).from(t.imoveis).where(eq(t.imoveis.destaque, true));
    if (Number(n) >= MAX_DESTAQUES) return;
    const [{ m }] = await db.select({ m: sql<number>`coalesce(max(${t.imoveis.destaqueOrdem}),0)` }).from(t.imoveis);
    await db.update(t.imoveis).set({ destaque: true, destaqueOrdem: Number(m) + 1 }).where(eq(t.imoveis.id, id));
  } else {
    const [i] = await db.select({ v: t.imoveis.visivel, zona: t.imoveis.zona, pub: t.imoveis.publicadoEm }).from(t.imoveis).where(eq(t.imoveis.id, id));
    if (!i) return;
    if (!i.v && !i.zona) redirect(`/painel/imoveis/${id}?erro=zona`);
    await db.update(t.imoveis).set({ visivel: !i.v, ...(!i.v && !i.pub ? { publicadoEm: new Date() } : {}) }).where(eq(t.imoveis.id, id));
    await atribuirCodigo(id);
  }
  rv();
}

export async function definirPrincipal(id: number) {
  await exigirUsuario();
  const [atual] = await db.select({ p: t.imoveis.destaquePrincipal }).from(t.imoveis).where(eq(t.imoveis.id, id));
  await db.update(t.imoveis).set({ destaquePrincipal: false }).where(ne(t.imoveis.id, -1));
  if (!atual?.p) await db.update(t.imoveis).set({ destaquePrincipal: true, destaque: true }).where(eq(t.imoveis.id, id));
  rv();
}

export async function moverDestaque(id: number, dir: -1 | 1) {
  await exigirUsuario();
  const lista = await db.select({ id: t.imoveis.id }).from(t.imoveis).where(eq(t.imoveis.destaque, true)).orderBy(asc(t.imoveis.destaqueOrdem), desc(t.imoveis.id));
  const i = lista.findIndex((x) => x.id === id); const j = i + dir;
  if (i < 0 || j < 0 || j >= lista.length) return;
  [lista[i], lista[j]] = [lista[j], lista[i]];
  await Promise.all(lista.map((x, k) => db.update(t.imoveis).set({ destaqueOrdem: k }).where(eq(t.imoveis.id, x.id))));
  rv();
}

/* ---------- Fotos ---------- */
export async function enviarFoto(imovelId: number, fd: FormData) {
  await exigirUsuario();
  const file = fd.get('foto');
  if (!(file instanceof File) || !file.size) return { erro: 'Arquivo vazio' };
  if (file.size > 25 * 1024 * 1024) return { erro: 'Foto muito grande (máx. 25 MB)' };
  const r = await processarFoto(file, `imoveis/${imovelId}`);
  const [{ m }] = await db.select({ m: sql<number>`coalesce(max(${t.fotos.ordem}),-1)` }).from(t.fotos).where(eq(t.fotos.imovelId, imovelId));
  await db.insert(t.fotos).values({ imovelId, ...r, ordem: Number(m) + 1 });
  rv();
  return { ok: true };
}

async function reordenar(imovelId: number, ids: number[]) {
  await Promise.all(ids.map((id, k) => db.update(t.fotos).set({ ordem: k }).where(and(eq(t.fotos.id, id), eq(t.fotos.imovelId, imovelId)))));
}
export async function moverFoto(fotoId: number, dir: -1 | 1 | 'capa') {
  await exigirUsuario();
  const [f] = await db.select().from(t.fotos).where(eq(t.fotos.id, fotoId)); if (!f) return;
  const ids = (await db.select({ id: t.fotos.id }).from(t.fotos).where(eq(t.fotos.imovelId, f.imovelId)).orderBy(asc(t.fotos.ordem), asc(t.fotos.id))).map((x) => x.id);
  const i = ids.indexOf(fotoId);
  if (dir === 'capa') { ids.splice(i, 1); ids.unshift(fotoId); }
  else { const j = i + dir; if (j < 0 || j >= ids.length) return; [ids[i], ids[j]] = [ids[j], ids[i]]; }
  await reordenar(f.imovelId, ids);
  rv();
}
export async function excluirFoto(fotoId: number) {
  await exigirUsuario();
  const [f] = await db.delete(t.fotos).where(eq(t.fotos.id, fotoId)).returning();
  if (f) await Promise.all([apagar(f.key), apagar(f.thumbKey)]);
  rv();
}

/* ---------- Características ---------- */
export async function criarCaracteristica(fd: FormData) {
  await exigirUsuario();
  const nome = txt(fd.get('nome')); if (!nome) return;
  const tipo = String(fd.get('tipo') || 'simnao') as 'simnao' | 'numero' | 'opcao';
  const [{ m }] = await db.select({ m: sql<number>`coalesce(max(${t.caracteristicas.ordem}),-1)` }).from(t.caracteristicas);
  await db.insert(t.caracteristicas).values({ nome, tipo, ordem: Number(m) + 1 }).onConflictDoNothing();
  rv();
}
export async function alternarFiltro(id: number) {
  await exigirUsuario();
  await db.update(t.caracteristicas).set({ filtro: sql`not ${t.caracteristicas.filtro}` }).where(eq(t.caracteristicas.id, id));
  rv();
}
export async function excluirCaracteristica(id: number) {
  await exigirUsuario();
  await db.delete(t.caracteristicas).where(eq(t.caracteristicas.id, id));
  rv();
}

/* ---------- Construtoras ---------- */
export async function criarConstrutora(fd: FormData) {
  await exigirUsuario();
  const nome = txt(fd.get('nome')); if (!nome) return;
  const file = fd.get('logo');
  const logoKey = file instanceof File && file.size ? await processarLogo(file, 'construtoras') : null;
  const [{ m }] = await db.select({ m: sql<number>`coalesce(max(${t.construtoras.ordem}),-1)` }).from(t.construtoras);
  await db.insert(t.construtoras).values({ nome, link: txt(fd.get('link')), logoKey, ordem: Number(m) + 1 });
  rv();
}
export async function trocarLogo(id: number, fd: FormData) {
  await exigirUsuario();
  const file = fd.get('logo'); if (!(file instanceof File) || !file.size) return;
  const [c] = await db.select().from(t.construtoras).where(eq(t.construtoras.id, id));
  const logoKey = await processarLogo(file, 'construtoras');
  await db.update(t.construtoras).set({ logoKey }).where(eq(t.construtoras.id, id));
  if (c?.logoKey) await apagar(c.logoKey);
  rv();
}
export async function alternarConstrutora(id: number) {
  await exigirUsuario();
  await db.update(t.construtoras).set({ ativo: sql`not ${t.construtoras.ativo}` }).where(eq(t.construtoras.id, id));
  rv();
}
export async function moverConstrutora(id: number, dir: -1 | 1) {
  await exigirUsuario();
  const lista = await db.select({ id: t.construtoras.id }).from(t.construtoras).orderBy(asc(t.construtoras.ordem), asc(t.construtoras.id));
  const i = lista.findIndex((x) => x.id === id); const j = i + dir;
  if (i < 0 || j < 0 || j >= lista.length) return;
  [lista[i], lista[j]] = [lista[j], lista[i]];
  await Promise.all(lista.map((x, k) => db.update(t.construtoras).set({ ordem: k }).where(eq(t.construtoras.id, x.id))));
  rv();
}
export async function excluirConstrutora(id: number) {
  await exigirUsuario();
  const [c] = await db.delete(t.construtoras).where(eq(t.construtoras.id, id)).returning();
  if (c?.logoKey) await apagar(c.logoKey);
  rv();
}

/* ---------- Corretores parceiros ---------- */
export async function statusParceiro(id: number, status: 'nova' | 'analise' | 'aprovado' | 'recusado') {
  await exigirUsuario();
  await db.update(t.parceiros).set({ status }).where(eq(t.parceiros.id, id));
  rv();
}
export async function notasParceiro(id: number, fd: FormData) {
  await exigirUsuario();
  await db.update(t.parceiros).set({ notas: txt(fd.get('notas')) }).where(eq(t.parceiros.id, id));
  rv();
}
export async function excluirParceiro(id: number) {
  await exigirUsuario();
  await db.delete(t.parceiros).where(eq(t.parceiros.id, id));
  rv();
  redirect('/painel/parceiros');
}

/* ---------- Fotos do site ---------- */
export async function enviarFotoSite(chave: string, fd: FormData) {
  await exigirUsuario();
  if (!(CHAVES_FOTO as readonly string[]).includes(chave)) return { erro: 'Campo inválido' };
  const file = fd.get('foto'); if (!(file instanceof File) || !file.size) return { erro: 'Arquivo vazio' };
  const r = await processarFoto(file, 'site', { max: 2000, thumb: 600 });
  const [antigo] = await db.select().from(t.configuracoes).where(eq(t.configuracoes.chave, chave));
  await db.insert(t.configuracoes).values({ chave, valor: r, updatedAt: new Date() }).onConflictDoUpdate({ target: t.configuracoes.chave, set: { valor: r, updatedAt: new Date() } });
  const v = antigo?.valor as { key?: string; thumbKey?: string } | null;
  if (v?.key) await Promise.all([apagar(v.key), apagar(v.thumbKey || '')]);
  rv();
  return { ok: true };
}
