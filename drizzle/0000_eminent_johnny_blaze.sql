CREATE TYPE "public"."negocio" AS ENUM('venda', 'aluguel', 'terreno');--> statement-breakpoint
CREATE TYPE "public"."status_imovel" AS ENUM('disponivel', 'negociacao', 'vendido');--> statement-breakpoint
CREATE TYPE "public"."status_parceiro" AS ENUM('nova', 'analise', 'aprovado', 'recusado');--> statement-breakpoint
CREATE TYPE "public"."tipo_caracteristica" AS ENUM('simnao', 'numero', 'opcao');--> statement-breakpoint
CREATE TABLE "caracteristicas" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" text NOT NULL,
	"tipo" "tipo_caracteristica" DEFAULT 'simnao' NOT NULL,
	"filtro" boolean DEFAULT true NOT NULL,
	"ordem" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "caracteristicas_nome_unique" UNIQUE("nome")
);
--> statement-breakpoint
CREATE TABLE "configuracoes" (
	"chave" text PRIMARY KEY NOT NULL,
	"valor" jsonb,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "construtoras" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" text NOT NULL,
	"logo_key" text,
	"link" text,
	"ativo" boolean DEFAULT true NOT NULL,
	"ordem" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fotos" (
	"id" serial PRIMARY KEY NOT NULL,
	"imovel_id" integer NOT NULL,
	"key" text NOT NULL,
	"thumb_key" text NOT NULL,
	"largura" integer,
	"altura" integer,
	"ordem" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "imoveis" (
	"id" serial PRIMARY KEY NOT NULL,
	"codigo" text NOT NULL,
	"titulo" text NOT NULL,
	"negocio" "negocio" DEFAULT 'venda' NOT NULL,
	"tipo" text DEFAULT 'Apartamento' NOT NULL,
	"status" "status_imovel" DEFAULT 'disponivel' NOT NULL,
	"preco" integer,
	"condominio" integer,
	"iptu" integer,
	"area" numeric,
	"quartos" integer,
	"suites" integer,
	"banheiros" integer,
	"vagas" integer,
	"andar" text,
	"bairro" text,
	"cidade" text DEFAULT 'São Paulo',
	"endereco" text,
	"descricao" text,
	"videos" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"area_terreno" numeric,
	"frente" numeric,
	"fundo" numeric,
	"area_construida" numeric,
	"estado_imovel" text,
	"topografia" text,
	"zoneamento" text,
	"visivel" boolean DEFAULT false NOT NULL,
	"destaque" boolean DEFAULT false NOT NULL,
	"destaque_principal" boolean DEFAULT false NOT NULL,
	"destaque_ordem" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "imoveis_codigo_unique" UNIQUE("codigo")
);
--> statement-breakpoint
CREATE TABLE "imovel_caracteristicas" (
	"imovel_id" integer NOT NULL,
	"caracteristica_id" integer NOT NULL,
	"valor" text,
	CONSTRAINT "imovel_caracteristicas_imovel_id_caracteristica_id_pk" PRIMARY KEY("imovel_id","caracteristica_id")
);
--> statement-breakpoint
CREATE TABLE "invites" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "parceiros" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" text NOT NULL,
	"email" text NOT NULL,
	"whatsapp" text NOT NULL,
	"creci" text NOT NULL,
	"uf" text NOT NULL,
	"regioes" text,
	"experiencia" text,
	"sobre" text,
	"status" "status_parceiro" DEFAULT 'nova' NOT NULL,
	"notas" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "fotos" ADD CONSTRAINT "fotos_imovel_id_imoveis_id_fk" FOREIGN KEY ("imovel_id") REFERENCES "public"."imoveis"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "imovel_caracteristicas" ADD CONSTRAINT "imovel_caracteristicas_imovel_id_imoveis_id_fk" FOREIGN KEY ("imovel_id") REFERENCES "public"."imoveis"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "imovel_caracteristicas" ADD CONSTRAINT "imovel_caracteristicas_caracteristica_id_caracteristicas_id_fk" FOREIGN KEY ("caracteristica_id") REFERENCES "public"."caracteristicas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invites" ADD CONSTRAINT "invites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "fotos_imovel_idx" ON "fotos" USING btree ("imovel_id");--> statement-breakpoint
CREATE INDEX "imoveis_negocio_idx" ON "imoveis" USING btree ("negocio");--> statement-breakpoint
CREATE INDEX "imoveis_visivel_idx" ON "imoveis" USING btree ("visivel");