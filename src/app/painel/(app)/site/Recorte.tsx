'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

type Acao = (fd: FormData) => Promise<{ erro?: string; ok?: boolean } | undefined>;

/** Foto do site com recorte: escolher arquivo ou reajustar a atual, arrastar e dar zoom no quadro. */
export default function Recorte({ acao, atual, proporcao, largura, titulo, circulo, origem }: { acao: Acao; atual?: string; proporcao: number; largura: number; titulo: string; circulo?: boolean; origem?: string }) {
  const router = useRouter();
  const entrada = useRef<HTMLInputElement>(null);
  const quadro = useRef<HTMLDivElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [estado, setEstado] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const arraste = useRef<{ px: number; py: number; x: number; y: number } | null>(null);
  const [W, setW] = useState(0);
  const H = W / proporcao;

  useEffect(() => {
    if (!src) return;
    const i = new Image(); i.crossOrigin = 'anonymous';
    i.onload = () => { setImg(i); setZoom(1); setPos({ x: 0, y: 0 }); };
    i.onerror = () => { setErro('Esse formato não abre no navegador. Envie mesmo assim e ajuste depois.'); setImg(null); };
    i.src = src;
  }, [src]);
  useEffect(() => {
    const el = quadro.current; if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth)); ro.observe(el);
    return () => ro.disconnect();
  }, [src]);

  const base = img && W ? Math.max(W / img.naturalWidth, H / img.naturalHeight) : 1;
  const esc = base * zoom;
  const dw = img ? img.naturalWidth * esc : 0, dh = img ? img.naturalHeight * esc : 0;
  const limitar = (x: number, y: number) => ({ x: Math.min(0, Math.max(W - dw, x)), y: Math.min(0, Math.max(H - dh, y)) });
  const p = img ? limitar(pos.x, pos.y) : { x: 0, y: 0 };
  const centrou = useRef<HTMLImageElement | null>(null);
  useEffect(() => { // centraliza a foto quando abre
    if (img && W && centrou.current !== img) { centrou.current = img; setPos({ x: (W - dw) / 2, y: (H - dh) / 2 }); }
  }, [img, W, dw, dh, H]);

  const mudarZoom = (z: number) => {
    const cx = (W / 2 - p.x) / esc, cy = (H / 2 - p.y) / esc; // ponto da foto no centro do quadro
    const ne = base * z;
    setZoom(z); setPos(limitar(W / 2 - cx * ne, H / 2 - cy * ne));
  };

  async function enviarArquivo(f: Blob, nome: string) {
    setEstado('Enviando…'); setErro(null);
    const fd = new FormData(); fd.append('foto', new File([f], nome, { type: f.type || 'image/jpeg' }));
    const r = await acao(fd).catch(() => ({ erro: 'Falha no envio. Tente de novo.' }));
    setEstado(null);
    if (r?.erro) { setErro(r.erro); return false; }
    router.refresh(); return true;
  }

  async function salvar() {
    if (!img) return;
    const sx = -p.x / esc, sy = -p.y / esc, sw = W / esc, sh = H / esc;
    const out = Math.min(largura, Math.round(sw));
    const c = document.createElement('canvas'); c.width = out; c.height = Math.round(out / proporcao);
    const g = c.getContext('2d')!; g.imageSmoothingQuality = 'high';
    g.drawImage(img, sx, sy, sw, sh, 0, 0, c.width, c.height);
    const blob: Blob | null = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.9));
    if (blob && (await enviarArquivo(blob, 'recorte.jpg'))) fechar();
  }
  const fechar = () => { if (src?.startsWith('blob:')) URL.revokeObjectURL(src); setSrc(null); setImg(null); setErro(null); };

  return (
    <div className="stack" style={{ gap: 10 }}>
      <div className="row">
        <button type="button" className="btn dark sm" onClick={() => entrada.current?.click()}>{atual ? 'Trocar foto' : origem ? 'Outra foto' : 'Enviar foto'}</button>
        {atual && <button type="button" className="btn sm" onClick={() => setSrc(atual)}>Ajustar enquadramento</button>}
        {!atual && origem && <button type="button" className="btn sm" onClick={() => setSrc(origem)}>Recortar do retrato</button>}
        <input ref={entrada} type="file" accept="image/*,.heic,.heif" hidden onChange={(e) => {
          const f = e.target.files?.[0]; e.target.value = ''; if (!f) return;
          setSrc(URL.createObjectURL(f)); (window as unknown as { __arq?: File }).__arq = f;
        }} />
      </div>
      {estado && <div className="hint">{estado}</div>}
      {erro && !src && <div className="alerta">{erro}</div>}

      {src && (
        <div className="recorte-fundo" role="dialog" aria-modal="true" aria-label={`Recortar ${titulo}`}>
          <div className="recorte-caixa">
            <div><h2>{titulo}</h2><p className="hint">Arraste a foto pra enquadrar e use o zoom. O que estiver dentro do quadro é o que aparece no site.</p></div>
            <div ref={quadro} className={'recorte-quadro' + (circulo ? ' circulo' : '')} style={{ aspectRatio: String(proporcao), width: `min(100%, calc(58vh * ${proporcao}))` }}
              onPointerDown={(e) => { (e.target as HTMLElement).setPointerCapture(e.pointerId); arraste.current = { px: e.clientX, py: e.clientY, x: p.x, y: p.y }; }}
              onPointerMove={(e) => { const a = arraste.current; if (!a) return; setPos(limitar(a.x + e.clientX - a.px, a.y + e.clientY - a.py)); }}
              onPointerUp={() => { arraste.current = null; }}>
              {img && <img src={img.src} alt="" draggable={false} style={{ width: dw, height: dh, transform: `translate(${p.x}px, ${p.y}px)` }} />}
              {!img && !erro && <span className="hint" style={{ margin: 'auto' }}>Carregando…</span>}
              {erro && <div className="alerta" style={{ margin: 'auto 16px' }}>{erro}</div>}
            </div>
            {img && <label className="lb">Zoom<input type="range" min={1} max={3} step={0.01} value={zoom} onChange={(e) => mudarZoom(Number(e.target.value))} /></label>}
            <div className="row" style={{ justifyContent: 'flex-end' }}>
              <button type="button" className="btn sm" onClick={fechar}>Cancelar</button>
              {!img && erro && (window as unknown as { __arq?: File }).__arq && <button type="button" className="btn sm" onClick={async () => { const f = (window as unknown as { __arq?: File }).__arq!; if (await enviarArquivo(f, f.name)) fechar(); }}>Enviar sem recortar</button>}
              {img && <button type="button" className="btn dark sm" disabled={!!estado} onClick={salvar}>{estado ?? 'Salvar recorte'}</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
