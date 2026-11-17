// Arquivo .ics de cada evento (tarefa 08): /agenda/<slug>.ics, /en/agenda/<slug>.ics, /de/agenda/<slug>.ics.
import type { APIRoute } from 'astro';
import type { CollectionEntry } from 'astro:content';
import { locales, defaultLocale, type Locale } from '@/i18n/ui';
import { href } from '@/i18n/utils';
import { getLocalizedList } from '@/lib/content';
import { ics } from '@/lib/eventos';

export async function getStaticPaths() {
  const porIdioma = await Promise.all(locales.map(async (l) => [l, await getLocalizedList('eventos', l)] as const));
  return porIdioma.flatMap(([l, itens]) => itens.map(({ slug, entry }) => ({
    params: { locale: l === defaultLocale ? undefined : l, slug },
    props: { entry, locale: l },
  })));
}

export const GET: APIRoute = ({ props, params, site }) => {
  const { entry, locale } = props as { entry: CollectionEntry<'eventos'>; locale: Locale };
  const agenda = new URL(href(locale, 'agenda'), site).href;
  const corpo = ics(entry, `${params.slug}@ivgbrasil.org`, agenda);
  return new Response(corpo, { headers: { 'Content-Type': 'text/calendar; charset=utf-8' } });
};
