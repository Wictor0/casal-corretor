'use server';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { eq, and, isNull, gt } from 'drizzle-orm';
import { db, t } from '@/db';
import { criarSessao, encerrarSessao, sha } from '@/lib/auth';

type Estado = { erro?: string; email?: string; n?: number } | undefined;
const tentativas = new Map<string, { n: number; ate: number }>();

export async function entrar(_: Estado, fd: FormData): Promise<Estado> {
  const email = String(fd.get('email') || '').trim().toLowerCase();
  const senha = String(fd.get('senha') || '');
  const lim = tentativas.get(email);
  if (lim && lim.n >= 5 && lim.ate > Date.now()) return { erro: 'Muitas tentativas. Espere 15 minutos e tente de novo.', email, n: Date.now() };
  const [u] = await db.select().from(t.users).where(eq(t.users.email, email));
  const ok = u?.passwordHash ? await bcrypt.compare(senha, u.passwordHash) : false;
  if (!u || !ok) {
    const atual = lim && lim.ate > Date.now() ? lim : { n: 0, ate: Date.now() + 15 * 60e3 };
    tentativas.set(email, { n: atual.n + 1, ate: atual.ate });
    return { erro: 'E-mail ou senha incorretos.', email, n: Date.now() };
  }
  tentativas.delete(email);
  await criarSessao(u.id);
  redirect('/painel');
}

export async function definirSenha(_: Estado, fd: FormData): Promise<Estado> {
  const token = String(fd.get('token') || '');
  const senha = String(fd.get('senha') || '');
  const conf = String(fd.get('confirmar') || '');
  if (senha.length < 8) return { erro: 'A senha precisa ter pelo menos 8 caracteres.' };
  if (senha !== conf) return { erro: 'As senhas não são iguais.' };
  const [inv] = await db.select().from(t.invites).where(and(eq(t.invites.id, sha(token)), isNull(t.invites.usedAt), gt(t.invites.expiresAt, new Date())));
  if (!inv) return { erro: 'Este link expirou ou já foi usado. Peça um novo ao Wictor.' };
  await db.update(t.users).set({ passwordHash: await bcrypt.hash(senha, 12) }).where(eq(t.users.id, inv.userId));
  await db.update(t.invites).set({ usedAt: new Date() }).where(eq(t.invites.id, inv.id));
  await db.delete(t.sessions).where(eq(t.sessions.userId, inv.userId));
  await criarSessao(inv.userId);
  redirect('/painel');
}

export async function sair() {
  await encerrarSessao();
  redirect('/painel/entrar');
}
