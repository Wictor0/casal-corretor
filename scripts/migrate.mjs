import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import crypto from 'node:crypto';

const url = process.env.DATABASE_URL;
if (!url) { console.error('DATABASE_URL ausente'); process.exit(1); }
const sql = postgres(url, { max: 1 });
await migrate(drizzle(sql), { migrationsFolder: './drizzle' });
console.log('[migrate] ok');

// Características padrão
const [{ n }] = await sql`select count(*)::int as n from caracteristicas`;
if (n === 0) {
  const padrao = ['Perto do metrô', 'Mobiliado', 'Piscina', 'Academia', 'Churrasqueira', 'Salão de festas', 'Portaria 24h', 'Elevador', 'Varanda', 'Aceita pet', 'Móveis planejados', 'Reformado', 'Ar-condicionado', 'Quintal'];
  for (const [i, nome] of padrao.entries()) await sql`insert into caracteristicas (nome, tipo, filtro, ordem) values (${nome}, 'simnao', true, ${i})`;
  console.log('[seed] características padrão criadas');
}

// Usuários iniciais: INITIAL_USERS="Nome|email;Nome|email"
const base = (process.env.APP_URL || '').replace(/\/$/, '');
for (const item of (process.env.INITIAL_USERS || '').split(';').map((s) => s.trim()).filter(Boolean)) {
  const [nome, emailRaw] = item.split('|').map((s) => s.trim());
  const email = (emailRaw || '').toLowerCase();
  if (!nome || !email) continue;
  let [u] = await sql`select id, password_hash from users where email = ${email}`;
  if (!u) [u] = await sql`insert into users (nome, email) values (${nome}, ${email}) returning id, password_hash`;
  if (u.password_hash) continue;
  const [ativo] = await sql`select id from invites where user_id = ${u.id} and used_at is null and expires_at > now()`;
  if (ativo && process.env.RESET_INVITES !== '1') continue;
  await sql`delete from invites where user_id = ${u.id} and used_at is null`;
  const token = crypto.randomBytes(24).toString('base64url');
  const id = crypto.createHash('sha256').update(token).digest('hex');
  await sql`insert into invites (id, user_id, expires_at) values (${id}, ${u.id}, now() + interval '7 days')`;
  console.log(`[convite] ${nome} <${email}>: ${base}/painel/convite/${token}`);
}
await sql.end();
