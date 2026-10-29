import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { carregarImovel, similares } from '@/lib/imovel';
import { exibirCodigo, lerCodigo, slugImovel } from '@/lib/codigo';
import { midiaUrl } from '@/lib/s3';
import { NEGOCIOS } from '@/lib/formato';
import { CONTATOS, fotosSite, WHATS } from '@/lib/site';
import { Seta } from '../../icones';
import Galeria from './Galeria';

export const dynamic = 'force-dynamic';
type P = { params: Promise<{ codigo: string }> };

const num = (v: string | number | null) => (v == null ? null : String(Number(v)).replace('.', ','));
const brl = (n: number) => 'R$ ' + n.toLocaleString('pt-BR');

function embed(url: string): { src: string; vertical: boolean } | null {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/);
  if (yt) return { src: `https://www.youtube-nocookie.com/embed/${yt[1]}`, vertical: /shorts\//.test(url) };
  const ig = url.match(/instagram\.com\/(?:p|reel|reels|tv)\/([\w-]+)/);
  if (ig) return { src: `https://www.instagram.com/p/${ig[1]}/embed`, vertical: true };
  return null;
}

async function dados(params: P['params']) {
  const { codigo } = await params;
  const cod = lerCodigo(decodeURIComponent(codigo));
  const i = cod ? await carregarImovel(cod) : null;
  if (!i) notFound();
  const certo = slugImovel(i);
  if (decodeURIComponent(codigo) !== certo) permanentRedirect(`/imovel/${certo}`);
  return i;
}

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { codigo } = await params;
  const cod = lerCodigo(decodeURIComponent(codigo));
  const i = cod ? await carregarImovel(cod) : null;
  if (!i) return { title: 'Imóvel' };
  const local = [i.bairro, i.cidade].filter(Boolean).join(', ');
  const desc = (i.descricao ?? `${i.tipo} em ${local}`).replace(/\s+/g, ' ').slice(0, 160);
  const base = process.env.APP_URL ? new URL(process.env.APP_URL) : undefined;
  return {
    title: `${i.titulo} · ${i.codigo}`,
    description: desc,
    metadataBase: base,
    alternates: { canonical: `/imovel/${slugImovel(i)}` },
    openGraph: { title: `${i.titulo} · ${i.preco ? brl(i.preco) : i.codigo}`, description: desc, images: i.fotos[0] ? [{ url: midiaUrl(i.fotos[0].key) }] : undefined, type: 'website', locale: 'pt_BR' },
  };
}

