import Link from 'next/link';
import { buscar, lerFiltros, opcoesFiltro, POR_PAGINA } from '@/lib/busca';
import { WHATS } from '@/lib/site';
import { Seta } from '../icones';
import Busca from './Busca';
import Card from './Card';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Imóveis', description: 'Apartamentos, casas, terrenos e retrofit em São Paulo e no litoral, com curadoria do Casal Corretor.' };

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function Imoveis({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const f = lerFiltros(sp);
  const [{ lista, total }, op] = await Promise.all([buscar(f), opcoesFiltro()]);
  const mais = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) for (const x of [v].flat()) if (x && k !== 'pag') mais.append(k, x);
  mais.set('pag', String(f.pag + 1));

  return (
    <main>
      <Busca f={f} op={op} total={total}>
        {lista.length > 0 ? (
          <>
            <div className="s-im-grade">{lista.map((p, i) => <Card key={p.id} p={p} i={i} />)}</div>
            {total > POR_PAGINA * f.pag && (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Link className="pill dark" href={`/imoveis?${mais}`} scroll={false}>Ver mais imóveis<span className="seta"><Seta d="M7 7l10 10M17 7v10H7" /></span></Link>
              </div>
            )}
          </>
        ) : (
          <div className="s-im-vazio">
            <b>Nenhum imóvel com esses filtros… <span className="ser">ainda</span></b>
            <p>Conte pra gente o que você procura e avisamos quando aparecer algo do seu jeito.</p>
            <a className="pill light" href={WHATS} target="_blank" rel="noreferrer">Falar no WhatsApp<span className="seta ouro"><Seta /></span></a>
          </div>
        )}
      </Busca>
    </main>
  );
}
