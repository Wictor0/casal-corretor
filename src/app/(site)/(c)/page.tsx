import Link from 'next/link';
import { midiaUrl } from '@/lib/s3';
import { NEGOCIOS, TIPOS } from '@/lib/formato';
import { bairros, construtoras, destaques, fotosSite, infoCurta, precoCurto, INSTAGRAM, WHATS } from '@/lib/site';
import { Seta, SETA_BAIXO } from '../icones';
import Trilho from '../Trilho';
import { exibirCodigo, slugImovel } from '@/lib/codigo';

export const dynamic = 'force-dynamic';

const STATS = [
  { n: 'A dois', suf: '', label: 'um casal no mesmo atendimento, do início às chaves', cor: '#6B6F63' },
  { n: 'SP', suf: ' + litoral', label: 'capital e litoral paulista', cor: '#B48B5A' },
  { n: '2,5', suf: 'mil', label: 'seguidores acompanhando os imóveis', cor: '#3A2E28' },
];
const VALORES = [
  { titulo: 'Atendimento a dois', texto: 'Dois corretores, uma só conversa. Sempre alguém disponível pra você.', icon: 'M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM2 20c0-3 3-5 6-5s6 2 6 5M12 20c0-3 3-5 5-5s5 2 5 5', bg: '#5A4B42', img: '/home/valor-1.webp' },
  { titulo: 'Curadoria de verdade', texto: 'Só mostramos imóveis que conhecemos e que fazem sentido pra você.', icon: 'M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9z', bg: '#6B6F63', img: '/home/valor-2.webp' },
  { titulo: 'Negociação segura', texto: 'Proposta, documentação e contrato acompanhados de perto até a entrega.', icon: 'M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6zM8.5 12l2.5 2.5 4.5-5', bg: '#3A2E28', img: '/home/valor-3.webp' },
];
const FAQS = [
  ['Quero comprar um imóvel. Como funciona?', 'A gente entende o que você procura, faz uma curadoria entre os imóveis da nossa carteira e acompanha as visitas com você. Depois cuidamos da proposta e da documentação até a entrega das chaves.'],
  ['Vocês também ajudam quem quer alugar?', 'Sim. Selecionamos opções prontas pra morar dentro do seu orçamento e acompanhamos a negociação e o contrato.'],
  ['Quero vender meu imóvel. O que vocês fazem?', 'Avaliamos o imóvel, produzimos fotos e vídeos pro site e pro Instagram e cuidamos da divulgação e das visitas, do primeiro contato à assinatura.'],
  ['Não encontrei o imóvel que procuro. E agora?', 'Conte pra gente no WhatsApp como é o imóvel ideal. Buscamos opções que ainda nem estão no site e avisamos quando aparecer algo do seu jeito.'],
  ['O que são os imóveis de Terrenos e retrofit?', 'São casas antigas ou imóveis no contrapiso, procurados por quem quer reformar do zero ou aproveitar o terreno. Eles ficam separados dos outros e a visita é técnica, com hora marcada.'],
  ['Em quais regiões vocês atuam?', 'Em São Paulo e no litoral paulista. Não ficamos presos a um bairro: muitos clientes chegam por indicação, e a gente vai até onde estiver o imóvel certo pra você.'],
  ['Como agendo uma visita?', 'É só chamar a Sumaia ou o Allan no WhatsApp com o código do imóvel (por exemplo, CC1001). A gente combina o melhor horário pra você.'],
];
const PASSOS = [
  { titulo: 'Conversa e curadoria', texto: 'Entendemos o que você procura, seu momento e seu orçamento, e montamos uma seleção sob medida.' },
  { titulo: 'Visitas acompanhadas', texto: 'Visitamos juntos, tiramos dúvidas na hora e comparamos as opções com você.' },
  { titulo: 'Proposta e chaves', texto: 'Cuidamos da negociação, da documentação e do contrato até a entrega das chaves.' },
];
const BAIRROS_PADRAO = ['Vila Mariana', 'Bela Vista', 'Mooca', 'Vila Prudente'];
const TONS = ['#5A4B42', '#6B6F63', '#3A2E28', '#7D7266'];

