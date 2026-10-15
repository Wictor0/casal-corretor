import 'server-only';
import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { eq, and, gt } from 'drizzle-orm';
import { db, t } from '@/db';

export const COOKIE = 'cc_sessao';
const DIAS = 30;

export const sha = (s: string) => crypto.createHash('sha256').update(s).digest('hex');
export const novoToken = () => crypto.randomBytes(32).toString('base64url');

export async function criarSessao(userId: number) {
  const token = novoToken();
  const expiresAt = new Date(Date.now() + DIAS * 864e5);
  await db.insert(t.sessions).values({ id: sha(token), userId, expiresAt });
  (await cookies()).set(COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', expires: expiresAt });
}

export async function encerrarSessao() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await db.delete(t.sessions).where(eq(t.sessions.id, sha(token)));
  jar.delete(COOKIE);
}

export async function usuarioAtual() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const [row] = await db
    .select({ id: t.users.id, nome: t.users.nome, email: t.users.email })
    .from(t.sessions)
    .innerJoin(t.users, eq(t.users.id, t.sessions.userId))
    .where(and(eq(t.sessions.id, sha(token)), gt(t.sessions.expiresAt, new Date())));
  return row ?? null;
}

export async function exigirUsuario() {
  const u = await usuarioAtual();
  if (!u) redirect('/painel/entrar');
  return u;
}
