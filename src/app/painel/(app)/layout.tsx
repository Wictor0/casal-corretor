import { exigirUsuario } from '@/lib/auth';
import { db, t } from '@/db';
import { eq, count } from 'drizzle-orm';
import { sair } from '../(auth)/actions';
import NavLink from './NavLink';

export const dynamic = 'force-dynamic';

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const u = await exigirUsuario();
  const [{ n }] = await db.select({ n: count() }).from(t.parceiros).where(eq(t.parceiros.status, 'nova'));
  return (
    <div className="shell">
      <nav className="nav" aria-label="Painel">
        <img src="/logo-clara.svg" alt="Casal Corretor" />
        <NavLink href="/painel">Imóveis</NavLink>
        <NavLink href="/painel/caracteristicas">Características</NavLink>
        <NavLink href="/painel/construtoras">Construtoras parceiras</NavLink>
        <NavLink href="/painel/parceiros">Corretores parceiros{n > 0 && <span className="badge">{n}</span>}</NavLink>
        <NavLink href="/painel/site">Fotos do site</NavLink>
        <span className="sp" />
        <span className="eu">{u.nome}</span>
        <form action={sair}><button>Sair</button></form>
      </nav>
      <main className="main">{children}</main>
    </div>
  );
}
