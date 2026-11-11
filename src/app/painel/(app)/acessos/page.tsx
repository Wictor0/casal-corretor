import Link from 'next/link';
import { sql, and, gte, eq, desc, count, countDistinct, isNotNull } from 'drizzle-orm';
import { db, t } from '@/db';
import { exibirCodigo } from '@/lib/codigo';
import GeradorLink from './GeradorLink';
import Grafico from './Grafico';
import Ajuda from './Ajuda';
import { trafegoCloudflare } from '@/lib/cloudflare';

const PERIODOS = { '7': 'Últimos 7 dias', '30': 'Últimos 30 dias', '90': 'Últimos 90 dias' } as const;
const NOME_PAG: Record<string, string> = { '/': 'Início', '/imoveis': 'Lista de imóveis', '/sobre': 'Sobre nós', '/contato': 'Contato', '/parceiro': 'Seja parceiro' };
const NOME_ORIGEM: Record<string, string> = { instagram: 'Instagram', facebook: 'Facebook', google: 'Google', whatsapp: 'WhatsApp', linkedin: 'LinkedIn', tiktok: 'TikTok', bing: 'Bing', x: 'X (Twitter)' };
const n = (v: number) => v.toLocaleString('pt-BR');

function Barras({ itens, total }: { itens: { nome: React.ReactNode; v: number; k: string }[]; total: number }) {
  if (!itens.length) return <p className="hint">Ainda sem dados nesse período.</p>;
  const max = Math.max(...itens.map((i) => i.v), 1);
  return (
    <div className="ac-barras">
      {itens.map((i) => (
        <div key={i.k} className="ac-linha">
          <div className="ac-fundo" style={{ width: `${(i.v / max) * 100}%` }} />
          <span className="ac-nome">{i.nome}</span>
          <b>{n(i.v)}</b><small>{total ? Math.round((i.v / total) * 100) : 0}%</small>
        </div>
      ))}
    </div>
  );
}

