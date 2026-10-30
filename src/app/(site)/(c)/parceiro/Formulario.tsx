'use client';
import { useActionState, useState } from 'react';
import { inscreverParceiro, type EstadoInscricao } from './actions';
import { Seta } from '../../icones';

export default function Formulario() {
  const [estado, enviar, pendente] = useActionState<EstadoInscricao, FormData>(inscreverParceiro, undefined);
  const [nova, setNova] = useState(0);
  const c = estado?.campos ?? {};
  if (estado?.ok && nova === 0) {
    return (
      <div className="s-pc-ok">
        <span className="ic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7" /></svg></span>
        <h2>Recebemos sua <span className="ser">inscrição</span></h2>
        <p>A Sumaia e o Allan vão conferir seu CRECI e chamar você no WhatsApp pra conversar.</p>
        <button type="button" className="pill light" onClick={() => setNova(1)}>Enviar outra inscrição</button>
      </div>
    );
  }
  return (
    <form action={(fd) => { setNova(0); enviar(fd); }} className="s-pc-form" key={nova}>
      <h2>Inscrição</h2>
      <div className="grade">
        <label>Nome completo<input name="nome" required autoComplete="name" placeholder="Como está no CRECI" defaultValue={c.nome} /></label>
        <label>E-mail<input name="email" type="email" required autoComplete="email" placeholder="voce@email.com" defaultValue={c.email} /></label>
        <label>WhatsApp<input name="whatsapp" type="tel" required autoComplete="tel" inputMode="tel" placeholder="(11) 90000-0000" defaultValue={c.whatsapp} /></label>
        <div className="dupla">
          <label>Número do CRECI<input name="creci" required placeholder="000000-F" defaultValue={c.creci} /></label>
          <label>Estado<select name="uf" defaultValue={c.uf || 'SP'}>{['SP', 'RJ', 'MG', 'PR', 'SC', 'RS', 'ES', 'BA', 'PE', 'CE', 'GO', 'DF', 'MS', 'MT', 'Outro'].map((u) => <option key={u}>{u}</option>)}</select></label>
        </div>
        <label>Regiões onde atua<input name="regioes" placeholder="Ex.: Zona Sul, ABC, Mooca" defaultValue={c.regioes} /></label>
        <label>Tempo de mercado<select name="experiencia" defaultValue={c.experiencia || 'Menos de 1 ano'}>{['Menos de 1 ano', '1 a 3 anos', '3 a 5 anos', 'Mais de 5 anos'].map((x) => <option key={x}>{x}</option>)}</select></label>
      </div>
      <label>Conte um pouco sobre você<textarea name="sobre" rows={4} placeholder="Com que tipo de imóvel e de cliente você mais trabalha?" defaultValue={c.sobre} /></label>
      <input name="site" tabIndex={-1} autoComplete="off" aria-hidden="true" className="isca" />
      <label className="aceite"><input type="checkbox" name="aceite" required /><span>Autorizo a Casal Corretor a conferir meu CRECI e a entrar em contato comigo pelo WhatsApp ou e-mail.</span></label>
      {estado?.erro && <div className="erro" role="alert">{estado.erro}</div>}
      <div><button type="submit" className="pill dark" disabled={pendente}>{pendente ? 'Enviando…' : 'Enviar inscrição'}<span className="seta ouro"><Seta s={13} /></span></button></div>
    </form>
  );
}
