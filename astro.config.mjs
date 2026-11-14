// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import markdoc from '@astrojs/markdoc';
import cloudflare from '@astrojs/cloudflare';

// O painel do Keystatic precisa de servidor. No staging (GitHub Pages, estático)
// ele fica de fora; localmente, `npm run dev` abre o painel em /keystatic.
// No Cloudflare Pages (CF_PAGES=1) o site continua estático e só as rotas do
// painel rodam em servidor, pelo adaptador da Cloudflare.
const isDev = process.argv.includes('dev');
const isCloudflare = process.env.CF_PAGES === '1' || process.env.DEPLOY_TARGET === 'cloudflare';

// Staging: https://pedronogueiranunes.github.io/ivg-brasil/
// Produção (futuro): https://ivgbrasil.org, sem base.
const site = process.env.SITE_URL ?? 'https://pedronogueiranunes.github.io';
const defaultBase = isCloudflare ? '/' : '/ivg-brasil';
const base = isDev ? '/' : (process.env.BASE_PATH ?? defaultBase);

export default defineConfig({
  site,
  base,
  trailingSlash: isDev ? 'ignore' : 'always',
  i18n: {
    locales: ['pt', 'en', 'de'],
    defaultLocale: 'pt',
    routing: { prefixDefaultLocale: false },
  },
  ...(isCloudflare ? { adapter: cloudflare() } : {}),
  integrations: isDev || isCloudflare ? [react(), markdoc(), keystatic()] : [react(), markdoc()],
});
