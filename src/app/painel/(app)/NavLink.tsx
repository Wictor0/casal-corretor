'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const p = usePathname();
  const on = href === '/painel' ? p === '/painel' || p.startsWith('/painel/imoveis') : p.startsWith(href);
  return <Link href={href} className={on ? 'on' : undefined}>{children}</Link>;
}
