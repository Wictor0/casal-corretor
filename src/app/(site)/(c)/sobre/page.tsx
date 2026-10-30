import Link from 'next/link';
import { CONTATOS, fotosSite } from '@/lib/site';
import { midiaUrl } from '@/lib/s3';
import { Seta, SETA_BAIXO } from '../../icones';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Sobre nós', description: 'Sumaia e Allan: um casal de corretores com curadoria de lares em São Paulo e no litoral paulista.' };

const BIOS = [
  'Veio da auditoria, responsabilidade social e sustentabilidade. Traz para a corretagem o cuidado, a escuta e o olhar criterioso para cada detalhe.',
  'Engenheiro civil, com passagem por obras e pela Prefeitura de São Paulo. Usa o conhecimento técnico para transformar projetos em possibilidades reais.',
];
const PASSOS = [
  ['Escuta', 'Entendemos o que você procura, seu momento de vida, seu orçamento e o que não pode faltar no seu próximo lar.'],
  ['Curadoria', 'Selecionamos só imóveis que conhecemos e que fazem sentido de verdade, pra você não perder tempo com visitas à toa.'],
  ['Visitas acompanhadas', 'Visitamos juntos, respondemos as dúvidas na hora e ajudamos a comparar as opções com calma.'],
  ['Negociação até as chaves', 'Cuidamos da proposta, da análise de documentos e do contrato, acompanhando cada etapa até a entrega das chaves.'],
];

export default async function Sobre() {
  const fs = await fotosSite();
  const retratos = [fs.foto_sumaia, fs.foto_allan];
  return (
    <main className="s-sb">
      <section className="w s-entra">
        <div className="hero">
          {fs.foto_casal && <img src={midiaUrl(fs.foto_casal.key)} alt="Sumaia e Allan" fetchPriority="high" />}
          <div className="txt">
            <h1>Mais do que imóveis, conectamos <span className="ser">pessoas a lugares</span></h1>
            <Link className="pill claro" href="/contato">Vamos conversar<span className="seta"><Seta s={13} /></span></Link>
          </div>
        </div>
      </section>

      <section className="w linha reveal">
        <div className="numeros">
          <span className="rot">Casal Corretor em poucas palavras</span>
          <div><span><small>No mercado imobiliário</small><b>desde 2022</b></span><span><em>SP + litoral</em><small>capital e litoral paulista</small></span></div>
        </div>
        <div className="quem">
          <div className="t">
            <h2>Quem <span className="ser">somos</span></h2>
            <p>Somos a Sumaia e o Allan, um casal de corretores que leva a parceria da vida para cada atendimento. Ela vem da auditoria e da sustentabilidade, com olhar atento para pessoas e detalhes. Ele é engenheiro civil, com experiência em obras e na Prefeitura de São Paulo.</p>
            <p>Fazemos uma curadoria de lares com personalidade para quem vive São Paulo com estilo, na compra, venda e locação, em São Paulo e no litoral paulista.</p>
          </div>
          <div className="lado"><img src="/simbolo.svg" alt="" /></div>
        </div>
      </section>

      <section className="w duplas reveal">
        {CONTATOS.map((c, k) => (
          <div key={c.wa}>
            {retratos[k] ? <img src={midiaUrl(retratos[k]!.thumbKey)} alt={c.nome} loading="lazy" /> : <i />}
            <span><b>{c.nome}</b><small>Corretor{k === 0 ? 'a' : ''} de imóveis · {c.creci}</small><p>{BIOS[k]}</p></span>
          </div>
        ))}
      </section>

      <section className="w historia reveal">
        <div className="l">
          <span className="rot">Nossa história</span>
          <h2>Duas trajetórias, um encontro e um novo jeito de <span className="ser">encontrar lares</span></h2>
          <div className="frase"><b>É sobre pessoas.</b><span>Trabalhar com imóveis nunca foi só sobre metragem, número de dormitórios ou localização.</span></div>
        </div>
        <div className="r">
          <p className="abre">Nossa história começou muito antes da criação da Casal Corretor. Ao longo da vida profissional, construímos experiências em áreas diferentes, que hoje se complementam de uma maneira muito especial.</p>
          <p><strong>Sumaia</strong> construiu a carreira em auditoria, responsabilidade social e sustentabilidade, acompanhando empresas, pessoas e processos de perto. Foram anos viajando, conhecendo realidades diferentes e desenvolvendo um olhar atento para detalhes, organização, qualidade e, principalmente, para as pessoas por trás de cada negócio.</p>
          <p>Com a chegada da filha, Luiza, vieram novas prioridades. Foi aí que ela encontrou na corretagem um caminho mais próximo das pessoas e da cidade, sem abrir mão do que sempre fez parte dela: o cuidado, a escuta e o olhar criterioso para cada detalhe.</p>
          <p><strong>Allan</strong> é formado e atuante em Engenharia Civil. Passou pelo setor de obras e pela Prefeitura de São Paulo, acompanhando de perto projetos, obras e a dinâmica de uma das maiores cidades do mundo. Na corretagem, o conhecimento técnico sobre construção e imóveis se juntou à habilidade de entender necessidades e transformar projetos em possibilidades reais.</p>
          <p>Somos parceiros na vida e no trabalho. Aprendemos a dividir decisões, desafios e conquistas, e hoje levamos essa parceria para cada atendimento. A Casal Corretor nasceu desse encontro: experiência, conhecimento técnico, olhar humano e o desejo de fazer diferente.</p>
          <p>Acreditamos que um imóvel pode ser muito mais do que um endereço. Pode ser o lugar onde uma família começa uma nova fase, onde uma criança cresce, onde sonhos ganham forma e histórias são construídas.</p>
        </div>
      </section>

      <section className="w como reveal">
        <h2>Como <span className="ser">trabalhamos</span></h2>
        {PASSOS.map(([t, x], i) => (
          <details key={t} open={i === 0}><summary><b>0{i + 1}</b><span>{t}</span><i>+</i></summary><p>{x}</p></details>
        ))}
      </section>

      <section className="w fecho reveal">
        <div>
          <p>Nós não queremos apenas encontrar um imóvel para você. Queremos ajudar você a encontrar <span>o seu lar.</span></p>
          <Link className="pill dark" href="/imoveis">Ver imóveis<span className="seta"><Seta d={SETA_BAIXO} /></span></Link>
        </div>
      </section>
    </main>
  );
}
