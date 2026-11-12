# 07. Imagens de compartilhamento (F24, F36)

## Objetivo
Cada notícia, evento e página tem imagem própria quando compartilhada no WhatsApp, Instagram (link na bio), LinkedIn.

## O que fazer
- Gerar PNG 1200x630 no build com `satori` + `@resvg/resvg-js` em `src/pages/og/[...slug].png.ts`.
- Layout simples: título, editoria, logo provisório (texto "IVG Brasil"), cores dos tokens. Fonte carregada do pacote, não da internet.
- Meta tags `og:image`, `og:title`, `og:description`, `twitter:card` em `Base.astro`.
- Botões de compartilhar no fim da notícia: WhatsApp (link `wa.me`), LinkedIn, copiar link. Sem scripts de terceiros.

## Critérios de aceite
- [ ] Imagem gerada para cada notícia nos 3 idiomas
- [ ] Teste no https://www.opengraph.xyz/ mostra a imagem certa
- [ ] Botões funcionam no celular
