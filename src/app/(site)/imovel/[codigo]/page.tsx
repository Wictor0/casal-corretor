import EmConstrucao from '../../EmConstrucao';
export const metadata = { title: 'Imóvel' };
export default async function P({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;
  return <EmConstrucao titulo={`Imóvel ${decodeURIComponent(codigo).toUpperCase()}`} texto="A página com todas as fotos e detalhes deste imóvel está em construção. Manda o código no WhatsApp que a gente te passa tudo agora." />;
}
