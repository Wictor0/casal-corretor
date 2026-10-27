import type { Metadata } from 'next';
import Link from 'next/link';
import './site.css';
import Header from './Header';
import { Seta } from './icones';
import { CONTATOS, INSTAGRAM, WHATS } from '@/lib/site';

export const metadata: Metadata = {
  title: { default: 'Casal Corretor · Negócios Imobiliários', template: '%s · Casal Corretor' },
  description: 'Curadoria de lares com personalidade para quem vive São Paulo com estilo. Atendimento a dois, do primeiro contato às chaves.',
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="s">
      <Header whats={WHATS} />
      {children}
      <footer className="s-foot">
        <div className="box">
          <div className="cols">
            <div className="c1">
              <img src="/logo-clara.svg" alt="Casal Corretor · Negócios Imobiliários" />
              <p>Curadoria de lares com personalidade para quem vive São Paulo com estilo.</p>
            </div>
            <div className="c2">
              <small>Navegue</small>
              <Link href="/imoveis?negocio=venda">Imóveis à venda</Link>
              <Link href="/imoveis?negocio=aluguel">Imóveis para alugar</Link>
              <Link href="/imoveis?negocio=terreno">Terrenos e retrofit</Link>
              <Link href="/sobre">Sobre nós</Link>
              <Link href="/contato">Contato</Link>
              <Link href="/parceiro" className="ouro">Seja corretor parceiro</Link>
            </div>
            <div className="c3">
              <small>Fale com a gente</small>
              {CONTATOS.map((c) => (
                <a key={c.wa} className="ct" href={`https://wa.me/${c.wa}`} target="_blank" rel="noreferrer">
                  <span><b>{c.nome}</b><span>{c.creci} · {c.tel}</span></span><i><Seta s={13} /></i>
                </a>
              ))}
              <a className="ig" href={INSTAGRAM} target="_blank" rel="noreferrer">@casalcorretoroficial</a>
            </div>
          </div>
          <div className="base"><span>© {new Date().getFullYear()} Casal Corretor · Negócios Imobiliários</span><span>Site por Sotaque</span></div>
        </div>
      </footer>
    </div>
  );
}
