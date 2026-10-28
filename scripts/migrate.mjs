import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import crypto from 'node:crypto';
import fs from 'node:fs';

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

// Códigos no padrão CC + zona + número (uma vez só: renumera códigos antigos "CC-0001")
{
  const norm = (s) => (s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const tabela = new Map(Object.entries(JSON.parse(fs.readFileSync(new URL('../src/lib/zonas.json', import.meta.url)))).map(([b, z]) => [norm(b), z]));
  const sp = (c) => !c || ['sao paulo', 'sp', 'sao paulo sp'].includes(norm(c));
  const antigos = await sql`select id, bairro, cidade, visivel from imoveis where codigo ~ '^CC-[0-9]{4}$' or codigo like 'tmp-%' order by id`;
  for (const i of antigos) {
    const z = sp(i.cidade) ? tabela.get(norm(i.bairro)) ?? null : 6;
    if (!z) {
      await sql`update imoveis set codigo = ${'R' + i.id}, zona = null, visivel = false where id = ${i.id}`;
      console.log(`[codigo] imóvel ${i.id} (bairro "${i.bairro ?? ''}") ficou como rascunho: falta escolher a zona`);
      continue;
    }
    const [{ m }] = await sql`select coalesce(max(substring(codigo from 3)::int), 0) as m from imoveis where codigo ~ ${'^CC' + z + '[0-9]{3}$'}`;
    const codigo = 'CC' + (Number(m) ? Number(m) + 1 : z * 1000 + 1);
    await sql`update imoveis set codigo = ${codigo}, zona = ${z}, publicado_em = case when visivel then now() else null end where id = ${i.id}`;
    console.log(`[codigo] imóvel ${i.id} → ${codigo}`);
  }
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
