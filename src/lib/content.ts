import { getCollection, type CollectionEntry } from 'astro:content';
import { defaultLocale, type Locale } from '@/i18n/ui';

/** Versão do idioma pedido ou, se não existir, a portuguesa com fallback = true. */
export async function getLocalized<C extends 'paginas' | 'home'>(collection: C, slug: string, locale: Locale) {
  const all = (await getCollection(collection)) as CollectionEntry<C>[];
  const want = collection === 'home' ? locale : `${locale}/${slug}`;
  const pt = collection === 'home' ? defaultLocale : `${defaultLocale}/${slug}`;
  const exact = all.find((e) => e.id === want);
  if (exact) return { entry: exact, fallback: false };
  const base = all.find((e) => e.id === pt);
  return base ? { entry: base, fallback: locale !== defaultLocale } : undefined;
}
