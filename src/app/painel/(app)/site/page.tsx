import { inArray } from 'drizzle-orm';
import { db, t } from '@/db';
import { CHAVES_FOTO, ROTULO_FOTO } from '@/lib/formato';
import { midiaUrl } from '@/lib/s3';
import { enviarFotoSite } from '../actions';
import Recorte from './Recorte';

export default async function Site() {
  const rows = await db.select().from(t.configuracoes).where(inArray(t.configuracoes.chave, [...CHAVES_FOTO]));
  const v = new Map(rows.map((r) => [r.chave, r.valor as { key: string; thumbKey: string; largura: number; altura: number }]));
  return (
    <div className="stack">
      <div className="topo"><div><h1>Fotos do site</h1><p className="sub">As fotos de vocês que aparecem no site. Mandar uma nova substitui a anterior na hora.</p></div></div>
      <div className="grid2">
        {(['foto_casal', 'foto_sumaia', 'foto_allan'] as const).map((k) => {
          const f = v.get(k);
          const bk = k === 'foto_sumaia' ? 'bola_sumaia' : k === 'foto_allan' ? 'bola_allan' : null;
          const b = bk ? v.get(bk) : undefined;
          return (
            <section className="card" key={k}>
              <div><h2>{ROTULO_FOTO[k].t}</h2><p className="hint">{ROTULO_FOTO[k].s}</p></div>
              <div className="foto" style={{ aspectRatio: k === 'foto_casal' ? '16/9' : '4/5' }}>
                {f ? <img src={midiaUrl(f.thumbKey) + '?v=' + encodeURIComponent(f.key)} alt={ROTULO_FOTO[k].t} /> : <div className="vazio" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Sem foto ainda</div>}
              </div>
              <Recorte acao={enviarFotoSite.bind(null, k)} atual={f ? midiaUrl(f.key) : undefined} titulo={ROTULO_FOTO[k].t}
                proporcao={k === 'foto_casal' ? 16 / 9 : 4 / 5} largura={k === 'foto_casal' ? 2400 : 1400} />
              {bk && (
                <div className="bola-bloco">
                  <div className="row" style={{ gap: 14 }}>
                    <span className="bola">{b ? <img src={midiaUrl(b.thumbKey) + '?v=' + encodeURIComponent(b.key)} alt="" /> : f ? <img src={midiaUrl(f.thumbKey)} alt="" style={{ objectPosition: 'center 20%' }} /> : null}</span>
                    <div><b style={{ fontSize: 14 }}>{ROTULO_FOTO[bk].t}</b><p className="hint" style={{ margin: 0 }}>{b ? ROTULO_FOTO[bk].s : f ? 'Ainda usando o retrato. Recorte o rosto pra ficar certinho.' : 'Sem foto ainda.'}</p></div>
                  </div>
                  <Recorte acao={enviarFotoSite.bind(null, bk)} atual={b ? midiaUrl(b.key) : undefined} origem={f ? midiaUrl(f.key) : undefined}
                    titulo={ROTULO_FOTO[bk].t} proporcao={1} largura={600} circulo />
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
