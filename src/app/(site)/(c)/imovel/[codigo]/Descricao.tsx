/**
 * Organiza a descrição no formato que o casal usa (o mesmo do Instagram):
 * 1ª linha = chamada; linhas em CAIXA ALTA com emoji = títulos de seção;
 * linhas com ▪️/• ou emoji em sequência = listas; o resto = parágrafos.
 * O texto continua sendo escrito livre no painel.
 */
import { Fragment } from 'react';

const EMOJI = /^(?:[\p{Extended_Pictographic}\p{Emoji_Presentation}☀-➿⬀-⯿️‍⃣]|[▪•·◦●○■□►▶✔✓\-–*])+\s*/u;
const CTA = /entre em contato|agende (sua|uma|já)|chame (a gente|no whats)|fale com a gente|mande (uma )?mensagem/i;

const limpar = (s: string) => s.replace(EMOJI, '').trim();
const semMd = (s: string) => s.replace(/\*\*|__/g, '');
const ehCaixaAlta = (s: string) => {
  const letras = semMd(s).replace(/[^\p{L}]/gu, '');
  return letras.length >= 4 && letras === letras.toLocaleUpperCase('pt-BR');
};
const temEmoji = (s: string) => EMOJI.test(s);

/** Negrito com **texto** */
function Rico({ t }: { t: string }) {
  const partes = t.split(/\*\*(.+?)\*\*/g);
  return <>{partes.map((p, k) => (k % 2 ? <strong key={k}>{p}</strong> : <Fragment key={k}>{p}</Fragment>))}</>;
}

/** CAIXA ALTA → frase normal, mantendo nomes próprios que aparecem com maiúscula no resto do texto */
function frase(s: string, nomes: Map<string, string>) {
  const t = semMd(limpar(s)).toLocaleLowerCase('pt-BR');
  const out = t.replace(/[\p{L}]+/gu, (w) => nomes.get(w) ?? w);
  return out.charAt(0).toLocaleUpperCase('pt-BR') + out.slice(1);
}

type Bloco = { k: 'chamada' | 'titulo' | 'p' | 'lista' | 'local'; t?: string; itens?: string[] };

export default function Descricao({ texto, extras = [] }: { texto: string; extras?: string[] }) {
  const linhas = texto.replace(/\r/g, '').split('\n').map((l) => l.trim()).filter(Boolean).filter((l) => !CTA.test(l));
  if (!linhas.length) return null;

  // dicionário de nomes próprios (palavras com inicial maiúscula fora do começo de frase)
  const nomes = new Map<string, string>();
  for (const l of [...linhas.filter((l) => !ehCaixaAlta(l)), ...extras])
    for (const m of semMd(l).matchAll(/(?<=\s)(\p{Lu}[\p{Ll}]+)/gu)) nomes.set(m[1].toLocaleLowerCase('pt-BR'), m[1]);

  const blocos: Bloco[] = [];
  linhas.forEach((l, i) => {
    const curta = semMd(limpar(l)).length <= 70;
    const prox = linhas[i + 1], ant = linhas[i - 1];
    const marcador = /^[▪•·◦●■►▶✔✓\-–*]/u.test(l.replace(/^\*\*/, ''));
    const vizinhoEmoji = (x?: string) => !!x && temEmoji(x) && !ehCaixaAlta(x) && semMd(limpar(x)).length <= 70;
    if (i === 0 && linhas.length > 1) return blocos.push({ k: 'chamada', t: frase(l, nomes) });
    if (/^📍/u.test(l) && curta) return blocos.push({ k: 'local', t: semMd(limpar(l)) });
    if (ehCaixaAlta(l) && curta) return blocos.push({ k: 'titulo', t: frase(l, nomes).replace(/\s*:\s*$/, '') });
    if (marcador || (temEmoji(l) && curta && !ehCaixaAlta(l) && (vizinhoEmoji(prox) || vizinhoEmoji(ant)))) {
      const ult = blocos[blocos.length - 1];
      const item = limpar(l.replace(/^\*\*(.+)\*\*$/, '$1'));
      if (ult?.k === 'lista') ult.itens!.push(item); else blocos.push({ k: 'lista', itens: [item] });
      return;
    }
    blocos.push({ k: 'p', t: limpar(l) });
  });

  return (
    <div className="s-desc">
      {blocos.map((b, k) => {
        if (b.k === 'chamada') return <p key={k} className="chamada"><Rico t={b.t!} /></p>;
        if (b.k === 'titulo') return <h3 key={k}>{b.t}</h3>;
        if (b.k === 'local') return <span key={k} className="local"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z" /><circle cx="12" cy="10" r="2.5" /></svg>{b.t}</span>;
        if (b.k === 'lista') return <ul key={k}>{b.itens!.map((it, j) => <li key={j}><Rico t={it} /></li>)}</ul>;
        return <p key={k}><Rico t={b.t!} /></p>;
      })}
    </div>
  );
}