export default async function Imovel({ params }: P) {
  const i = await dados(params);
  const [parecidos, fs] = await Promise.all([similares(i), fotosSite()]);
  const terreno = i.negocio === 'terreno';
  const aluguel = i.negocio === 'aluguel';
  const codigo = exibirCodigo(i.codigo);
  const local = [i.bairro, i.cidade].filter(Boolean).join(', ');
  const msg = encodeURIComponent(`Olá! Tenho interesse no imóvel ${codigo}.`);
  const palavras = i.titulo.trim().split(/\s+/);
  const corte = palavras.length >= 4 ? palavras.length - 2 : palavras.length;

  const specs = (terreno
    ? [[num(i.areaTerreno), 'm² de terreno'], [i.frente && `${num(i.frente)} m`, 'de frente'], [i.fundo && `${num(i.fundo)} m`, 'de fundo'], [num(i.areaConstruida), 'm² construídos'], [i.topografia, 'topografia'], [i.zoneamento, 'zoneamento']]
    : [[num(i.area), 'm² úteis'], [i.quartos, i.quartos === 1 ? 'quarto' : 'quartos'], [i.suites, i.suites === 1 ? 'suíte' : 'suítes'], [i.banheiros, i.banheiros === 1 ? 'banheiro' : 'banheiros'], [i.vagas, i.vagas === 1 ? 'vaga' : 'vagas'], [i.andar, 'andar']]
  ).filter(([v]) => v != null && v !== '' && v !== 0) as [string | number, string][];
  const carac = i.carac.map((c) => (c.tipo === 'simnao' ? c.nome : `${c.nome}: ${c.valor}`));
  if (terreno && i.estadoImovel) carac.unshift(i.estadoImovel);
  const videos = i.videos.map((u) => ({ u, e: embed(u) }));
  const m2 = i.preco && !aluguel ? (terreno ? Number(i.areaTerreno) : Number(i.area)) : 0;
  const fotoCorretor = [fs.foto_sumaia, fs.foto_allan];

  return (
    <main className="s-imv">
      <section className="w s-entra">
        <nav className="migalha" aria-label="Você está em">
          <Link href="/">Início</Link>
          <Link href={terreno ? '/imoveis?negocio=terreno' : '/imoveis'}>{terreno ? 'Terrenos e retrofit' : 'Imóveis'}</Link>
          <span aria-current="page">{codigo}</span>
        </nav>
        <Galeria fotos={i.fotos.map((f) => ({ full: midiaUrl(f.key), thumb: midiaUrl(f.thumbKey) }))} titulo={i.titulo} codigo={codigo} />
      </section>

      <section className="w s-imv-corpo">
        <div className="col">
          <div className="bloco">
            <div className="tags">
              {terreno && <span className="esc">Terrenos e retrofit</span>}
              <span>{i.tipo} · {terreno ? 'Venda' : NEGOCIOS[i.negocio]}</span>
              {i.status === 'negociacao' && <span className="ouro">Em negociação</span>}
              {i.status === 'vendido' && <span className="esc">{aluguel ? 'Alugado' : 'Vendido'}</span>}
            </div>
            <h1>{palavras.slice(0, corte).join(' ')}{corte < palavras.length && <> <span className="ser">{palavras.slice(corte).join(' ')}</span></>}</h1>
            {local && <span className="end">{local}</span>}
            {specs.length > 0 && <div className="specs">{specs.map(([v, l]) => <div key={l}><b>{v}</b><span>{l}</span></div>)}</div>}
          </div>

          {i.descricao && (
            <div className="bloco">
              <h2>{terreno ? 'Sobre a oportunidade' : 'Sobre o imóvel'}</h2>
              {i.descricao.split(/\n\s*\n/).map((p, k) => <p key={k} className="txt">{p}</p>)}
            </div>
          )}

          {carac.length > 0 && (
            <div className="bloco">
              <h2>{terreno ? 'Potencial e características' : 'Características'}</h2>
              <div className="feats">{carac.map((c) => <span key={c}><i><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7" /></svg></i>{c}</span>)}</div>
            </div>
          )}

          <div className="duo">
            {terreno ? (
              <div className="bloco escuro">
                <h2>Como é a <span className="ser">visita</span></h2>
                <p className="txt">Imóveis de terreno e retrofit não têm visita aberta. A gente marca uma visita técnica com hora certa, e você pode levar seu arquiteto, engenheiro ou construtor.</p>
                <ol className="passos"><li>Você pede a ficha técnica do imóvel</li><li>Marcamos a visita técnica</li><li>Ajudamos com a proposta e a documentação</li></ol>
              </div>
            ) : videos.length > 0 ? (
              <div className="bloco escuro">
                <h2>Vídeos</h2>
                <div className="videos">
                  {videos.map(({ u, e }) => e
                    ? <iframe key={u} src={e.src} title="Vídeo do imóvel" loading="lazy" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen className={e.vertical ? 'v' : 'h'} />
                    : <a key={u} href={u} target="_blank" rel="noreferrer" className="vlink">Assistir vídeo ↗</a>)}
                </div>
              </div>
            ) : null}
            {local && (
              <div className="bloco areia">
                <h2>Localização</h2>
                <iframe className="mapa" title={`Mapa de ${local}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(local + ', SP')}&z=14&output=embed`} />
                <span className="nota">O endereço exato é passado no atendimento.</span>
              </div>
            )}
          </div>
          {terreno && videos.length > 0 && (
            <div className="bloco escuro">
              <h2>Vídeos</h2>
              <div className="videos">{videos.map(({ u, e }) => e ? <iframe key={u} src={e.src} title="Vídeo do imóvel" loading="lazy" allowFullScreen className={e.vertical ? 'v' : 'h'} /> : <a key={u} href={u} target="_blank" rel="noreferrer" className="vlink">Assistir vídeo ↗</a>)}</div>
            </div>
          )}
        </div>

        <aside className="lateral" aria-label="Valores e contato">
          <div className="bloco preco">
            <span className="rot">{aluguel ? 'Aluguel mensal' : 'Valor de venda'}</span>
            <b className="valor">{i.preco ? brl(i.preco) : 'Sob consulta'}</b>
            <div className="mini">
              {terreno
                ? <div><span>Valor do m² do terreno</span><b>{m2 ? '≈ ' + brl(Math.round(i.preco! / m2)) : 'consultar'}</b></div>
                : <div><span>Condomínio</span><b>{i.condominio ? brl(i.condominio) + '/mês' : 'consultar'}</b></div>}
              <div><span>IPTU</span><b>{i.iptu ? brl(i.iptu) + '/ano' : 'consultar'}</b></div>
            </div>
            {!terreno && m2 > 0 && <span className="nota">≈ {brl(Math.round(i.preco! / m2))}/m²</span>}
            {terreno && <span className="nota">Preço do imóvel no estado atual. Reforma e projeto ficam por conta do comprador.</span>}
            <a className="cta" href={`${WHATS}?text=${msg}`} target="_blank" rel="noreferrer">{terreno ? 'Quero analisar essa oportunidade' : 'Tenho interesse'}<span><Seta /></span></a>
            <span className="nota">A mensagem já vai pronta no WhatsApp: <em>“Olá! Tenho interesse no imóvel {codigo}.”</em></span>
          </div>
          {i.status === 'negociacao' && <div className="bloco aviso"><b>Em negociação, mas ainda aceita propostas</b><span>Fale com a gente antes que feche.</span></div>}
          {i.status === 'vendido' && <div className="bloco aviso"><b>Esse já foi {aluguel ? 'alugado' : 'vendido'}</b><span>Mas a gente encontra outro do seu jeito.</span></div>}
          {terreno && <div className="bloco aviso"><b>Visita técnica com hora marcada</b><span>Leve quem vai tocar a obra. A gente acompanha.</span></div>}
          <div className="bloco corretores">
            {CONTATOS.map((c, k) => (
              <a key={c.wa} href={`https://wa.me/${c.wa}?text=${msg}`} target="_blank" rel="noreferrer">
                {fotoCorretor[k] ? <img src={midiaUrl(fotoCorretor[k]!.thumbKey)} alt="" /> : <i />}
                <span><b>{c.nome}</b><small>{c.creci}</small></span>
                <span className="z"><Seta s={12} /></span>
              </a>
            ))}
          </div>
        </aside>
      </section>

      <div className="s-imv-barra">
        <span><small>{aluguel ? 'Aluguel' : 'Valor'}</small><b>{i.preco ? brl(i.preco) : 'Sob consulta'}</b></span>
        <a href={`${WHATS}?text=${msg}`} target="_blank" rel="noreferrer">Tenho interesse<i><Seta s={12} /></i></a>
      </div>

      {parecidos.length > 0 && (
        <section className="w s-imv-sim reveal">
          <h2>{terreno ? <>Outras <span className="ser">oportunidades</span></> : <>Você também pode <span className="ser">gostar</span></>}</h2>
          <div className="grade">
            {parecidos.map((p, k) => (
              <Link key={p.id} href={`/imovel/${slugImovel(p)}`} className="s-card lift zoom" style={{ background: ['#6B6F63', '#3A2E28', '#7D7266'][k] }}>
                {p.thumb && <img src={midiaUrl(p.thumb)} alt="" loading="lazy" />}
                <span className="bt"><strong>{p.preco ? brl(p.preco) + (p.negocio === 'aluguel' ? '/mês' : '') : 'Sob consulta'}</strong><b>{p.titulo}</b><small>{exibirCodigo(p.codigo)}{p.bairro ? ` · ${p.bairro}` : ''}</small></span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
