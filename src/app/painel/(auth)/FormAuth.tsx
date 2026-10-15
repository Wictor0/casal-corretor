'use client';
import { useActionState } from 'react';

type Acao = (s: { erro?: string; email?: string; n?: number } | undefined, fd: FormData) => Promise<{ erro?: string; email?: string; n?: number } | undefined>;

export default function FormAuth({ acao, titulo, subtitulo, campos, botao, token }: { acao: Acao; titulo: string; subtitulo: string; campos: { name: string; label: string; type: string; auto?: string }[]; botao: string; token?: string }) {
  const [estado, dispatch, pendente] = useActionState(acao, undefined);
  return (
    <main className="auth">
      <form action={dispatch}>
        <img src="/logo-escura.svg" alt="Casal Corretor · Negócios Imobiliários" />
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <h1 style={{ fontSize: 24 }}>{titulo}</h1>
          <span className="sub" style={{ margin: 0, alignSelf: 'center' }}>{subtitulo}</span>
        </div>
        {token && <input type="hidden" name="token" value={token} />}
        {campos.map((c) => (
          <label key={c.name} className="lb">{c.label}<input key={c.name + (estado?.n ?? '')} defaultValue={c.name === 'email' ? estado?.email : undefined} className="in" name={c.name} type={c.type} autoComplete={c.auto} required /></label>
        ))}
        {estado?.erro && <div className="alerta" role="alert">{estado.erro}</div>}
        <button className="btn dark" style={{ height: 48 }} disabled={pendente}>{pendente ? 'Aguarde…' : botao}</button>
      </form>
    </main>
  );
}
