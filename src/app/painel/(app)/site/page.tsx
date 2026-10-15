import { inArray } from 'drizzle-orm';
import { db, t } from '@/db';
import { CHAVES_FOTO, ROTULO_FOTO } from '@/lib/formato';
import { midiaUrl } from '@/lib/s3';
import { enviarFotoSite } from '../actions';
import Enviar from '../Enviar';

export default async function Site() {
  const rows = await db.select().from(t.configuracoes).where(inArray(t.configuracoes.chave, [...CHAVES_FOTO]));
  const v = new Map(rows.map((r) => [r.chave, r.valor as { key: string; thumbKey: string; largura: number; altura: number }]));
  return (
    <div className="stack">
      <div className="topo"><div><h1>Fotos do site</h1><p className="sub">As fotos de vocês que aparecem no site. Mandar uma nova substitui a anterior na hora.</p></div></div>
      <div className="grid2">
        {CHAVES_FOTO.map((k) => {
          const f = v.get(k);
          return (
            <section className="card" key={k}>
              <div><h2>{ROTULO_FOTO[k].t}</h2><p className="hint">{ROTULO_FOTO[k].s}</p></div>
              <div className="foto" style={{ aspectRatio: k === 'foto_casal' ? '4/3' : '3/4' }}>
                {f ? <img src={midiaUrl(f.thumbKey)} alt={ROTULO_FOTO[k].t} /> : <div className="vazio" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Sem foto ainda</div>}
              </div>
              <Enviar acao={enviarFotoSite.bind(null, k)} multiplo={false} texto={f ? 'Trocar foto' : 'Enviar foto'} />
            </section>
          );
        })}
      </div>
    </div>
  );
}
