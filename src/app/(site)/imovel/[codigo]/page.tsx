import EmConstrucao from '../../EmConstrucao';
import { lerCodigo } from '@/lib/codigo';
export const metadata = { title: 'Imóvel' };
export default async function P({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;
  const c = lerCodigo(decodeURIComponent(codigo));
  return <EmConstrucao titulo={c ? `Imóvel ${c}` : 'Imóvel'} />;
}
