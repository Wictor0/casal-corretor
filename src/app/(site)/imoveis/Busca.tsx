'use client';
import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Filtros } from '@/lib/busca';

type Opcoes = { carac: { id: number; nome: string }[]; bairros: string[]; tipos: string[] };
const PRET = [['todos', 'Todos'], ['venda', 'Comprar'], ['aluguel', 'Alugar'], ['terreno', 'Terrenos e retrofit']] as const;
const PRECO_VENDA = [[500000, 'Até R$ 500 mil'], [800000, 'Até R$ 800 mil'], [1500000, 'Até R$ 1,5 milhão'], [3000000, 'Até R$ 3 milhões']] as const;
const PRECO_ALUGUEL = [[3000, 'Até R$ 3.000/mês'], [5000, 'Até R$ 5.000/mês'], [8000, 'Até R$ 8.000/mês'], [12000, 'Até R$ 12.000/mês']] as const;
const PADRAO: Record<string, string> = { negocio: 'todos', ordem: 'recentes', quartos: '0', vagas: '0' };

export default function Busca({ f, op, total, children }: { f: Filtros; op: Opcoes; total: number; children: React.ReactNode }) {
  const router = useRouter();
  const form = useRef<HTMLFormElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [pendente, start] = useTransition();
  const [aberto, setAberto] = useState(false);
  const [neg, setNeg] = useState(f.negocio);

  const aplicar = () => {
    const fd = new FormData(form.current!);
    const qs = new URLSearchParams();
    for (const [k, v] of fd) { const s = String(v).trim(); if (s && PADRAO[k] !== s) qs.append(k, s); }
    start(() => router.replace(`/imoveis${qs.size ? '?' + qs : ''}`, { scroll: false }));
  };
  const mudou = (e: React.FormEvent<HTMLFormElement>) => {
    const el = e.target as HTMLInputElement;
    if (el.name === 'negocio') { setNeg(el.value as Filtros['negocio']); const p = form.current!.elements.namedItem('preco') as HTMLSelectElement; if (p) p.value = ''; }
    clearTimeout(timer.current);
    timer.current = setTimeout(aplicar, el.type === 'text' || el.type === 'search' ? 450 : 0);
  };
  const limpar = () => {
    for (const el of Array.from(form.current!.elements) as HTMLInputElement[]) {
      if (el.type === 'radio') el.checked = el.value === (PADRAO[el.name] ?? '');
      else if (el.type === 'checkbox') el.checked = false;
      else if (el.tagName === 'SELECT') el.value = el.name === 'ordem' ? 'recentes' : '';
      else if (el.type === 'search' || el.type === 'text') el.value = '';
    }
    setNeg('todos');
    start(() => router.replace('/imoveis', { scroll: false }));
  };
  const precos = neg === 'aluguel' ? PRECO_ALUGUEL : PRECO_VENDA;
  const bairros = f.local && !op.bairros.includes(f.local) ? [f.local, ...op.bairros] : op.bairros;
  const nFiltros = [f.tipo, f.local, f.preco, f.quartos, f.vagas, f.codigo].filter(Boolean).length + f.c.length;

  return (
    <form ref={form} onChange={mudou} onSubmit={(e) => { e.preventDefault(); aplicar(); setAberto(false); }}>
      <section className="w s-entra">
        <div className="s-im-hero">
          <div>
            <h1>Encontre o seu <span className="ser">lugar</span></h1>
            <p>Curadoria de lares com personalidade em São Paulo. Use os filtros para chegar exatamente no que você procura.</p>
          </div>
          <div className="seg" role="radiogroup" aria-label="Pretensão">
            {PRET.map(([v, l]) => <label key={v}><input type="radio" name="negocio" value={v} defaultChecked={f.negocio === v} /><span>{l}</span></label>)}
          </div>
        </div>
      </section>

      <section className="w s-im">
        <div className="s-im-mob">
          <label className="cod"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
            <input type="search" placeholder="Código, ex.: CC1001" aria-label="Buscar por código" defaultValue={f.codigo} onChange={(e) => { const d = form.current!.elements.namedItem('codigo') as HTMLInputElement; d.value = e.target.value; }} />
          </label>
          <button type="button" className="abrir" onClick={() => setAberto(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M4 6h16M7 12h10M10 18h4" /></svg>Filtros{nFiltros ? ` · ${nFiltros}` : ''}
          </button>
        </div>

        <aside className={'s-im-filtros' + (aberto ? ' aberto' : '')} aria-label="Filtros">
          <div className="cab">
            <h2>Filtros</h2>
            <button type="button" className="limpa" onClick={limpar}>Limpar tudo</button>
            <button type="button" className="fecha" onClick={() => setAberto(false)} aria-label="Fechar filtros"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg></button>
          </div>
          <label className="f">Código do imóvel<input type="search" name="codigo" placeholder="CC1001" defaultValue={f.codigo} /></label>
          <label className="f">Tipo de imóvel
            <select name="tipo" defaultValue={f.tipo}><option value="">Todos</option>{op.tipos.map((t) => <option key={t}>{t}</option>)}</select>
          </label>
          <label className="f">Bairro ou cidade
            <select name="local" defaultValue={f.local}><option value="">Todos</option>{bairros.map((b) => <option key={b}>{b}</option>)}</select>
          </label>
          <label className="f">{neg === 'aluguel' ? 'Aluguel máximo' : 'Preço máximo'}
            <select name="preco" defaultValue={f.preco ? String(f.preco) : ''}><option value="">Qualquer valor</option>{precos.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
          </label>
          {neg !== 'terreno' && (
            <>
              <fieldset className="f"><legend>Quartos</legend><div className="pills">
                {[0, 1, 2, 3, 4].map((n) => <label key={n}><input type="radio" name="quartos" value={n} defaultChecked={f.quartos === n} /><span>{n ? `${n}+` : 'Todos'}</span></label>)}
              </div></fieldset>
              <fieldset className="f"><legend>Vagas</legend><div className="pills">
                {[0, 1, 2, 3].map((n) => <label key={n}><input type="radio" name="vagas" value={n} defaultChecked={f.vagas === n} /><span>{n ? `${n}+` : 'Todas'}</span></label>)}
              </div></fieldset>
            </>
          )}
          {op.carac.length > 0 && (
            <fieldset className="f"><legend>Características</legend><div className="pills">
              {op.carac.map((c) => <label key={c.id}><input type="checkbox" name="c" value={c.id} defaultChecked={f.c.includes(c.id)} /><span>{c.nome}</span></label>)}
            </div></fieldset>
          )}
          <div className="rodape-mob">
            <button type="button" className="limpa" onClick={limpar}>Limpar</button>
            <button type="submit" className="ver">{pendente ? 'Buscando…' : `Ver ${total} ${total === 1 ? 'imóvel' : 'imóveis'}`}</button>
          </div>
          <noscript><button type="submit" className="ver">Aplicar filtros</button></noscript>
        </aside>

        <div className="s-im-res">
          <div className="barra">
            <span aria-live="polite"><b>{total}</b> {total === 1 ? 'imóvel encontrado' : 'imóveis encontrados'}</span>
            <label>Ordenar
              <select name="ordem" defaultValue={f.ordem}>
                <option value="recentes">Mais recentes</option><option value="menor">Menor preço</option><option value="maior">Maior preço</option><option value="area">Maior área</option>
              </select>
            </label>
          </div>
          <div className={'s-im-lista' + (pendente ? ' carregando' : '')}>{children}</div>
        </div>
      </section>
      {aberto && <div className="s-im-veu" onClick={() => setAberto(false)} />}
    </form>
  );
}
