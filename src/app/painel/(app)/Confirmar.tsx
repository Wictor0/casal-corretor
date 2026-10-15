'use client';
import { useState } from 'react';

export default function Confirmar({ acao, texto, pergunta }: { acao: () => Promise<void>; texto: string; pergunta: string }) {
  const [aberto, setAberto] = useState(false);
  if (!aberto) return <div><button type="button" className="btn perigo sm" onClick={() => setAberto(true)}>{texto}</button></div>;
  return (
    <form action={acao} className="row alerta" style={{ justifyContent: 'space-between' }}>
      <span>{pergunta}</span>
      <span className="row"><button type="button" className="btn sm" onClick={() => setAberto(false)}>Cancelar</button><button className="btn sm perigo" style={{ background: 'var(--erro)', color: '#fff' }}>Sim, excluir</button></span>
    </form>
  );
}
