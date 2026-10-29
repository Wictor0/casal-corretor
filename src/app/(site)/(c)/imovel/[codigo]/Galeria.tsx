'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type Foto = { full: string; thumb: string };

export default function Galeria({ fotos, titulo, codigo }: { fotos: Foto[]; titulo: string; codigo: string }) {
  const atual = 0;
  const [aberta, setAberta] = useState<number | null>(null);
  const [copiado, setCopiado] = useState(false);
  const toque = useRef<number | null>(null);
  const n = fotos.length;

  const mover = useCallback((d: number) => setAberta((a) => (a == null ? a : (a + d + n) % n)), [n]);
  useEffect(() => {
    if (aberta == null) return;
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') setAberta(null); if (e.key === 'ArrowRight') mover(1); if (e.key === 'ArrowLeft') mover(-1); };
    document.addEventListener('keydown', k);
    const ov = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', k); document.body.style.overflow = ov; };
  }, [aberta, mover]);

  const compartilhar = async () => {
    const url = location.href.split('?')[0];
    try {
      if (navigator.share) { await navigator.share({ title: `${titulo} · ${codigo}`, url }); return; }
      await navigator.clipboard.writeText(url); setCopiado(true); setTimeout(() => setCopiado(false), 2200);
    } catch { /* cancelado */ }
  };

  const lado = fotos.slice(1, 5);
  return (
    <div className={'s-gal' + (n <= 1 ? ' unica' : '')}>
      <button type="button" className="principal" onClick={() => n && setAberta(atual)} aria-label={n ? 'Abrir fotos em tela cheia' : undefined}>
        {n ? <img src={fotos[atual].full} alt={`${titulo}, foto ${atual + 1} de ${n}`} fetchPriority="high" /> : <img className="simb" src="/simbolo-clara.svg" alt="" />}
        {n > 1 && <span className="cont">{atual + 1} / {n}</span>}
      </button>
      <div className="acoes">
        <button type="button" onClick={compartilhar}>{copiado ? 'Link copiado!' : 'Compartilhar'}</button>
      </div>
      {lado.length > 0 && (
        <div className="lado">
          {lado.map((f, k) => {
            const idx = k + 1, ultima = k === lado.length - 1 && n > 5;
            return (
              <button type="button" key={idx} onClick={() => setAberta(idx)} aria-label={ultima ? `Ver todas as ${n} fotos` : `Ver foto ${idx + 1}`}>
                <img src={f.thumb} alt="" loading="lazy" />
                {ultima && <span className="mais">+ {n - 5} fotos</span>}
              </button>
            );
          })}
        </div>
      )}
      {aberta != null && createPortal(
        <div className="s-lb" role="dialog" aria-modal="true" aria-label="Fotos do imóvel" onClick={() => setAberta(null)}
          onTouchStart={(e) => { toque.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => { if (toque.current == null) return; const dx = e.changedTouches[0].clientX - toque.current; if (Math.abs(dx) > 40) mover(dx < 0 ? 1 : -1); toque.current = null; }}>
          <img src={fotos[aberta].full} alt={`${titulo}, foto ${aberta + 1} de ${n}`} onClick={(e) => e.stopPropagation()} />
          <button type="button" className="fechar" aria-label="Fechar" onClick={() => setAberta(null)}>✕</button>
          {n > 1 && <>
            <button type="button" className="ant" aria-label="Foto anterior" onClick={(e) => { e.stopPropagation(); mover(-1); }}>‹</button>
            <button type="button" className="prox" aria-label="Próxima foto" onClick={(e) => { e.stopPropagation(); mover(1); }}>›</button>
            <span className="cont">{aberta + 1} / {n}</span>
          </>}
        </div>,
        document.body,
      )}
    </div>
  );
}
