import Formulario from './Formulario';

export const metadata = { title: 'Seja corretor parceiro', description: 'Tem um cliente procurando imóvel em São Paulo? Faça parceria com o Casal Corretor.' };

const ETAPAS = [
  { n: '01', titulo: 'Você se inscreve', texto: 'Preencha o formulário com seus dados e o número do seu CRECI.' },
  { n: '02', titulo: 'A gente confere', texto: 'Sumaia e Allan analisam o CRECI e chamam você pra uma conversa rápida.' },
  { n: '03', titulo: 'Parceria ativa', texto: 'Você recebe a lista de imóveis disponíveis e pode levar seus clientes.' },
];
const FAQS = [
  ['Preciso ter CRECI ativo?', 'Sim. A parceria é só para corretores com inscrição ativa no CRECI.'],
  ['Como funciona a comissão?', 'A sua parte é combinada em contrato antes de cada negócio. O pagamento acompanha o que for acertado com o proprietário: pode ser na assinatura do contrato ou no final, quando ele recebe o valor do imóvel.'],
  ['Posso trazer clientes de outras regiões?', 'Pode. O importante é o cliente ter interesse em um dos imóveis da nossa carteira.'],
  ['Quanto tempo leva a análise?', 'A gente confere o CRECI e chama você no WhatsApp assim que possível.'],
];

export default function Parceiro() {
  return (
    <main className="s-pc">
      <section className="w s-entra topo">
        <div className="hero">
          <span className="tag"><i />Programa de parceiros</span>
          <h1>Seja um corretor <span className="ser">parceiro</span></h1>
          <p>Tem um cliente procurando imóvel em São Paulo? Traga ele pra um dos nossos imóveis e, se a venda fechar, você recebe uma parte da comissão, combinada em contrato. A gente cuida da negociação e da papelada junto com você.</p>
        </div>
        <div className="como">
          <span className="rot">Como funciona</span>
          {ETAPAS.map((e) => <div key={e.n}><b>{e.n}</b><span><strong>{e.titulo}</strong>{e.texto}</span></div>)}
        </div>
      </section>
      <section className="w corpo reveal">
        <Formulario />
        <aside className="s-faq-mini">
          {FAQS.map(([q, a], i) => (
            <details key={q} open={i === 0}>
              <summary>{q}<i>+</i></summary>
              <p>{a}</p>
            </details>
          ))}
        </aside>
      </section>
    </main>
  );
}
