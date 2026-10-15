import Link from 'next/link';
import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db, t } from '@/db';
import { STATUS_PARCEIRO } from '@/lib/formato';
import { statusParceiro, notasParceiro, excluirParceiro } from '../../actions';
import Confirmar from '../../Confirmar';

export default async function Parceiro({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const [p] = Number.isInteger(id) ? await db.select().from(t.parceiros).where(eq(t.parceiros.id, id)) : [];
  if (!p) notFound();
  const zap = p.whatsapp.replace(/\D/g, '');
  const linha = (k: string, v: React.ReactNode) => <div className="row" style={{ justifyContent: 'space-between', borderBottom: '1px solid #EEE9DF', paddingBottom: 10 }}><span className="hint">{k}</span><span style={{ textAlign: 'right' }}>{v || '—'}</span></div>;
  return (
    <div className="stack">
      <div className="topo"><div><Link href="/painel/parceiros" className="hint">← Corretores parceiros</Link><h1>{p.nome}</h1><p className="sub">Inscrição em {p.createdAt.toLocaleDateString('pt-BR')}</p></div></div>
      <section className="card">
        {linha('CRECI', <>{p.creci}-{p.uf} · <a href={`https://www.crecisp.gov.br/cidadao/buscaporcorretores`} target="_blank" rel="noreferrer">consultar no CRECI</a></>)}
        {linha('E-mail', <a href={`mailto:${p.email}`}>{p.email}</a>)}
        {linha('WhatsApp', <a href={`https://wa.me/${zap.length <= 11 ? '55' + zap : zap}`} target="_blank" rel="noreferrer">{p.whatsapp}</a>)}
        {linha('Regiões', p.regioes)}
        {linha('Experiência', p.experiencia)}
        <div className="lb">Sobre<p style={{ fontWeight: 400, color: 'var(--texto)', whiteSpace: 'pre-wrap' }}>{p.sobre || '—'}</p></div>
      </section>
      <section className="card">
        <h2>Status</h2>
        <div className="row">
          {Object.entries(STATUS_PARCEIRO).map(([k, v]) => (
            <form key={k} action={statusParceiro.bind(null, p.id, k as keyof typeof STATUS_PARCEIRO)}><button className={'btn sm' + (p.status === k ? ' dark' : '')}>{v}</button></form>
          ))}
        </div>
        <form action={notasParceiro.bind(null, p.id)} className="stack" style={{ gap: 10 }}>
          <label className="lb">Anotações internas<textarea className="in" name="notas" rows={4} defaultValue={p.notas ?? ''} style={{ height: 'auto', padding: 12 }} /></label>
          <div><button className="btn">Salvar anotação</button></div>
        </form>
      </section>
      <Confirmar acao={excluirParceiro.bind(null, p.id)} texto="Excluir inscrição" pergunta="Excluir esta inscrição?" />
    </div>
  );
}
