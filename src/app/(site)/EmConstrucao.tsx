import Link from 'next/link';
import { WHATS } from '@/lib/site';
import { Seta } from './icones';

export function Obra() {
  // Casa sendo erguida: blocos sobem um a um, telhado desce, porta e janelas acendem; a grua balança.
  const blocos = [
    { x: 60, y: 150, w: 44, h: 26, d: 0 }, { x: 104, y: 150, w: 44, h: 26, d: 0.25, b2: true }, { x: 148, y: 150, w: 44, h: 26, d: 0.5 },
    { x: 60, y: 124, w: 44, h: 26, d: 0.75, b2: true }, { x: 104, y: 124, w: 44, h: 26, d: 1 }, { x: 148, y: 124, w: 44, h: 26, d: 1.25, b2: true },
    { x: 60, y: 98, w: 44, h: 26, d: 1.5 }, { x: 104, y: 98, w: 44, h: 26, d: 1.75, b2: true }, { x: 148, y: 98, w: 44, h: 26, d: 2 },
  ];
  return (
    <svg className="obra-svg" viewBox="0 0 260 190" role="img" aria-label="Ilustração de uma casa sendo construída">
      <line className="chao" x1="20" y1="177" x2="240" y2="177" strokeWidth="3" strokeLinecap="round" />
      {blocos.map((b, i) => (
        <rect key={i} className={'bloco' + (b.b2 ? ' b2' : '')} x={b.x + 1} y={b.y + 1} width={b.w - 2} height={b.h - 2} rx="3" style={{ animationDelay: `${b.d}s` }} />
      ))}
      <path className="telhado" d="M50 98 L126 46 L202 98 Z" style={{ animationDelay: '2.3s' }} />
      <rect className="porta" x="114" y="140" width="24" height="36" rx="3" style={{ animationDelay: '2.6s' }} />
      <rect className="janela" x="72" y="108" width="20" height="18" rx="3" style={{ animationDelay: '2.8s' }} />
      <rect className="janela" x="160" y="108" width="20" height="18" rx="3" style={{ animationDelay: '3s' }} />
      <g className="grua">
        <line x1="226" y1="177" x2="226" y2="30" />
        <line x1="219" y1="177" x2="226" y2="160" /><line x1="233" y1="177" x2="226" y2="160" />
      </g>
      <g className="braco">
        <line className="grua" x1="160" y1="34" x2="244" y2="34" />
        <line className="cabo" x1="176" y1="34" x2="176" y2="66" />
        <rect className="carga" x="166" y="66" width="20" height="12" rx="2" />
      </g>
    </svg>
  );
}

export default function EmConstrucao({ titulo }: { titulo: string; texto?: string }) {
  return (
    <main className="s-obra">
      <div className="box s-entra">
        <Obra />
        <div className="tit"><span className="sobre">Em construção</span><h1>{titulo}</h1></div>
        <div className="acoes">
          <a className="pill dark" href={WHATS} target="_blank" rel="noreferrer">Falar no WhatsApp<span className="seta ouro"><Seta /></span></a>
          <Link className="pill light" href="/">Voltar ao início</Link>
        </div>
      </div>
    </main>
  );
}
