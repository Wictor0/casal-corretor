import type { MetadataRoute } from 'next';
const BASE = (process.env.APP_URL || 'https://casalcorretoroficial.com.br').replace(/\/$/, '');
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: '*', allow: '/', disallow: ['/painel'] }, sitemap: `${BASE}/sitemap.xml` };
}
