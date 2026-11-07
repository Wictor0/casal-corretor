// Tráfego do domínio direto do Cloudflare (conta desde o lançamento, antes das métricas próprias).
// Precisa de CF_API_TOKEN com permissão "Zone · Analytics · Read". Sem token, o painel só esconde o bloco.
const ZONA = process.env.CF_ZONE_ID ?? 'b70c27443f6c43820797f06b81ed054b';

export type DiaCF = { dia: string; visitantes: number; paginas: number };
export type TrafegoCF = { dias: DiaCF[]; paises: { nome: string; v: number }[]; erro?: string };

export async function trafegoCloudflare(dias: number): Promise<TrafegoCF | null> {
  const token = process.env.CF_API_TOKEN;
  if (!token) return null;
  const ate = new Date().toISOString().slice(0, 10);
  const desde = new Date(Date.now() - (dias - 1) * 864e5).toISOString().slice(0, 10);
  const query = `query($z:String!,$a:Date!,$b:Date!){viewer{zones(filter:{zoneTag:$z}){httpRequests1dGroups(limit:400,filter:{date_geq:$a,date_leq:$b},orderBy:[date_ASC]){dimensions{date} sum{pageViews countryMap{clientCountryName requests}} uniq{uniques}}}}}`;
  try {
    const r = await fetch(process.env.CF_API_URL ?? 'https://api.cloudflare.com/client/v4/graphql', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { z: ZONA, a: desde, b: ate } }),
      next: { revalidate: 1800 },
    });
    const j = await r.json();
    if (j.errors?.length) return { dias: [], paises: [], erro: j.errors[0].message };
    type G = { dimensions: { date: string }; sum: { pageViews: number; countryMap: { clientCountryName: string; requests: number }[] }; uniq: { uniques: number } };
    const grupos: G[] = j.data?.viewer?.zones?.[0]?.httpRequests1dGroups ?? [];
    const nomes = new Intl.DisplayNames(['pt-BR'], { type: 'region' });
    const paises = new Map<string, number>();
    for (const g of grupos) for (const c of g.sum.countryMap) paises.set(c.clientCountryName, (paises.get(c.clientCountryName) ?? 0) + c.requests);
    return {
      dias: grupos.map((g) => ({ dia: g.dimensions.date, visitantes: g.uniq.uniques, paginas: g.sum.pageViews })),
      paises: [...paises].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, v]) => {
        let nome = k; try { nome = nomes.of(k) ?? k; } catch { /* código desconhecido */ }
        return { nome, v };
      }),
    };
  } catch {
    return { dias: [], paises: [], erro: 'Não foi possível falar com o Cloudflare agora.' };
  }
}
