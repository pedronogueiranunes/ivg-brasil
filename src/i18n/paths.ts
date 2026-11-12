import { locales, defaultLocale } from './ui';
/** Para getStaticPaths: undefined = português (sem prefixo), 'en', 'de'. */
export const localeParams = locales.map((l) => ({ params: { locale: l === defaultLocale ? undefined : l } }));
