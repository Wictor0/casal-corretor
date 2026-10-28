import Link from 'next/link';
import { db, t } from '@/db';
import { and, asc, desc, eq, ilike, or, sql, type SQL } from 'drizzle-orm';
import { brl, NEGOCIOS, STATUS, MAX_DESTAQUES } from '@/lib/formato';
import { midiaUrl } from '@/lib/s3';
import { exibirCodigo, lerCodigo } from '@/lib/codigo';
import { alternar, definirPrincipal, moverDestaque, criarImovel } from './actions';

type SP = Promise<{ q?: string; negocio?: string; excluido?: string }>;

export default async function Imoveis({ searchParams }: { searchParams: SP }) {
  const { q, negocio, excluido } = await searchParams;
  const conds: SQL[] = [];
  const cod = lerCodigo(q);
  if (cod) conds.push(eq(t.imoveis.codigo, cod));
  else if (q) conds.push(or(ilike(t.imoveis.titulo, `%${q}%`), ilike(t.imoveis.codigo, `%${q.replace(/-/g, '')}%`), ilike(t.imoveis.bairro, `%${q}%`))!);
  if (negocio && negocio in NEGOCIOS) conds.push(eq(t.imoveis.negocio, negocio as keyof typeof NEGOCIOS));
  const capa = sql<string | null>`(select f.thumb_key from fotos f where f.imovel_id = imoveis.id order by f.ordem, f.id limit 1)`;
  const nfotos = sql<number>`(select count(*) from fotos f where f.imovel_id = imoveis.id)`;
  const lista = await db.select({ i: t.imoveis, capa, nfotos }).from(t.imoveis).where(conds.length ? and(...conds) : undefined).orderBy(desc(t.imoveis.updatedAt));
  const destaques = await db.select({ id: t.imoveis.id, titulo: t.imoveis.titulo, codigo: t.imoveis.codigo, principal: t.imoveis.destaquePrincipal, visivel: t.imoveis.visivel, capa })
    .from(t.imoveis).where(eq(t.imoveis.destaque, true)).orderBy(asc(t.imoveis.destaqueOrdem), desc(t.imoveis.id));
  const temPrincipal = destaques.some((d) => d.principal);

  return (
    <div className="stack">
      <div className="topo">
        <div><h1>Imóveis</h1><p className="sub">Cadastre, edite e escolha o que aparece no site. Imóvel novo começa <b>oculto</b>: só vai pro site quando você marcar “Visível no site”.</p></div>
        <div className="row">
          <form action={criarImovel}><input type="hidden" name="negocio" value="venda" /><button className="btn dark">+ Novo imóvel</button></form>
          <form action={criarImovel}><input type="hidden" name="negocio" value="terreno" /><button className="btn">+ Terreno / retrofit</button></form>
        </div>
      </div>
      {excluido && <div className="ok">Imóvel excluído.</div>}

      <section className="card">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div><h2>Destaques da página inicial</h2><p className="hint">Até {MAX_DESTAQUES} imóveis, na ordem abaixo. A ★ marca o <b>destaque da semana</b> (o grandão do topo). Sem ★, o site usa o primeiro da lista.</p></div>
          <span className="chip">{destaques.length}/{MAX_DESTAQUES}</span>
        </div>
        {destaques.length === 0 ? <p className="hint">Nenhum ainda. Use o botão “Destacar” nos imóveis da lista.</p> : (
          <div className="lista" style={{ border: '1px solid #EEE9DF' }}>
            {destaques.map((d, k) => (
              <div className="item" key={d.id}>
                <span className="hint" style={{ width: 18 }}>{k + 1}</span>
                {d.capa ? <img className="thumb" src={midiaUrl(d.capa)} alt="" /> : <div className="thumb" />}
                <div className="info"><span className="t">{d.titulo}</span><span className="s">{exibirCodigo(d.codigo)}{!d.visivel && ' · oculto no site (não aparece)'}</span></div>
                {(d.principal || (!temPrincipal && k === 0)) && <span className="chip ouro">Destaque da semana{!d.principal && ' (automático)'}</span>}
                <form action={definirPrincipal.bind(null, d.id)}><button className={'ico' + (d.principal ? ' on' : '')} title="Destaque da semana">★</button></form>
                <form action={moverDestaque.bind(null, d.id, -1)}><button className="ico" disabled={k === 0} title="Subir">↑</button></form>
                <form action={moverDestaque.bind(null, d.id, 1)}><button className="ico" disabled={k === destaques.length - 1} title="Descer">↓</button></form>
                <form action={alternar.bind(null, d.id, 'destaque')}><button className="btn sm">Tirar</button></form>
              </div>
            ))}
          </div>
        )}
      </section>

      <form className="row">
        <input className="in" style={{ maxWidth: 340 }} name="q" defaultValue={q} placeholder="Buscar por título, código ou bairro" />
        <select className="in" style={{ maxWidth: 220 }} name="negocio" defaultValue={negocio ?? ''}>
          <option value="">Todos</option>
          {Object.entries(NEGOCIOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <button className="btn">Filtrar</button>
        {(q || negocio) && <Link className="btn sm" href="/painel">Limpar</Link>}
      </form>

      <div className="lista">
        {lista.length === 0 && <div className="vazio">Nenhum imóvel {q || negocio ? 'com esse filtro' : 'cadastrado ainda'}.</div>}
        {lista.map(({ i, capa, nfotos }) => (
          <div className="item" key={i.id}>
            <Link href={`/painel/imoveis/${i.id}`}>{capa ? <img className="thumb" src={midiaUrl(capa)} alt="" /> : <div className="thumb" />}</Link>
            <Link className="info" href={`/painel/imoveis/${i.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <span className="t">{i.titulo}</span>
              <span className="s">{exibirCodigo(i.codigo)} · {NEGOCIOS[i.negocio]} · {i.tipo}{i.bairro ? ' · ' + i.bairro : ''} · {brl(i.preco)} · {Number(nfotos)} foto{Number(nfotos) === 1 ? '' : 's'}</span>
            </Link>
            {i.status !== 'disponivel' && <span className={'chip ' + (i.status === 'vendido' ? 'preto' : 'ouro')}>{STATUS[i.status]}</span>}
            <form action={alternar.bind(null, i.id, 'visivel')}><button className={'chip ' + (i.visivel ? 'salvia' : 'erro')} style={{ border: 'none', cursor: 'pointer' }} title="Clique para alternar">{i.visivel ? 'Visível no site' : 'Oculto'}</button></form>
            <form action={alternar.bind(null, i.id, 'destaque')}><button className={'btn sm' + (i.destaque ? ' ouro' : '')} disabled={!i.destaque && destaques.length >= MAX_DESTAQUES}>{i.destaque ? '★ Em destaque' : 'Destacar'}</button></form>
            <Link className="btn sm dark" href={`/painel/imoveis/${i.id}`}>Editar</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
