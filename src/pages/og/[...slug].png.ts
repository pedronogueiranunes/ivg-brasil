// Imagens de compartilhamento 1200x630 (tarefa 07), geradas no build com satori + resvg.
// Uma por idioma para: imagem padrão do site, cada notícia, índice de notícias e cada página de seção.
// Cores lidas de tokens.css; fonte do pacote @fontsource/source-sans-3 (nada vem da internet).
import type { APIRoute } from 'astro';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import tokensCss from '@/styles/tokens.css?raw';
import { sections } from '@/i18n/nav';
import { locales, defaultLocale, type Locale, type UIKey } from '@/i18n/ui';
import { t } from '@/i18n/utils';
import { getLocalized, getLocalizedList } from '@/lib/content';
import { OG_WIDTH, OG_HEIGHT } from '@/lib/og';

interface Props { titulo: string; rotulo?: string; locale: Locale }

export async function getStaticPaths() {
  const paginas = [...sections.filter((s) => s.slug !== 'noticias'), { slug: 'privacidade', label: 'footer.privacy' as UIKey }];
  const rotas: { params: { slug: string }; props: Props }[] = [];
  for (const l of locales) {
    const tr = t(l);
    rotas.push({ params: { slug: `${l}/padrao` }, props: { titulo: tr('home.title'), locale: l } });
    rotas.push({ params: { slug: `${l}/noticias` }, props: { titulo: tr('nav.noticias'), locale: l } });
    for (const s of paginas) {
      const achada = await getLocalized('paginas', s.slug, l);
      const idioma = achada?.fallback ? defaultLocale : l;
      rotas.push({ params: { slug: `${l}/${s.slug}` }, props: { titulo: achada?.entry.data.titulo ?? tr(s.label), locale: idioma } });
    }
    const noticias = await getLocalizedList('noticias', l, ({ data }) => !data.rascunho);
    for (const { slug, entry, fallback } of noticias) {
      const idioma = fallback ? defaultLocale : l;
      rotas.push({
        params: { slug: `${l}/noticias/${slug}` },
        props: { titulo: entry.data.titulo, rotulo: t(idioma)(`editoria.${entry.data.editoria}` as UIKey), locale: idioma },
      });
    }
  }
  return rotas;
}

const cor = (nome: string) => tokensCss.match(new RegExp(`--color-${nome}:\\s*(#[0-9a-fA-F]{3,8})`))?.[1] ?? '#000000';
const cores = { ink: cor('ink'), muted: cor('ink-muted'), paper: cor('paper'), line: cor('line'), accent: cor('accent') };

const requireLocal = createRequire(join(process.cwd(), 'package.json'));
const fonte = (arquivo: string) => readFileSync(requireLocal.resolve(`@fontsource/source-sans-3/files/${arquivo}`));
let fontes: { name: string; data: Buffer; weight: 400 | 700; style: 'normal' }[] | undefined;
function carregarFontes() {
  fontes ??= (['latin', 'latin-ext'] as const).flatMap((sub) => ([400, 700] as const).map((weight) => ({
    name: 'Source Sans 3', data: fonte(`source-sans-3-${sub}-${weight}-normal.woff`), weight, style: 'normal' as const,
  })));
  return fontes;
}

type No = { type: string; props: Record<string, unknown> };
const el = (type: string, style: Record<string, unknown>, children?: unknown): No => ({ type, props: { style, children } });

export const GET: APIRoute = async ({ props }) => {
  const { titulo, rotulo, locale } = props as Props;
  const tr = t(locale);
  const tamanho = titulo.length > 90 ? 56 : titulo.length > 50 ? 64 : 76;
  const arvore = el('div', {
    width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
    backgroundColor: cores.paper, color: cores.ink, fontFamily: 'Source Sans 3',
  }, [
    el('div', { height: 14, backgroundColor: cores.accent, display: 'flex' }),
    el('div', { flex: 1, display: 'flex', flexDirection: 'column', padding: '64px 80px 60px' }, [
      el('div', { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }, [
        el('div', { fontSize: 38, fontWeight: 700, letterSpacing: '-0.01em' }, tr('site.name')),
        rotulo ? el('div', { fontSize: 28, fontWeight: 700, color: cores.accent }, rotulo) : el('div', { display: 'flex' }),
      ]),
      el('div', { flex: 1, display: 'flex', alignItems: 'center' }, [
        el('div', { fontSize: tamanho, fontWeight: 700, lineHeight: 1.08, letterSpacing: '-0.015em', maxWidth: 1000, display: 'block', lineClamp: 4 }, titulo),
      ]),
      el('div', { display: 'flex', borderTop: `2px solid ${cores.line}`, paddingTop: 24, fontSize: 26, color: cores.muted }, tr('site.tagline')),
    ]),
  ]);
  const svg = await satori(arvore as Parameters<typeof satori>[0], { width: OG_WIDTH, height: OG_HEIGHT, fonts: carregarFontes() });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: OG_WIDTH } }).render().asPng();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