export default async function Acessos({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  const { p } = await searchParams;
  const dias = p && p in PERIODOS ? Number(p) : 30;
  const desde = new Date(Date.now() - dias * 864e5);
  const v = t.visitas;
  const noPeriodo = gte(v.criadoEm, desde);
  const pv = and(noPeriodo, eq(v.tipo, 'pv'));
  const diaSp = sql<string>`to_char(${v.criadoEm} at time zone 'America/Sao_Paulo', 'YYYY-MM-DD')`;

  const [[tot], [pessoas], porTipo, porDia, paginas, imoveis, origens, campanhas, aparelhos] = await Promise.all([
    db.select({ v: count() }).from(v).where(pv),
    db.select({ v: countDistinct(sql`${v.visitante} || ${diaSp}`) }).from(v).where(pv),
    db.select({ tipo: v.tipo, v: count() }).from(v).where(noPeriodo).groupBy(v.tipo),
    db.select({ dia: diaSp, v: sql<number>`count(*) filter (where ${v.tipo} = 'pv')`.mapWith(Number), p: sql<number>`count(distinct ${v.visitante}) filter (where ${v.tipo} = 'pv')`.mapWith(Number), w: sql<number>`count(*) filter (where ${v.tipo} = 'whats')`.mapWith(Number) }).from(v).where(noPeriodo).groupBy(diaSp).orderBy(diaSp),
    db.select({ k: v.caminho, v: count() }).from(v).where(and(pv, sql`${v.imovelId} is null`)).groupBy(v.caminho).orderBy(desc(count())).limit(8),
    db.select({ id: v.imovelId, codigo: t.imoveis.codigo, titulo: t.imoveis.titulo, v: count(), w: sql<number>`count(*) filter (where ${v.tipo} = 'whats')`.mapWith(Number) })
      .from(v).innerJoin(t.imoveis, eq(t.imoveis.id, v.imovelId)).where(noPeriodo).groupBy(v.imovelId, t.imoveis.codigo, t.imoveis.titulo)
      .orderBy(desc(sql`count(*) filter (where ${v.tipo} = 'pv')`)).limit(10),
    db.select({ k: sql<string>`coalesce(${v.origem}, 'direto')`, v: countDistinct(sql`${v.visitante} || ${diaSp}`) }).from(v).where(pv).groupBy(sql`1`).orderBy(desc(sql`2`)).limit(8),
    db.select({ k: v.campanha, origem: v.origem, v: countDistinct(sql`${v.visitante} || ${diaSp}`), w: sql<number>`count(*) filter (where ${v.tipo} = 'whats')`.mapWith(Number) })
      .from(v).where(and(noPeriodo, isNotNull(v.campanha))).groupBy(v.campanha, v.origem).orderBy(desc(sql`3`)).limit(10),
    db.select({ k: v.dispositivo, v: countDistinct(sql`${v.visitante} || ${diaSp}`) }).from(v).where(pv).groupBy(v.dispositivo).orderBy(desc(sql`2`)),
  ]);
  const cf = await trafegoCloudflare(dias);
  const whats = porTipo.find((x) => x.tipo === 'whats')?.v ?? 0;
  const comp = porTipo.find((x) => x.tipo === 'compartilhar')?.v ?? 0;

  // Dias sem visita aparecem como zero no gráfico
  const mapa = new Map(porDia.map((d) => [d.dia, d]));
  const serie = Array.from({ length: dias }, (_, i) => {
    const d = new Date(Date.now() - (dias - 1 - i) * 864e5).toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
    return { dia: d, p: mapa.get(d)?.p ?? 0, v: mapa.get(d)?.v ?? 0, w: mapa.get(d)?.w ?? 0 };
  });
  const totPessoas = origens.reduce((s, o) => s + o.v, 0);

  return (
    <div className="stack">
      <div className="topo"><div><h1>Acessos do site</h1><p className="sub">Quantas pessoas visitaram, de onde vieram e o que mais chamou atenção. Visitas de vocês logados no painel não entram na conta.</p></div></div>
      <div className="row">
        {Object.entries(PERIODOS).map(([k, l]) => <Link key={k} className={'btn sm' + (String(dias) === k ? ' dark' : '')} href={`/painel/acessos?p=${k}`}>{l}</Link>)}
      </div>

      <div className="ac-nums">
        <div className="card"><small>Visitantes</small><b>{n(pessoas.v)}</b><span className="hint">pessoas diferentes por dia, somadas</span></div>
        <div className="card"><small>Páginas vistas</small><b>{n(tot.v)}</b><span className="hint">{pessoas.v ? (tot.v / pessoas.v).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) : 0} por visitante</span></div>
        <div className="card destaque"><small>Cliques no WhatsApp</small><b>{n(whats)}</b><span className="hint">{pessoas.v ? ((whats / pessoas.v) * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) : 0}% dos visitantes</span></div>
        <div className="card"><small>Imóveis compartilhados</small><b>{n(comp)}</b><span className="hint">pelo botão de compartilhar</span></div>
      </div>

      <div className="card">
        <h2 className="ac-t">Visitantes por dia</h2>
        <Grafico legenda="visitantes" dados={serie.map((d) => ({ dia: d.dia, valor: d.p, linhas: [['visitantes', d.p], ['páginas vistas', d.v], ['cliques no WhatsApp', d.w]] }))} />
      </div>


      {cf && (
        <div className="card">
          <h2 className="ac-t">Tráfego total do domínio <span className="chip">Cloudflare</span><Ajuda /></h2>
          {cf.erro ? <p className="hint">{cf.erro}</p> : (() => {
            const m = new Map(cf.dias.map((d) => [d.dia, d]));
            const s = Array.from({ length: dias }, (_, i) => { const d = new Date(Date.now() - (dias - 1 - i) * 864e5).toISOString().slice(0, 10); return { dia: d, v: m.get(d)?.visitantes ?? 0, p: m.get(d)?.paginas ?? 0 }; });
            const pico = Math.max(...s.map((d) => d.v)), mx = Math.max(pico, 1);
            const totV = s.reduce((a, d) => a + d.v, 0), totP = s.reduce((a, d) => a + d.p, 0);
            return (<>
              <p className="hint">Conta desde o lançamento do site, incluindo acessos de robôs — por isso mostra mais que os números de cima.</p>
              <div className="ac-mini"><span><b>{n(totV)}</b> visitantes (soma dos dias)</span><span><b>{n(totP)}</b> páginas vistas</span><span>pico: <b>{n(pico)}</b> num dia</span><span className="hint">Passe o mouse ou toque numa barra para ver o dia.</span></div>
              <Grafico variante="cf" legenda="visitantes" dados={s.map((d) => ({ dia: d.dia, valor: d.v, linhas: [['visitantes', d.v], ['páginas vistas', d.p]] }))} />
            </>);
          })()}
        </div>
      )}

      <div className="ac-duas">
        <div className="card"><h2 className="ac-t">De onde vieram</h2>
          <Barras total={totPessoas} itens={origens.map((o) => ({ k: o.k, v: o.v, nome: o.k === 'direto' ? 'Direto (link digitado ou app)' : NOME_ORIGEM[o.k] ?? o.k }))} />
        </div>
        <div className="card"><h2 className="ac-t">Páginas mais vistas</h2>
          <Barras total={tot.v} itens={paginas.map((x) => ({ k: x.k, v: x.v, nome: NOME_PAG[x.k] ?? x.k }))} />
        </div>
      </div>

      <div className="card"><h2 className="ac-t">Imóveis mais vistos</h2>
        {imoveis.length === 0 ? <p className="hint">Ainda sem dados nesse período.</p> : (
          <table className="ac-tab"><thead><tr><th>Imóvel</th><th>Visitas</th><th>WhatsApp</th></tr></thead>
            <tbody>{imoveis.map((i) => (
              <tr key={i.id}><td><Link href={`/painel/imoveis/${i.id}`}><b>{exibirCodigo(i.codigo)}</b> · {i.titulo}</Link></td><td>{n(i.v - i.w)}</td><td>{n(i.w)}</td></tr>
            ))}</tbody></table>
        )}
      </div>

      <div className="ac-duas">
        <div className="card"><h2 className="ac-t">Campanhas (links com UTM)</h2>
          {campanhas.length === 0 ? <p className="hint">Nenhuma ainda. Use o gerador ao lado nos links de anúncios, stories e bio para saber qual trouxe mais gente.</p> : (
            <table className="ac-tab"><thead><tr><th>Campanha</th><th>Visitantes</th><th>WhatsApp</th></tr></thead>
              <tbody>{campanhas.map((c) => <tr key={`${c.k}${c.origem}`}><td><b>{c.k}</b> · {NOME_ORIGEM[c.origem ?? ''] ?? c.origem ?? '—'}</td><td>{n(c.v)}</td><td>{n(c.w)}</td></tr>)}</tbody></table>
          )}
        </div>
        <div className="card"><h2 className="ac-t">Gerar link com UTM</h2><GeradorLink /></div>
      </div>

      <div className="card"><h2 className="ac-t">Aparelhos</h2>
        <Barras total={aparelhos.reduce((s, a) => s + a.v, 0)} itens={aparelhos.map((a) => ({ k: a.k ?? '?', v: a.v, nome: (a.k ?? 'outro').replace(/^./, (c) => c.toUpperCase()) }))} />
      </div>
    </div>
  );
}
