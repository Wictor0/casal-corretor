import { Obra } from '../EmConstrucao';

// Aparece enquanto a próxima página busca os dados (só se demorar mais que um instante).
export default function Carregando() {
  return (
    <main className="s-carrega" aria-busy="true" aria-live="polite">
      <Obra />
      <span>Carregando</span>
    </main>
  );
}
