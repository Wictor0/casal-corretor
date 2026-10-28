import ZONAS_BAIRROS from './zonas.json';

export const ZONAS = { 1: 'Zona Sul', 2: 'Zona Leste', 3: 'Zona Oeste', 4: 'Zona Norte', 5: 'Centro', 6: 'Litoral e outras cidades' } as const;
export type Zona = keyof typeof ZONAS;

export const norm = (s: string | null | undefined) =>
  (s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const TABELA = new Map(Object.entries(ZONAS_BAIRROS as Record<string, number>).map(([b, z]) => [norm(b), z as Zona]));
const eSaoPaulo = (cidade?: string | null) => !cidade || ['sao paulo', 'sp', 'sao paulo sp'].includes(norm(cidade));

/** Zona pela tabela de bairros de SP. Cidade fora de SP = 6. Desconhecido = null. */
export function zonaPelaTabela(bairro?: string | null, cidade?: string | null): Zona | null {
  if (!eSaoPaulo(cidade)) return 6;
  return TABELA.get(norm(bairro)) ?? null;
}

export const RASCUNHO = /^R\d+$/;
export const ehRascunho = (c: string) => RASCUNHO.test(c);

/** Único lugar que define como o código aparece (trocar aqui se quiserem "CC-1001"). */
export const exibirCodigo = (c: string) => (ehRascunho(c) ? 'Rascunho' : c);

/** Aceita "cc1001", "CC-1001", "cc 1001", "cc1001-apartamento-..." → "CC1001" */
export function lerCodigo(s: string | null | undefined): string | null {
  const m = (s ?? '').trim().match(/^#?\s*cc[\s-]?(\d{4})(?![\d])/i);
  return m ? 'CC' + m[1] : null;
}

const slugify = (s: string) => norm(s).replace(/ /g, '-').slice(0, 60).replace(/-+$/, '');
export const slugImovel = (p: { codigo: string; tipo?: string | null; bairro?: string | null }) =>
  [p.codigo.toLowerCase(), p.tipo && slugify(p.tipo), p.bairro && slugify(p.bairro)].filter(Boolean).join('-');
