import Link from 'next/link';
import { desc, eq } from 'drizzle-orm';
import { db, t } from '@/db';
import { STATUS_PARCEIRO } from '@/lib/formato';

type St = keyof typeof STATUS_PARCEIRO;
const COR: Record<St, string> = { nova: 'ouro', analise: '', aprovado: 'salvia', recusado: 'erro' };

export default async function Parceiros({ searchParams }: { searchParams: Promise<{ s?: string }> }) {
  const { s } = await searchParams;
  const filtro = s && s in STATUS_PARCEIRO ? (s as St) : undefined;
  const lista = await db.select().from(t.parceiros).where(filtro ? eq(t.parceiros.status, filtro) : undefined).orderBy(desc(t.parceiros.createdAt));
  return (
    <div className="stack">
      <div className="topo"><div><h1>Corretores parceiros</h1><p className="sub">Inscrições que chegam pela página “Seja parceiro” do site. Confiram o CRECI antes de aprovar.</p></div></div>
      <div className="row">
        <Link className={'btn sm' + (!filtro ? ' dark' : '')} href="/painel/parceiros">Todas</Link>
        {Object.entries(STATUS_PARCEIRO).map(([k, v]) => <Link key={k} className={'btn sm' + (filtro === k ? ' dark' : '')} href={`/painel/parceiros?s=${k}`}>{v}</Link>)}
      </div>
      <div className="lista">
        {lista.length === 0 && <div className="vazio">Nenhuma inscrição {filtro ? 'nesse status' : 'ainda'}. Quando o site for ao ar, elas aparecem aqui.</div>}
        {lista.map((p) => (
          <Link className="item" key={p.id} href={`/painel/parceiros/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="info"><span className="t">{p.nome}</span><span className="s">CRECI {p.creci}-{p.uf} · {p.regioes ?? '—'} · {p.createdAt.toLocaleDateString('pt-BR')}</span></div>
            <span className={'chip ' + COR[p.status]}>{STATUS_PARCEIRO[p.status]}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
