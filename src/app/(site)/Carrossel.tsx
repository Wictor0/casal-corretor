'use client';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';

/** Faixa com rolagem lateral + barrinha embaixo mostrando quanto tem e onde você está. */
const Carrossel = forwardRef<HTMLDivElement, { className?: string; rotulo?: string; children: React.ReactNode }>(function Carrossel({ className, rotulo, children }, fora) {
  const ref = useRef<HTMLDivElement>(null);
  useImperativeHandle(fora, () => ref.current!);
  const [b, setB] = useState<{ w: number; x: number } | null>(null);

  const medir = useCallback(() => {
    const el = ref.current; if (!el) return;
    const sobra = el.scrollWidth - el.clientWidth;
    if (sobra < 4) return setB(null);
    const w = el.clientWidth / el.scrollWidth;
    setB({ w, x: (el.scrollLeft / sobra) * (1 - w) });
  }, []);

  useEffect(() => {
    const el = ref.current; if (!el) return;
    medir();
    el.addEventListener('scroll', medir, { passive: true });
    const ro = new ResizeObserver(medir); ro.observe(el);
    return () => { el.removeEventListener('scroll', medir); ro.disconnect(); };
  }, [medir]);

  return (
    <>
      <div ref={ref} className={className} role={rotulo ? 'region' : undefined} aria-label={rotulo} tabIndex={rotulo ? 0 : undefined}>{children}</div>
      {b && <div className="s-car-barra" aria-hidden="true"><i style={{ width: `${b.w * 100}%`, left: `${b.x * 100}%` }} /></div>}
    </>
  );
});
export default Carrossel;
