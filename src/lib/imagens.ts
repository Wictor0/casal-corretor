import 'server-only';
import sharp from 'sharp';
import crypto from 'node:crypto';
import { enviar } from './s3';

/** Fotos HEIC (padrão do iPhone) não abrem no sharp: converte pra JPEG antes. */
async function decodificar(buf: Buffer): Promise<Buffer> {
  const marca = buf.subarray(4, 12).toString('latin1');
  if (/^ftyp(heic|heix|hevc|hevx|mif1|msf1)/.test(marca)) {
    // @ts-expect-error pacote sem tipos
    const heic = (await import('heic-convert')).default;
    return Buffer.from(await heic({ buffer: buf, format: 'JPEG', quality: 0.9 }));
  }
  return buf;
}

export async function processarFoto(file: File, pasta: string, opts: { max?: number; thumb?: number } = {}) {
  const buf = await decodificar(Buffer.from(await file.arrayBuffer()));
  const id = crypto.randomUUID();
  const base = sharp(buf, { failOn: 'none' }).rotate();
  const full = await base.clone().resize({ width: opts.max ?? 2200, height: opts.max ?? 2200, fit: 'inside', withoutEnlargement: true }).webp({ quality: 80 }).toBuffer({ resolveWithObject: true });
  const thumb = await base.clone().resize({ width: opts.thumb ?? 720, height: opts.thumb ?? 720, fit: 'inside', withoutEnlargement: true }).webp({ quality: 74 }).toBuffer();
  const key = `${pasta}/${id}.webp`;
  const thumbKey = `${pasta}/${id}-t.webp`;
  await Promise.all([enviar(key, full.data, 'image/webp'), enviar(thumbKey, thumb, 'image/webp')]);
  return { key, thumbKey, largura: full.info.width, altura: full.info.height };
}

export async function processarLogo(file: File, pasta: string) {
  const buf = Buffer.from(await file.arrayBuffer());
  const id = crypto.randomUUID();
  if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
    const txt = buf.toString('utf8');
    if (/<script|on\w+=/i.test(txt)) throw new Error('SVG inválido');
    const key = `${pasta}/${id}.svg`;
    await enviar(key, buf, 'image/svg+xml');
    return key;
  }
  const out = await sharp(buf, { failOn: 'none' }).resize({ width: 600, height: 300, fit: 'inside', withoutEnlargement: true }).png().toBuffer();
  const key = `${pasta}/${id}.png`;
  await enviar(key, out, 'image/png');
  return key;
}
