export const brl = (n?: number | null) => (n == null ? '—' : 'R$ ' + n.toLocaleString('pt-BR'));
export const NEGOCIOS = { venda: 'Venda', aluguel: 'Aluguel', terreno: 'Terrenos e retrofit' } as const;
export const STATUS = { disponivel: 'Disponível', negociacao: 'Em negociação', vendido: 'Vendido/alugado' } as const;
export const TIPOS = ['Apartamento', 'Casa', 'Cobertura', 'Studio', 'Casa em condomínio', 'Sobrado', 'Terreno', 'Comercial', 'Galpão'];
export const ESTADOS = ['Pra demolir', 'Precisa de reforma completa', 'No contrapiso', 'Reforma parcial'];
export const TOPOGRAFIAS = ['Plano', 'Aclive', 'Declive'];
export const int = (v: FormDataEntryValue | null) => { const s = String(v ?? '').replace(/\D/g, ''); return s ? Number(s) : null; };
export const dec = (v: FormDataEntryValue | null) => { const s = String(v ?? '').trim().replace(/\./g, '').replace(',', '.'); return s && !isNaN(Number(s)) ? s : null; };
export const txt = (v: FormDataEntryValue | null) => { const s = String(v ?? '').trim(); return s || null; };
export const CHAVES_FOTO = ['foto_casal', 'foto_sumaia', 'foto_allan', 'bola_sumaia', 'bola_allan'] as const;
export const ROTULO_FOTO: Record<(typeof CHAVES_FOTO)[number], { t: string; s: string }> = {
  foto_casal: { t: 'Foto do casal', s: 'Aparece só na página Sobre. Horizontal fica melhor.' },
  foto_sumaia: { t: 'Foto da Sumaia', s: 'Retrato individual na página Sobre. Vertical fica melhor.' },
  foto_allan: { t: 'Foto do Allan', s: 'Retrato individual na página Sobre. Vertical fica melhor.' },
  bola_sumaia: { t: 'Bolinha da Sumaia', s: 'Foto redonda dos contatos e da página do imóvel.' },
  bola_allan: { t: 'Bolinha do Allan', s: 'Foto redonda dos contatos e da página do imóvel.' },
};
export const MAX_DESTAQUES = 8;
export const STATUS_PARCEIRO = { nova: 'Nova', analise: 'Em análise', aprovado: 'Aprovado', recusado: 'Recusado' } as const;
