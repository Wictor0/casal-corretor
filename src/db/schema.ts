import { pgTable, serial, text, integer, boolean, timestamp, numeric, pgEnum, primaryKey, jsonb, index } from 'drizzle-orm/pg-core';

export const negocioEnum = pgEnum('negocio', ['venda', 'aluguel', 'terreno']);
export const statusImovelEnum = pgEnum('status_imovel', ['disponivel', 'negociacao', 'vendido']);
export const tipoCaracEnum = pgEnum('tipo_caracteristica', ['simnao', 'numero', 'opcao']);
export const statusParceiroEnum = pgEnum('status_parceiro', ['nova', 'analise', 'aprovado', 'recusado']);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  nome: text('nome').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(), // sha256 do token
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
});

export const invites = pgTable('invites', {
  id: text('id').primaryKey(), // sha256 do token
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  usedAt: timestamp('used_at', { withTimezone: true }),
});

export const imoveis = pgTable('imoveis', {
  id: serial('id').primaryKey(),
  codigo: text('codigo').notNull().unique(),
  titulo: text('titulo').notNull(),
  negocio: negocioEnum('negocio').notNull().default('venda'),
  tipo: text('tipo').notNull().default('Apartamento'),
  status: statusImovelEnum('status').notNull().default('disponivel'),
  preco: integer('preco'),
  condominio: integer('condominio'),
  iptu: integer('iptu'),
  area: numeric('area'),
  quartos: integer('quartos'),
  suites: integer('suites'),
  banheiros: integer('banheiros'),
  vagas: integer('vagas'),
  andar: text('andar'),
  bairro: text('bairro'),
  cidade: text('cidade').default('São Paulo'),
  endereco: text('endereco'),
  descricao: text('descricao'),
  videos: jsonb('videos').$type<string[]>().default([]).notNull(),
  // Terrenos e retrofit
  areaTerreno: numeric('area_terreno'),
  frente: numeric('frente'),
  fundo: numeric('fundo'),
  areaConstruida: numeric('area_construida'),
  estadoImovel: text('estado_imovel'),
  topografia: text('topografia'),
  zoneamento: text('zoneamento'),
  // Publicação
  visivel: boolean('visivel').notNull().default(false),
  destaque: boolean('destaque').notNull().default(false),
  destaquePrincipal: boolean('destaque_principal').notNull().default(false),
  destaqueOrdem: integer('destaque_ordem').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [index('imoveis_negocio_idx').on(t.negocio), index('imoveis_visivel_idx').on(t.visivel)]);

export const fotos = pgTable('fotos', {
  id: serial('id').primaryKey(),
  imovelId: integer('imovel_id').notNull().references(() => imoveis.id, { onDelete: 'cascade' }),
  key: text('key').notNull(),
  thumbKey: text('thumb_key').notNull(),
  largura: integer('largura'),
  altura: integer('altura'),
  ordem: integer('ordem').notNull().default(0),
}, (t) => [index('fotos_imovel_idx').on(t.imovelId)]);

export const caracteristicas = pgTable('caracteristicas', {
  id: serial('id').primaryKey(),
  nome: text('nome').notNull().unique(),
  tipo: tipoCaracEnum('tipo').notNull().default('simnao'),
  filtro: boolean('filtro').notNull().default(true),
  ordem: integer('ordem').notNull().default(0),
});

export const imovelCaracteristicas = pgTable('imovel_caracteristicas', {
  imovelId: integer('imovel_id').notNull().references(() => imoveis.id, { onDelete: 'cascade' }),
  caracteristicaId: integer('caracteristica_id').notNull().references(() => caracteristicas.id, { onDelete: 'cascade' }),
  valor: text('valor'),
}, (t) => [primaryKey({ columns: [t.imovelId, t.caracteristicaId] })]);

export const construtoras = pgTable('construtoras', {
  id: serial('id').primaryKey(),
  nome: text('nome').notNull(),
  logoKey: text('logo_key'),
  link: text('link'),
  ativo: boolean('ativo').notNull().default(true),
  ordem: integer('ordem').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const parceiros = pgTable('parceiros', {
  id: serial('id').primaryKey(),
  nome: text('nome').notNull(),
  email: text('email').notNull(),
  whatsapp: text('whatsapp').notNull(),
  creci: text('creci').notNull(),
  uf: text('uf').notNull(),
  regioes: text('regioes'),
  experiencia: text('experiencia'),
  sobre: text('sobre'),
  status: statusParceiroEnum('status').notNull().default('nova'),
  notas: text('notas'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const configuracoes = pgTable('configuracoes', {
  chave: text('chave').primaryKey(),
  valor: jsonb('valor'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
