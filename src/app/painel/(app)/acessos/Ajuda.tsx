'use client';
import { useEffect, useRef, useState } from 'react';

export default function Ajuda() {
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!aberto) return;
    const fora = (e: PointerEvent) => { if (!ref.current?.contains(e.target as Node)) setAberto(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setAberto(false); };
    document.addEventListener('pointerdown', fora); document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('pointerdown', fora); document.removeEventListener('keydown', esc); };
  }, [aberto]);
  return (
    <span className="ac-ajuda" ref={ref}>
      <button type="button" aria-expanded={aberto} aria-label="Por que esses números são diferentes?" onClick={() => setAberto(!aberto)}>?</button>
      {aberto && (
        <span className="ac-pop" role="dialog">
          <span className="l"><b>Por que aqui aparece mais gente?</b></span>
          <span className="l">Este bloco conta tudo que acessa o site, inclusive robôs: o Google lendo as páginas, a prévia do link quando alguém compartilha no WhatsApp e acessos automáticos. Os números de cima contam só pessoas reais.</span>
          <span className="l">Dica: num dia com mais “visitantes” que “páginas vistas”, a diferença é de robôs. O dia aqui também vira às 21h, não à meia-noite.</span>
          <span className="l"><b>Use este gráfico como termômetro</b> (picos e tendência). Para saber quantas pessoas vieram e quantas chamaram no WhatsApp, vale o de cima.</span>
        </span>
      )}
    </span>
  );
}
