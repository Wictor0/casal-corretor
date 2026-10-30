import { CONTATOS, INSTAGRAM, fotosSite } from '@/lib/site';
import { midiaUrl } from '@/lib/s3';
import { Seta } from '../../icones';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Contato', description: 'Fale direto com a Sumaia e o Allan pelo WhatsApp. Atendimento na capital e no litoral de São Paulo.' };

const INFOS = [
  { titulo: 'Região de atuação', texto: 'Capital e litoral de São Paulo. Muitos clientes chegam por indicação, então atendemos onde você estiver procurando.', icon: 'M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z' },
  { titulo: 'Horário de atendimento', texto: 'Segunda a sábado. Visitas aos domingos dependem das regras do condomínio e do proprietário.', icon: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2' },
  { titulo: 'Quer anunciar com a gente?', texto: 'Mande fotos e o endereço do imóvel pelo WhatsApp e agendamos uma avaliação.', icon: 'M3 11l9-7 9 7M5 10v10h14V10' },
];

export default async function Contato() {
  const fs = await fotosSite();
  const fotos = [fs.foto_sumaia, fs.foto_allan];
  const papel = ['Corretora', 'Corretor'];
  return (
    <main className="s-ct">
      <section className="w s-entra topo">
        <div className="hero">
          <h1>Vamos encontrar o <span className="ser">seu lugar?</span></h1>
          <p>Fale direto com a gente pelo WhatsApp. Quem responde somos nós dois, sem robô e sem fila.</p>
        </div>
        <div className="ig">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.8" /></svg>
          <div><b>Siga no Instagram</b><span>Imóveis novos, tours em vídeo e os bastidores do nosso dia a dia.</span></div>
          <a className="pill" href={INSTAGRAM} target="_blank" rel="noreferrer">@casalcorretoroficial<span className="seta"><Seta s={12} /></span></a>
        </div>
      </section>

      <section className="w corretores reveal">
        {CONTATOS.map((c, k) => (
          <div key={c.wa} className={'cartao' + (k === 0 ? ' escuro' : '')}>
            <div className="quem">
              {fotos[k] ? <img src={midiaUrl(fotos[k]!.thumbKey)} alt={c.nome} /> : <i />}
              <span><b>{c.nome}</b><small>{papel[k]} · {c.creci}</small></span>
            </div>
            <span className="fone">{c.tel}</span>
            <a className="pill" href={`https://wa.me/${c.wa}?text=${encodeURIComponent('Olá! Vim pelo site e queria conversar sobre um imóvel.')}`} target="_blank" rel="noreferrer">Conversar no WhatsApp<span className="seta"><Seta s={13} /></span></a>
          </div>
        ))}
      </section>

      <section className="w infos reveal">
        {INFOS.map((i) => (
          <div key={i.titulo}>
            <span className="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={i.icon} /></svg></span>
            <b>{i.titulo}</b>
            <p>{i.texto}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
