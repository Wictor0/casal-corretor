'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Conta páginas vistas e cliques de contato, sem cookie. A campanha (UTM) vale para a visita inteira.
type Orig = { us?: string; um?: string; uc?: string; r?: string };
function origem(): Orig {
  try {
    const salvo = sessionStorage.getItem('cc_origem');
    if (salvo) return JSON.parse(salvo);
    const q = new URLSearchParams(location.search);
    const o: Orig = { us: q.get('utm_source') ?? undefined, um: q.get('utm_medium') ?? undefined, uc: q.get('utm_campaign') ?? undefined, r: document.referrer || undefined };
    sessionStorage.setItem('cc_origem', JSON.stringify(o));
    return o;
  } catch { return {}; }
}
function enviar(e: string, p: string) {
  const corpo = JSON.stringify({ e, p, ...origem() });
  if (!navigator.sendBeacon?.('/api/v', new Blob([corpo], { type: 'text/plain' }))) fetch('/api/v', { method: 'POST', body: corpo, keepalive: true }).catch(() => {});
}

export default function Rastreio() {
  const path = usePathname();
  useEffect(() => { enviar('pv', path); }, [path]);
  useEffect(() => {
    const clique = (ev: MouseEvent) => {
      const a = (ev.target as Element | null)?.closest?.('a[href*="wa.me"], a[href*="api.whatsapp"]');
      if (a) enviar('whats', location.pathname);
    };
    const comp = () => enviar('compartilhar', location.pathname);
    document.addEventListener('click', clique, true);
    window.addEventListener('cc:compartilhar', comp);
    return () => { document.removeEventListener('click', clique, true); window.removeEventListener('cc:compartilhar', comp); };
  }, []);
  return null;
}
