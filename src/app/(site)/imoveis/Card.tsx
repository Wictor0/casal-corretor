import Link from 'next/link';
import { midiaUrl } from '@/lib/s3';
import { slugImovel, exibirCodigo } from '@/lib/codigo';
import type { buscar } from '@/lib/busca';
import { Seta } from '../icones';

type Item = Awaited<ReturnType<typeof buscar>>['lista'][number];
const TONS = ['#5A4B42', '#6B6F63', '#3A2E28', '#7D7266'];
const m2 = (v: string | null) => (v ? `${String(Number(v)).replace('.', ',')} m²` : null);

export default function Card({ p, i }: { p: Item; i: number }) {
  const terreno = p.negocio === 'terreno';
  const preco = p.preco == null ? 'Sob consulta' : 'R$ ' + p.preco.toLocaleString('pt-BR') + (p.negocio === 'aluguel' ? '/mês' : '');
  const infos = terreno
    ? [m2(p.areaTerreno) && `terreno ${m2(p.areaTerreno)}`, p.estado, p.frente && `frente ${m2(p.frente)!.replace(' m²', ' m')}`]
    : [m2(p.area), p.quartos ? `${p.quartos} qt${p.quartos > 1 ? 's' : ''}` : null, p.vagas ? `${p.vagas} vg` : null];
  return (
    <Link href={`/imovel/${slugImovel(p)}`} className="s-im-card lift zoom" style={{ background: TONS[i % 4] }}>
      {p.thumb && <img src={midiaUrl(p.thumb)} alt="" loading={i < 6 ? 'eager' : 'lazy'} />}
      <span className="tp">
        <span>{exibirCodigo(p.codigo)}</span>
        {terreno && <span className="esc">Terrenos e retrofit</span>}
        {p.negocio === 'aluguel' && <span>Aluguel</span>}
        {p.status === 'negociacao' && <span className="neg">Em negociação</span>}
      </span>
      <span className="bt">
        <span className="pr"><b>{preco}</b><i><Seta s={12} /></i></span>
        <span className="ti">{p.titulo}</span>
        <span className="mt">
          <span>{[p.tipo, p.bairro].filter(Boolean).join(' · ')}</span>
          {infos.filter(Boolean).map((x) => <span key={String(x)}>{x}</span>)}
        </span>
      </span>
    </Link>
  );
}
