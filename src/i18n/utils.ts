import { ui, defaultLocale, locales, type Locale, type UIKey } from './ui';

export function getLocale(url: URL): Locale {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const path = url.pathname.slice(base.length);
  const first = path.split('/')[1];
  return (locales as readonly string[]).includes(first) ? (first as Locale) : defaultLocale;
}

export function t(locale: Locale) {
  return (key: UIKey): string => ui[locale][key] ?? ui[defaultLocale][key];
}

/** Monta um link interno respeitando idioma e base do staging. */
export function href(locale: Locale, path = ''): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const prefix = locale === defaultLocale ? '' : `/${locale}`;
  const clean = path.replace(/^\/|\/$/g, '');
  return `${base}${prefix}/${clean ? clean + '/' : ''}`;
}

/** Mesma página em outro idioma. */
export function switchLocale(url: URL, to: Locale): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  let path = url.pathname.slice(base.length);
  const from = getLocale(url);
  if (from !== defaultLocale) path = path.replace(new RegExp(`^/${from}`), '');
  return href(to, path);
}
