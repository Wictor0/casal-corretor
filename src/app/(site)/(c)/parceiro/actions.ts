'use server';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { db, t } from '@/db';

export type EstadoInscricao = { ok?: boolean; erro?: string; campos?: Record<string, string> } | undefined;
const tentativas = new Map<string, { n: number; ate: number }>();
const UFS = ['SP', 'RJ', 'MG', 'PR', 'SC', 'RS', 'ES', 'BA', 'PE', 'CE', 'GO', 'DF', 'MS', 'MT', 'Outro'];

export async function inscreverParceiro(_: EstadoInscricao, fd: FormData): Promise<EstadoInscricao> {
  const v = (k: string, max = 200) => String(fd.get(k) ?? '').trim().slice(0, max);
  const campos = { nome: v('nome', 120), email: v('email', 160), whatsapp: v('whatsapp', 30), creci: v('creci', 20), uf: v('uf', 10), regioes: v('regioes'), experiencia: v('experiencia', 40), sobre: v('sobre', 2000) };
  if (v('site')) return { ok: true }; // campo-isca contra robôs
  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  const lim = tentativas.get(ip);
  if (lim && lim.ate > Date.now() && lim.n >= 5) return { erro: 'Muitas inscrições seguidas. Tente de novo mais tarde.', campos };

  if (campos.nome.length < 3) return { erro: 'Preencha seu nome completo.', campos };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(campos.email)) return { erro: 'Confira o e-mail.', campos };
  if (campos.whatsapp.replace(/\D/g, '').length < 10) return { erro: 'Confira o WhatsApp com DDD.', campos };
  if (!/\d{3,}/.test(campos.creci)) return { erro: 'Informe o número do seu CRECI.', campos };
  if (!UFS.includes(campos.uf)) campos.uf = 'SP';
  if (fd.get('aceite') !== 'on') return { erro: 'Marque a autorização pra enviar.', campos };

  await db.insert(t.parceiros).values({
    nome: campos.nome, email: campos.email.toLowerCase(), whatsapp: campos.whatsapp, creci: campos.creci.toUpperCase(), uf: campos.uf,
    regioes: campos.regioes || null, experiencia: campos.experiencia || null, sobre: campos.sobre || null,
  });
  tentativas.set(ip, { n: (lim && lim.ate > Date.now() ? lim.n : 0) + 1, ate: Date.now() + 60 * 60e3 });
  revalidatePath('/painel', 'layout');
  return { ok: true };
}
