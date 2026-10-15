import { asc, count, eq } from 'drizzle-orm';
import { db, t } from '@/db';
import { criarCaracteristica, alternarFiltro, excluirCaracteristica } from '../actions';

const TIPO = { simnao: 'Sim/não', numero: 'Número', opcao: 'Texto' } as const;

export default async function Caracteristicas() {
  const lista = await db.select({ c: t.caracteristicas, uso: count(t.imovelCaracteristicas.imovelId) }).from(t.caracteristicas)
    .leftJoin(t.imovelCaracteristicas, eq(t.imovelCaracteristicas.caracteristicaId, t.caracteristicas.id))
    .groupBy(t.caracteristicas.id).orderBy(asc(t.caracteristicas.ordem), asc(t.caracteristicas.nome));
  return (
    <div className="stack">
      <div className="topo"><div><h1>Características</h1><p className="sub">A lista que aparece no cadastro dos imóveis (piscina, varanda, pet friendly…). As marcadas como <b>filtro</b> viram opção de busca no site.</p></div></div>
      <form action={criarCaracteristica} className="card">
        <h2>Nova característica</h2>
        <div className="row">
          <input className="in" name="nome" required placeholder="Ex.: Churrasqueira" style={{ maxWidth: 320 }} />
          <select className="in" name="tipo" style={{ maxWidth: 200 }}>{Object.entries(TIPO).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
          <button className="btn dark">Adicionar</button>
        </div>
        <span className="hint">Sim/não vira uma caixinha de marcar. Número e Texto viram um campo pra preencher (ex.: “Ano de construção”).</span>
      </form>
      <div className="lista">
        {lista.map(({ c, uso }) => (
          <div className="item" key={c.id}>
            <div className="info"><span className="t">{c.nome}</span><span className="s">{TIPO[c.tipo]} · em {uso} imóve{uso === 1 ? 'l' : 'is'}</span></div>
            <form action={alternarFiltro.bind(null, c.id)}><button className={'btn sm' + (c.filtro ? ' ouro' : '')}>{c.filtro ? 'É filtro no site' : 'Não é filtro'}</button></form>
            <form action={excluirCaracteristica.bind(null, c.id)}><button className="btn sm perigo" title={uso ? 'Também sai dos imóveis que usam' : undefined}>Excluir</button></form>
          </div>
        ))}
      </div>
    </div>
  );
}
