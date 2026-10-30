'use client';
import { useState } from 'react';

export default function Compartilhar({ titulo }: { titulo: string }) {
  const [ok, setOk] = useState(false);
  const clique = async () => {
    const url = location.href.split('?')[0];
    try {
      if (navigator.share) { await navigator.share({ title: titulo, url }); return; }
      await navigator.clipboard.writeText(url); setOk(true); setTimeout(() => setOk(false), 2000);
    } catch { /* cancelado */ }
  };
  return (
    <button type="button" className={'compart' + (ok ? ' ok' : '')} onClick={clique} aria-label={ok ? 'Link copiado' : 'Compartilhar imóvel'} title={ok ? 'Link copiado!' : 'Compartilhar'}>
      {ok
        ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7" /></svg>
        : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 15V3M8 7l4-4 4 4M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" /></svg>}
    </button>
  );
}
