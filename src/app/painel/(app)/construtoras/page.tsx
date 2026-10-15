import { asc } from 'drizzle-orm';
import { db, t } from '@/db';
import { midiaUrl } from '@/lib/s3';
import { criarConstrutora, trocarLogo, alternarConstrutora, moverConstrutora, excluirConstrutora } from '../actions';
import Confirmar from '../Confirmar';

export default async function Construtoras() {
  const lista = await db.select().from(t.construtoras).orderBy(asc(t.construtoras.ordem), asc(t.construtoras.id));
  return (
    <div className="stack">
      <div className="topo"><div><h1>Construtoras parceiras</h1><p className="sub">Os logos que passam em loop na página inicial. Melhor em <b>SVG</b> ou <b>PNG com fundo transparente</b>. No site os logos aparecem num tom só, pra ficarem harmônicos.</p></div></div>
      <form action={criarConstrutora} className="card">
        <h2>Adicionar construtora</h2>
        <div className="grid2">
          <label className="lb">Nome<input className="in" name="nome" required placeholder="Ex.: Cyrela" /></label>
          <label className="lb">Site (opcional)<input className="in" name="link" type="url" placeholder="https://" /></label>
          <label className="lb">Logo<input className="in" name="logo" type="file" accept="image/svg+xml,image/png,image/webp,image/jpeg" style={{ paddingTop: 10 }} /></label>
        </div>
        <div><button className="btn dark">Adicionar</button></div>
      </form>
      <div className="lista">
        {lista.length === 0 && <div className="vazio">Nenhuma construtora ainda.</div>}
        {lista.map((c, k) => (
          <div className="item" key={c.id} style={{ flexWrap: 'wrap' }}>
            <div style={{ width: 140, height: 64, borderRadius: 12, background: 'var(--off)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 10 }}>
              {c.logoKey ? <img src={midiaUrl(c.logoKey)} alt={c.nome} style={{ maxWidth: '100%', maxHeight: '100%' }} /> : <span className="hint">sem logo</span>}
            </div>
            <div className="info"><span className="t">{c.nome}</span><span className="s">{c.link ?? 'sem link'}</span></div>
            <form action={trocarLogo.bind(null, c.id)} className="row" style={{ gap: 6 }}>
              <input name="logo" type="file" accept="image/svg+xml,image/png,image/webp,image/jpeg" required style={{ fontSize: 12, maxWidth: 190 }} />
              <button className="btn sm">Trocar logo</button>
            </form>
            <form action={alternarConstrutora.bind(null, c.id)}><button className={'chip ' + (c.ativo ? 'salvia' : 'erro')} style={{ border: 'none', cursor: 'pointer' }}>{c.ativo ? 'No site' : 'Oculta'}</button></form>
            <form action={moverConstrutora.bind(null, c.id, -1)}><button className="ico" disabled={k === 0}>↑</button></form>
            <form action={moverConstrutora.bind(null, c.id, 1)}><button className="ico" disabled={k === lista.length - 1}>↓</button></form>
            <Confirmar acao={excluirConstrutora.bind(null, c.id)} texto="Excluir" pergunta={`Excluir ${c.nome}?`} />
          </div>
        ))}
      </div>
    </div>
  );
}
