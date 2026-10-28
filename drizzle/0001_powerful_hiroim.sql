ALTER TABLE "imoveis" ADD COLUMN "zona" integer;--> statement-breakpoint
ALTER TABLE "imoveis" ADD COLUMN "zona_manual" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "imoveis" ADD COLUMN "publicado_em" timestamp with time zone;