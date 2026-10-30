'use client';
import { useRef } from 'react';
import Carrossel from './Carrossel';

export default function Trilho({ children, rotulo, extra }: { children: React.ReactNode; rotulo: string; extra?: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const mover = (dir: number) => { const el = ref.current; if (el) el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: 'smooth' }); };
  return (
    <>
      <Carrossel ref={ref} className="s-trilho" rotulo={rotulo}>{children}</Carrossel>
      <div className="pe">{extra}<div className="s-nav">
        <button type="button" onClick={() => mover(-1)} aria-label="Anteriores"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg></button>
        <button type="button" onClick={() => mover(1)} aria-label="Próximos"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg></button>
      </div></div>
    </>
  );
}
