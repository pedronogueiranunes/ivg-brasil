import { getCollection, type CollectionEntry } from 'astro:content';
import { defaultLocale, type Locale } from '@/i18n/ui';

// Estrutura das pastas: src/content/<coleção>/{pt,en,de}/<slug>.<ext>, com o mesmo slug nos três idiomas.
// O português é a referência: sem versão no idioma pedido, volta a versão PT com fallback = true.
// A coleção "home" é diferente: um arquivo por idioma (pt.yaml, en.yaml, de.yaml).
type Localized = 'paginas' | 'home' | 'noticias' | 'eventos';

/** Slug sem o prefixo do idioma: "pt/ivg-brasil-lanca-seu-site" vira "ivg-brasil-lanca-seu-site". */
export function slugOf(id: string): string {
  return id.replace(/^(pt|en|de)\//, '');
}

/** Versão do idioma pedido ou, se não existir, a portuguesa com fallback = true. */
export async function getLocalized<C extends Localized>(collection: C, slug: string, locale: Locale) {
  const all = (await getCollection(collection)) as CollectionEntry<C>[];
  const want = collection === 'home' ? locale : `${locale}/${slug}`;
  const pt = collection === 'home' ? defaultLocale : `${defaultLocale}/${slug}`;
  const exact = all.find((e) => e.id === want);
  if (exact) return { entry: exact, fallback: false };
  const base = all.find((e) => e.id === pt);
  return base ? { entry: base, fallback: locale !== defaultLocale } : undefined;
}

/**
 * Lista de uma coleção por pasta de idioma (noticias, eventos), uma linha por slug em PT.
 * Cada linha traz a versão do idioma pedido ou, na falta dela, a PT com fallback = true.
 * O filtro (ex.: tirar rascunhos) vale para cada versão: um rascunho em EN não esconde a notícia PT publicada.
 */
export async function getLocalizedList<C extends 'noticias' | 'eventos'>(
  collection: C,
  locale: Locale,
  filter?: (entry: CollectionEntry<C>) => boolean,
) {
  const all = ((await getCollection(collection)) as CollectionEntry<C>[]).filter((e) => !filter || filter(e));
  const pt = all.filter((e) => e.id.startsWith(`${defaultLocale}/`));

  // Tradução sem a versão PT correspondente não aparece em lugar nenhum. Avisa no build.
  const ptSlugs = new Set(pt.map((e) => slugOf(e.id)));
  for (const e of all) {
    if (!e.id.startsWith(`${defaultLocale}/`) && !ptSlugs.has(slugOf(e.id))) {
      console.warn(`[i18n] ${collection}/${e.id} não tem versão em português e não será publicado.`);
    }
  }

  return pt.map((base) => {
    const slug = slugOf(base.id);
    const exact = locale === defaultLocale ? base : all.find((e) => e.id === `${locale}/${slug}`);
    return { slug, entry: exact ?? base, fallback: !exact };
  });
}
