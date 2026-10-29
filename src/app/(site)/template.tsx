// Recriado a cada navegação: dá a entrada suave do conteúdo (cabeçalho e rodapé ficam parados).
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="s-pag">{children}</div>;
}
