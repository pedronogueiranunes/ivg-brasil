// Imagens de compartilhamento (tarefa 07). Geradas no build em /og/<idioma>/<chave>.png.
import type { Locale } from '@/i18n/ui';

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

/** Caminho da imagem (com a base do staging). Ex.: ogImage('en', 'noticias/meu-slug') → /ivg-brasil/og/en/noticias/meu-slug.png */
export function ogImage(locale: Locale, chave: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/og/${locale}/${chave.replace(/^\/|\/$/g, '')}.png`;
}
