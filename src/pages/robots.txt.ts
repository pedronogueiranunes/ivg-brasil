import type { APIRoute } from 'astro';

// Staging (com subpasta) ou PUBLIC_NOINDEX=1: bloqueia tudo. Produção: libera e aponta o sitemap.
export const GET: APIRoute = ({ site }) => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const bloqueado = base !== '' || import.meta.env.PUBLIC_NOINDEX === '1';
  const corpo = bloqueado
    ? 'User-agent: *\nDisallow: /\n'
    : `User-agent: *\nAllow: /\n\nSitemap: ${new URL(`${base}/sitemap-index.xml`, site)}\n`;
  return new Response(corpo, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
