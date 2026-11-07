'use client';
import { useState } from 'react';

const BASE = 'https://casalcorretoroficial.com.br';
const slug = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export default function GeradorLink() {
  const [pag, setPag] = useState('/');
  const [origem, setOrigem] = useState('instagram');
  const [meio, setMeio] = useState('stories');
  const [camp, setCamp] = useState('');
  const [ok, setOk] = useState(false);
  let caminho = pag.trim() || '/';
  try { if (/^https?:/.test(caminho)) { const u = new URL(caminho); caminho = u.pathname + u.search; } } catch { /* mantém */ }
  const q = new URLSearchParams({ utm_source: origem, utm_medium: meio, ...(camp && { utm_campaign: slug(camp) }) });
  const link = `${BASE}${caminho.startsWith('/') ? caminho : '/' + caminho}${caminho.includes('?') ? '&' : '?'}${q}`;
  const copiar = async () => { try { await navigator.clipboard.writeText(link); setOk(true); setTimeout(() => setOk(false), 2000); } catch { /* sem permissão */ } };
  return (
    <div className="stack" style={{ gap: 12 }}>
      <label className="lb">Página do site<input className="in" value={pag} onChange={(e) => setPag(e.target.value)} placeholder="/ ou cole o link de um imóvel" /></label>
      <div className="ac-duas" style={{ gap: 12 }}>
        <label className="lb">Onde vai o link<select className="in" value={origem} onChange={(e) => setOrigem(e.target.value)}>
          <option value="instagram">Instagram</option><option value="facebook">Facebook</option><option value="whatsapp">WhatsApp</option><option value="google">Google</option><option value="tiktok">TikTok</option><option value="email">E-mail</option>
        </select></label>
        <label className="lb">Formato<select className="in" value={meio} onChange={(e) => setMeio(e.target.value)}>
          <option value="stories">Stories</option><option value="bio">Link da bio</option><option value="post">Post</option><option value="anuncio">Anúncio pago</option><option value="mensagem">Mensagem</option>
        </select></label>
      </div>
      <label className="lb">Nome da campanha<input className="in" value={camp} onChange={(e) => setCamp(e.target.value)} placeholder="ex.: lançamento do site" /><span className="hint">É o nome que aparece na tabela de campanhas.</span></label>
      <div className="ac-link">{link}</div>
      <button type="button" className="btn dark" onClick={copiar}>{ok ? 'Link copiado!' : 'Copiar link'}</button>
    </div>
  );
}
