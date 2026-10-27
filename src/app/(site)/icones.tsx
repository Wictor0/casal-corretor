export const Seta = ({ s = 14, d = 'M7 17L17 7M7 7h10v10' }: { s?: number; d?: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);
export const SETA_BAIXO = 'M7 7l10 10M17 7v10H7';
