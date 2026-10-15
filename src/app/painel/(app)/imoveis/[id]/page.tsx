import Link from 'next/link';
import { notFound } from 'next/navigation';
import { asc, eq } from 'drizzle-orm';
import { db, t } from '@/db';
import { NEGOCIOS, STATUS, TIPOS, ESTADOS, TOPOGRAFIAS } from '@/lib/formato';
import { midiaUrl } from '@/lib/s3';
import { salvarImovel, excluirImovel, enviarFoto, moverFoto, excluirFoto } from '../../actions';
import Enviar from '../../Enviar';
import Confirmar from '../../Confirmar';

const num = (v: number | string | null) => (v == null ? '' : String(v).replace('.', ','));

export default async function Editar({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ salvo?: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const { salvo } = await searchParams;
  const [i] = await db.select().from(t.imoveis).where(eq(t.imoveis.id, id));
  if (!i) notFound();
  const [fotos, carac, marcadas] = await Promise.all([
    db.select().from(t.fotos).where(eq(t.fotos.imovelId, id)).orderBy(asc(t.fotos.ordem), asc(t.fotos.id)),
    db.select().from(t.caracteristicas).orderBy(asc(t.caracteristicas.ordem), asc(t.caracteristicas.nome)),
    db.select().from(t.imovelCaracteristicas).where(eq(t.imovelCaracteristicas.imovelId, id)),
  ]);
  const val = new Map(marcadas.map((m) => [m.caracteristicaId, m.valor ?? 'on']));
  const N = (name: keyof typeof i, label: string, hint?: string) => (
    <label className="lb">{label}<input className="in" name={name} inputMode="decimal" defaultValue={num(i[name] as number | string | null)} />{hint && <span className="hint">{hint}</span>}</label>
  );
  const T = (name: keyof typeof i, label: string, ph?: string) => (
    <label className="lb">{label}<input className="in" name={name} defaultValue={(i[name] as string) ?? ''} placeholder={ph} /></label>
  );

  return (
    <div className="stack">
      <div className="topo">
        <div><Link href="/painel" className="hint">← Imóveis</Link><h1>{i.titulo}</h1><p className="sub">{i.codigo} · {i.visivel ? 'Visível no site' : 'Oculto no site'}</p></div>
      </div>
      {salvo && <div className="ok">Alterações salvas.</div>}

      <section className="card">
        <div><h2>Fotos</h2><p className="hint">A primeira é a capa. Use ★ pra tornar capa e ← → pra reordenar. Pode mandar várias de uma vez, direto do celular.</p></div>
        {fotos.length > 0 && (
          <div className="fotos">
            {fotos.map((f, k) => (
              <div className="foto" key={f.id}>
                <img src={midiaUrl(f.thumbKey)} alt={`Foto ${k + 1}`} loading="lazy" />
                {k === 0 && <span className="chip ouro capa">Capa</span>}
                <div className="acoes">
                  <span style={{ display: 'flex', gap: 4 }}>
                    <form action={moverFoto.bind(null, f.id, -1)}><button disabled={k === 0} aria-label="Mover para trás">←</button></form>
                    <form action={moverFoto.bind(null, f.id, 1)}><button disabled={k === fotos.length - 1} aria-label="Mover para frente">→</button></form>
                    {k > 0 && <form action={moverFoto.bind(null, f.id, 'capa')}><button aria-label="Tornar capa">★</button></form>}
                  </span>
                  <form action={excluirFoto.bind(null, f.id)}><button aria-label="Excluir foto" style={{ color: 'var(--erro)' }}>✕</button></form>
                </div>
              </div>
            ))}
          </div>
        )}
        <Enviar acao={enviarFoto.bind(null, id)} />
      </section>

      <form action={salvarImovel.bind(null, id)} className="stack form-imovel">
        <section className="card">
          <h2>Publicação</h2>
          <label className="toggle"><span><b>Visível no site</b><br /><span className="hint">Desmarcado, o imóvel fica salvo só aqui no painel.</span></span><input type="checkbox" name="visivel" defaultChecked={i.visivel} /></label>
          <div className="lb">Situação
            <div className="seg">{Object.entries(STATUS).map(([k, v]) => <label key={k}><input type="radio" name="status" value={k} defaultChecked={i.status === k} /><span>{v}</span></label>)}</div>
          </div>
        </section>

        <section className="card">
          <h2>Dados principais</h2>
          <div className="lb">Tipo de negócio
            <div className="seg">{Object.entries(NEGOCIOS).map(([k, v]) => <label key={k}><input type="radio" name="negocio" value={k} defaultChecked={i.negocio === k} /><span>{v}</span></label>)}</div>
            <span className="hint">“Terrenos e retrofit” é pra terreno, casa pra demolir, imóvel no contrapiso ou pra reforma pesada. Aparece separado no site.</span>
          </div>
          <label className="lb">Título do anúncio<input className="in" name="titulo" defaultValue={i.titulo} required placeholder="Ex.: Apartamento com varanda gourmet no Brooklin" /></label>
          <div className="grid">
            <label className="lb">Tipo de imóvel<select className="in" name="tipo" defaultValue={i.tipo}>{TIPOS.map((x) => <option key={x}>{x}</option>)}</select></label>
            {N('preco', 'Preço (R$)', 'Venda: valor total. Aluguel: valor mensal.')}
            {N('condominio', 'Condomínio (R$/mês)')}
            {N('iptu', 'IPTU (R$/ano)')}
          </div>
          <div className="grid">
            {N('area', 'Área útil (m²)')}{N('quartos', 'Quartos')}{N('suites', 'Suítes')}{N('banheiros', 'Banheiros')}{N('vagas', 'Vagas')}{T('andar', 'Andar', 'Ex.: 12º')}
          </div>
        </section>

        <section className="card so-terreno">
          <div><h2>Dados do terreno / retrofit</h2><p className="hint">Só aparece quando o tipo de negócio é “Terrenos e retrofit”.</p></div>
          <div className="grid">
            {N('areaTerreno', 'Área do terreno (m²)')}{N('frente', 'Frente (m)')}{N('fundo', 'Fundo (m)')}{N('areaConstruida', 'Área construída (m²)')}
          </div>
          <div className="grid">
            <label className="lb">Estado do imóvel<select className="in" name="estadoImovel" defaultValue={i.estadoImovel ?? ''}><option value="">—</option>{ESTADOS.map((x) => <option key={x}>{x}</option>)}</select></label>
            <label className="lb">Topografia<select className="in" name="topografia" defaultValue={i.topografia ?? ''}><option value="">—</option>{TOPOGRAFIAS.map((x) => <option key={x}>{x}</option>)}</select></label>
            {T('zoneamento', 'Zoneamento', 'Ex.: ZM, ZEU')}
          </div>
        </section>

        <section className="card">
          <h2>Localização</h2>
          <div className="grid">{T('bairro', 'Bairro')}{T('cidade', 'Cidade')}</div>
          <label className="lb">Endereço<input className="in" name="endereco" defaultValue={i.endereco ?? ''} /><span className="hint">Não aparece no site, fica só pra vocês. No site vai bairro e cidade.</span></label>
        </section>

        <section className="card">
          <h2>Descrição</h2>
          <textarea className="in" name="descricao" defaultValue={i.descricao ?? ''} rows={8} style={{ height: 'auto', padding: 12, lineHeight: 1.6 }} placeholder="Conte o que o imóvel tem de especial. Pode quebrar em parágrafos." />
          <label className="lb">Vídeos (links do YouTube ou Instagram, um por linha)<textarea className="in" name="videos" defaultValue={i.videos.join('\n')} rows={3} style={{ height: 'auto', padding: 12 }} /></label>
        </section>

        <section className="card">
          <div><h2>Características</h2><p className="hint">Gerencie a lista na aba Características.</p></div>
          <div className="row">
            {carac.filter((c) => c.tipo === 'simnao').map((c) => (
              <label className="check" key={c.id}><input type="checkbox" name={'c_' + c.id} defaultChecked={val.has(c.id)} />{c.nome}</label>
            ))}
          </div>
          {carac.some((c) => c.tipo !== 'simnao') && (
            <div className="grid">{carac.filter((c) => c.tipo !== 'simnao').map((c) => (
              <label className="lb" key={c.id}>{c.nome}<input className="in" name={'c_' + c.id} defaultValue={val.get(c.id) ?? ''} inputMode={c.tipo === 'numero' ? 'numeric' : undefined} /></label>
            ))}</div>
          )}
        </section>

        <div className="barra-salvar">
          <button className="btn dark" style={{ height: 50, padding: '0 34px' }}>Salvar alterações</button>
          <Link className="btn" href="/painel">Voltar</Link>
        </div>
      </form>

      <section className="card" style={{ background: 'transparent', padding: 0 }}>
        <Confirmar acao={excluirImovel.bind(null, id)} texto="Excluir este imóvel" pergunta={`Excluir “${i.titulo}” e todas as fotos? Não dá pra desfazer.`} />
      </section>
    </div>
  );
}
