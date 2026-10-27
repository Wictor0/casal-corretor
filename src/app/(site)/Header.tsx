'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Seta } from './icones';

const LINKS = [
  { href: '/', label: 'Início' },
  { href: '/imoveis', label: 'Imóveis' },
  { href: '/sobre', label: 'Sobre' },
  { href: '/contato', label: 'Contato' },
];

export default function Header({ whats }: { whats: string }) {
  const p = usePathname();
  const on = (h: string) => (h === '/' ? p === '/' : p.startsWith(h));
  return (
    <header className="s-head">
      <div className="bar">
        <Link href="/" className="marca" aria-label="Casal Corretor, página inicial"><img src="/logo-escura.svg" alt="Casal Corretor · Negócios Imobiliários" /></Link>
        <nav aria-label="Principal">{LINKS.map((l) => <Link key={l.href} href={l.href} className={on(l.href) ? 'on' : undefined}>{l.label}</Link>)}</nav>
        <a className="zap" href={whats} target="_blank" rel="noreferrer">Fale no WhatsApp<span><Seta /></span></a>
        <details>
          <summary aria-label="Abrir menu"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M4 8h16M4 16h10" /></svg></summary>
          <div className="menu">
            {LINKS.map((l) => <Link key={l.href} href={l.href} className={on(l.href) ? 'on' : undefined}>{l.label}</Link>)}
            <Link href="/parceiro">Seja corretor parceiro</Link>
            <a href={whats} target="_blank" rel="noreferrer" style={{ color: 'var(--dourado-claro)' }}>Fale no WhatsApp ↗</a>
          </div>
        </details>
      </div>
    </header>
  );
}
