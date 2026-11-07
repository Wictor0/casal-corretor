CREATE TABLE "visitas" (
	"id" serial PRIMARY KEY NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"tipo" text DEFAULT 'pv' NOT NULL,
	"caminho" text NOT NULL,
	"imovel_id" integer,
	"visitante" text NOT NULL,
	"origem" text,
	"meio" text,
	"campanha" text,
	"dispositivo" text
);
--> statement-breakpoint
ALTER TABLE "visitas" ADD CONSTRAINT "visitas_imovel_id_imoveis_id_fk" FOREIGN KEY ("imovel_id") REFERENCES "public"."imoveis"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "visitas_data_idx" ON "visitas" USING btree ("criado_em");--> statement-breakpoint
CREATE INDEX "visitas_imovel_idx" ON "visitas" USING btree ("imovel_id");