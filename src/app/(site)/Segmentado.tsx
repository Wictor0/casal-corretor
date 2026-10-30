'use client';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';

/** Seletor em pílula com o destaque escuro escorregando até a opção escolhida. */
export default function Segmentado({ name, opcoes, inicial, className = '', rotulo }: { name: string; opcoes: readonly (readonly [string, string])[]; inicial: string; className?: string; rotulo: string }) {
  const caixa = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; width: number } | null>(null);

  const medir = useCallback(() => {
    const el = caixa.current?.querySelector<HTMLInputElement>('input:checked')?.parentElement;
    if (el) setPos({ left: el.offsetLeft, width: el.offsetWidth });
  }, []);

  useLayoutEffect(() => {
    medir();
    const ro = new ResizeObserver(medir);
    if (caixa.current) ro.observe(caixa.current);
    const form = caixa.current?.closest('form');
    form?.addEventListener('reset', () => requestAnimationFrame(medir));
    return () => ro.disconnect();
  }, [medir]);

  return (
    <div ref={caixa} className={'s-segm ' + className} role="radiogroup" aria-label={rotulo} onChange={() => requestAnimationFrame(medir)} data-medido={pos ? '' : undefined}>
      <span className="ind" aria-hidden="true" style={pos ? { transform: `translateX(${pos.left}px)`, width: pos.width } : { opacity: 0 }} />
      {opcoes.map(([v, l]) => (
        <label key={v}><input type="radio" name={name} value={v} defaultChecked={v === inicial} /><span>{l}</span></label>
      ))}
    </div>
  );
}