export default async function Home() {
  const [lista, bs, cs, fotos] = await Promise.all([destaques(), bairros(), construtoras(), fotosSite()]);
  const semana = lista.find((p) => p.principal) ?? lista[0];
  const listaB = bs.length >= 3 ? bs : BAIRROS_PADRAO;
  const casal = fotos.foto_casal;
  // repete os logos até preencher a fita, e duplica para o loop contínuo
  const base = cs.length ? Array.from({ length: Math.max(1, Math.ceil(8 / cs.length)) }, () => cs).flat() : [];

  return (
    <main>
      <div className="w">
        <section className="s-hero s-entra">
          <div className="txt">
            <span className="tag"><i />Curadoria de imóveis em São Paulo</span>
            <h1>Do primeiro lar ao <span className="ser">imóvel dos sonhos</span></h1>
            <p>Curadoria de lares com personalidade para quem vive São Paulo com estilo. Um atendimento a dois, do primeiro contato às chaves.</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link className="pill dark" href="/imoveis">Ver imóveis<span className="seta"><Seta d={SETA_BAIXO} /></span></Link>
              <a className="pill light" href={WHATS} target="_blank" rel="noreferrer">Anunciar meu imóvel</a>
            </div>
            <div className="s-stats">
              {STATS.map((s) => <div key={s.n}><i style={{ background: s.cor }} /><b>{s.n}<em>{s.suf}</em></b><span>{s.label}</span></div>)}
            </div>
          </div>
          <div className="s-capa">
            {semana?.capa ? <img src={midiaUrl(semana.capa)} alt="" fetchPriority="high" /> : casal ? <img src={midiaUrl(casal.key)} alt="Sumaia e Allan" fetchPriority="high" /> : <img className="simb" src="/simbolo-clara.svg" alt="" />}
            <div className="chips">
              <a href={WHATS} target="_blank" rel="noreferrer">Agendar visita</a>
              <a href={INSTAGRAM} target="_blank" rel="noreferrer">2.500+ no Instagram</a>
            </div>
            {semana && (
              <Link className="s-sem" href={`/imovel/${slugImovel(semana)}`}>
                <span style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <small>Destaque da semana · {exibirCodigo(semana.codigo)}</small>
                  <b>{semana.titulo}{semana.bairro ? ` · ${semana.bairro}` : ''}</b>
                </span>
                <span className="seta"><Seta /></span>
              </Link>
            )}
          </div>
        </section>

        <form className="s-busca reveal" action="/imoveis" role="search">
          <div className="modo" role="radiogroup" aria-label="Pretensão">
            {Object.entries(NEGOCIOS).map(([k, v], i) => (
              <label key={k}><input type="radio" name="negocio" value={k} defaultChecked={i === 0} /><span>{k === 'venda' ? 'Comprar' : k === 'aluguel' ? 'Alugar' : v}</span></label>
            ))}
          </div>
          <label className="c"><span>Tipo</span><select name="tipo" defaultValue=""><option value="">Todos os tipos</option>{TIPOS.map((t) => <option key={t}>{t}</option>)}</select></label>
          <label className="c"><span>Bairro ou cidade</span><input name="local" placeholder="Ex.: Vila Mariana" /></label>
          <label className="c" style={{ flexBasis: 140 }}><span>Código</span><input name="codigo" placeholder="CC1001" /></label>
          <button type="submit"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>Buscar</button>
        </form>

        <section className="s-casal reveal">
          <div className="l">
            <h2>Um casal cuidando de cada <span className="ser">negociação</span></h2>
            <p>Você fala sempre com quem conhece o imóvel de verdade. Sumaia e Allan acompanham cada visita, cada proposta e cada documento.</p>
            <div className="s-predios" aria-hidden="true"><div className="s-predios-in">
              <span className="px px1"><img className="flt-b" src="/home/predio-1.webp" alt="" style={{ left: '-0.9%', bottom: '21.6%', width: '37.7%', height: '61.9%' }} /></span>
              <span className="px px2"><img className="flt-a" src="/home/predio-2.webp" alt="" style={{ left: '20.9%', bottom: '10.8%', width: '50.6%', height: '86.9%' }} /></span>
              <span className="px px3"><img className="flt-b" src="/home/predio-3.webp" alt="" style={{ left: '40.6%', bottom: '20%', width: '59%', height: '56.8%' }} /></span></div>
            </div>
          </div>
          <div className="r">
            {VALORES.map((v) => (
              <div className="s-valor lift" key={v.titulo}>
                <img className="ic" src={v.img} alt="" loading="lazy" style={{ background: v.bg }} />
                <div style={{ paddingRight: 12 }}><b>{v.titulo}</b><span>{v.texto}</span></div>
              </div>
            ))}
          </div>
        </section>

        {lista.length > 0 && (
          <section className="s-dest reveal-t">
            <div className="box">
              <div className="top">
                <h2>Imóveis em <span className="ser">destaque</span></h2>
                <p>Seleção escolhida a dedo pelo casal. Atualizada toda semana.</p>
              </div>
              <Trilho rotulo="Imóveis em destaque" extra={<Link className="pill dark" href="/imoveis">Ver todos os imóveis<span className="seta"><Seta d={SETA_BAIXO} /></span></Link>}>
                  {lista.map((p, i) => (
                    <Link key={p.id} href={`/imovel/${slugImovel(p)}`} className="s-card lift zoom" style={{ background: TONS[i % 4] }}>
                      {p.thumb && <img src={midiaUrl(p.thumb)} alt="" loading="lazy" />}
                      <span className="tp">
                        <span>{NEGOCIOS[p.negocio] === 'Terrenos e retrofit' ? 'Retrofit' : NEGOCIOS[p.negocio]}</span>
                        {p.status === 'negociacao' && <span className="neg">Em negociação</span>}
                        {p.status === 'vendido' && <span className="neg">{p.negocio === 'aluguel' ? 'Alugado' : 'Vendido'}</span>}
                      </span>
                      <span className="bt">
                        <b>{p.titulo}</b>
                        <small>{[p.bairro, infoCurta(p)].filter(Boolean).join(' · ')}</small>
                        <strong>{precoCurto(p)}</strong>
                      </span>
                    </Link>
                  ))}
              </Trilho>
            </div>
          </section>
        )}
      </div>

      {base.length > 0 && (
        <section className="s-constr reveal" aria-label="Construtoras parceiras">
          <span className="t">Construtoras parceiras</span>
          <div className="s-marq">
            <div className="fita" style={{ ['--dur' as string]: `${Math.max(20, base.length * 4)}s` }}>
              {[...base, ...base].map((c, i) => {
                const img = <img src={midiaUrl(c.logoKey!)} alt={i < base.length ? c.nome : ''} loading="lazy" />;
                return c.link
                  ? <a key={i} className="s-logo" href={c.link} target="_blank" rel="noreferrer" aria-hidden={i >= base.length || undefined} tabIndex={i >= base.length ? -1 : undefined}>{img}</a>
                  : <span key={i} className="s-logo" aria-hidden={i >= base.length || undefined}>{img}</span>;
              })}
            </div>
          </div>
        </section>
      )}

      <div className="w">
        <section className="s-faq reveal">
          <div className="l">
            <span className="tag">Dúvidas frequentes</span>
            <h2>Como podemos <span className="ser">ajudar</span></h2>
            <p>Comprar, alugar ou vender: as respostas pras perguntas que mais chegam no nosso WhatsApp.</p>
            <a className="pill dark lift" style={{ alignSelf: 'flex-start' }} href={WHATS} target="_blank" rel="noreferrer">Falar com a gente<span className="seta ouro"><Seta s={13} /></span></a>
          </div>
          <div className="r">
            {FAQS.map(([q, a], i) => (
              <details key={q} open={i === 0}>
                <summary>{q}<i><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg></i></summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="s-passos reveal">
          <div className="box">
            <div className="top">
              <h2>Três passos até as <span className="ser">chaves</span></h2>
              <p>Do primeiro contato à entrega, a gente caminha junto em cada etapa.</p>
            </div>
            <div className="g">
              {PASSOS.map((p, i) => (
                <div className="p lift" key={p.titulo}>
                  <div className="n"><b>0{i + 1}</b><span>Passo {i + 1} de 3</span></div>
                  <div className="bars">{[0, 1, 2].map((k) => <i key={k} className={k <= i ? 'on' : undefined} />)}</div>
                  <h3>{p.titulo}</h3>
                  <p>{p.texto}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="s-bairros reveal">
          <h2>Busque por <span className="ser">bairro</span></h2>
          <div className="l">
            {listaB.map((b) => <Link key={b} href={`/imoveis?local=${encodeURIComponent(b)}`}>{b}<span><Seta s={12} /></span></Link>)}
          </div>
        </section>
      </div>
      <div className="s-gigante" aria-hidden="true">casal corretor</div>
    </main>
  );
}
