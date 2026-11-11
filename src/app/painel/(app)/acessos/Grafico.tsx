'use client';
import { useEffect, useRef, useState } from 'react';

export type Ponto = { dia: string; valor: number; linhas: [string, number][] };
const fmt = (v: number) => v.toLocaleString('pt-BR');
const UM: Record<string, string> = { visitantes: 'visitante', 'páginas vistas': 'página vista', 'cliques no WhatsApp': 'clique no WhatsApp' };
const rot = (k: string, v: number) => (v === 1 ? UM[k] ?? k : k);
const rotulo = (d: string) => {
  const s = new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });
  return s.replace(/\./g, '').replace(/^./, (c) => c.toUpperCase());
};

// Barras por dia: passar o mouse mostra o balão; clicar deixa o balão fixo (clique de novo ou fora para soltar).
export default function Grafico({ dados, variante, legenda }: { dados: Ponto[]; variante?: 'cf'; legenda?: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const [fixo, setFixo] = useState<number | null>(null);
  const caixa = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (fixo === null) return;
    const fora = (e: PointerEvent) => { if (!caixa.current?.contains(e.target as Node)) setFixo(null); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setFixo(null); };
    document.addEventListener('pointerdown', fora); document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('pointerdown', fora); document.removeEventListener('keydown', esc); };
  }, [fixo]);
  const pico = Math.max(...dados.map((d) => d.valor));
  const max = Math.max(pico, 1);
  const ativo = fixo ?? hover;
  const lado = (i: number) => (i < dados.length * 0.18 ? 'esq' : i > dados.length * 0.82 ? 'dir' : '');

  return (
    <div ref={caixa}>
      <div className={'ac-grafico' + (variante ? ' ' + variante : '')} onMouseLeave={() => setHover(null)}>
        {dados.map((d, i) => (
          <button
            type="button" key={d.dia}
            className={'ac-col' + (ativo === i ? ' on' : '') + (fixo === i ? ' fixo' : '') + (d.valor === pico && pico > 0 ? ' pico' : '')}
            onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} onBlur={() => setHover(null)}
            onClick={() => setFixo(fixo === i ? null : i)}
            aria-label={`${rotulo(d.dia)}: ${d.linhas.map(([k, v]) => `${fmt(v)} ${rot(k, v)}`).join(', ')}`}
          >
            <span className="ac-barra" style={{ height: `${(d.valor / max) * 100}%` }} />
            {ativo === i && (
              <span className={'ac-balao ' + lado(i)} role="tooltip">
                <small>{rotulo(d.dia)}{fixo === i && <i aria-hidden="true"> · fixado</i>}</small>
                {d.linhas.map(([k, v], j) => <span key={k} className={j === 0 ? 'prin' : ''}><b>{fmt(v)}</b> {rot(k, v)}</span>)}
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="ac-eixo">
        <span>{dados[0] && rotulo(dados[0].dia)}</span>
        <span>{pico > 0 ? `pico: ${fmt(pico)}${legenda ? ' ' + legenda : ''}` : ''}</span>
        <span>hoje</span>
      </div>
    </div>
  );
}
