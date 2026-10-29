'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/** Barrinha dourada no topo enquanto a próxima página carrega. */
export default function Progresso() {
  const path = usePathname(), qs = useSearchParams();
  const [estado, setEstado] = useState<'off' | 'indo' | 'fim'>('off');
  const t = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const clique = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement).closest('a');
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || (url.pathname === location.pathname && url.search === location.search)) return;
      clearTimeout(t.current); setEstado('indo');
    };
    document.addEventListener('click', clique, true);
    return () => document.removeEventListener('click', clique, true);
  }, []);

  useEffect(() => {
    setEstado((s) => (s === 'indo' ? 'fim' : s));
    t.current = setTimeout(() => setEstado('off'), 450);
    return () => clearTimeout(t.current);
  }, [path, qs]);

  return <div className={'s-prog ' + estado} aria-hidden="true" />;
}
