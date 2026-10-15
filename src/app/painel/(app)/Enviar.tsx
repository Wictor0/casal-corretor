'use client';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

/** Reduz a foto no navegador antes de enviar (celular manda 12 MP → ~1 MB). */
async function comprimir(f: File, max = 2600): Promise<Blob> {
  if (!f.type.startsWith('image/') || f.type === 'image/svg+xml') return f;
  try {
    const bmp = await createImageBitmap(f, { imageOrientation: 'from-image' } as ImageBitmapOptions);
    const s = Math.min(1, max / Math.max(bmp.width, bmp.height));
    if (s === 1 && f.size < 4e6) return f;
    const c = document.createElement('canvas');
    c.width = Math.round(bmp.width * s); c.height = Math.round(bmp.height * s);
    c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height);
    return await new Promise((r) => c.toBlob((b) => r(b ?? f), 'image/jpeg', 0.88));
  } catch { return f; }
}

type Acao = (fd: FormData) => Promise<{ erro?: string; ok?: boolean } | undefined>;

export default function Enviar({ acao, multiplo = true, texto = 'Arraste as fotos aqui ou clique para escolher', aceita = 'image/*' }: { acao: Acao; multiplo?: boolean; texto?: string; aceita?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [prog, setProg] = useState<string | null>(null);
  const [erros, setErros] = useState<string[]>([]);
  const [sobre, setSobre] = useState(false);

  async function enviar(files: FileList | File[]) {
    const lista = Array.from(files).filter((f) => f.type.startsWith('image/') || /\.(heic|heif)$/i.test(f.name));
    if (!lista.length) return;
    const errs: string[] = [];
    for (let k = 0; k < lista.length; k++) {
      setProg(`Enviando ${k + 1} de ${lista.length}…`);
      try {
        const b = await comprimir(lista[k]);
        const fd = new FormData();
        fd.append('foto', b instanceof File ? b : new File([b], lista[k].name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' }));
        const r = await acao(fd);
        if (r?.erro) errs.push(`${lista[k].name}: ${r.erro}`);
      } catch { errs.push(`${lista[k].name}: não foi possível enviar`); }
      if (k % 3 === 2) router.refresh();
    }
    setErros(errs); setProg(null); router.refresh();
    if (ref.current) ref.current.value = '';
  }

  return (
    <div className="stack" style={{ gap: 8 }}>
      <div className="drop" role="button" tabIndex={0} style={sobre ? { borderColor: 'var(--dourado)' } : undefined}
        onClick={() => !prog && ref.current?.click()} onKeyDown={(e) => e.key === 'Enter' && ref.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setSobre(true); }} onDragLeave={() => setSobre(false)}
        onDrop={(e) => { e.preventDefault(); setSobre(false); if (!prog) enviar(e.dataTransfer.files); }}>
        {prog ?? texto}
        <input ref={ref} type="file" accept={aceita} multiple={multiplo} hidden onChange={(e) => e.target.files && enviar(e.target.files)} />
      </div>
      {erros.map((e) => <div key={e} className="alerta">{e}</div>)}
    </div>
  );
}
