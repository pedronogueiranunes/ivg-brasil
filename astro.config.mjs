// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import markdoc from '@astrojs/markdoc';
import sitemap from '@astrojs/sitemap';

// O painel do Keystatic precisa de servidor. No staging (GitHub Pages, estático)
// ele fica de fora; localmente, `npm run dev` abre o painel em /keystatic.
const isDev = process.argv.includes('dev');

// Staging: https://pedronogueiranunes.github.io/ivg-brasil/
// Produção (futuro): https://ivgbrasil.org, sem base.
const site = process.env.SITE_URL ?? 'https://pedronogueiranunes.github.io';
const base = isDev ? '/' : (process.env.BASE_PATH ?? '/ivg-brasil');

export default defineConfig({
  site,
  base,
  trailingSlash: isDev ? 'ignore' : 'always',
  i18n: {
    locales: ['pt', 'en', 'de'],
    defaultLocale: 'pt',
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    react(),
    markdoc(),
    sitemap({ i18n: { defaultLocale: 'pt', locales: { pt: 'pt-BR', en: 'en', de: 'de' } } }),
    ...(isDev ? [keystatic()] : []),
  ],
});
