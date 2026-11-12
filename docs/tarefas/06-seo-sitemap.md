# 06. Sitemap, robots e hreflang

## O que fazer
- Instalar `@astrojs/sitemap` com i18n configurado (pt-BR, en, de).
- `robots.txt` gerado por `src/pages/robots.txt.ts`: no staging (`BASE_PATH` = `/ivg-brasil`) bloqueia tudo; na produção libera e aponta o sitemap.
- Conferir que `Base.astro` já gera `hreflang` e `x-default` (PT) corretos e `canonical`.
- Meta `description` por página vinda do conteúdo (`resumo`).

## Critérios de aceite
- [ ] `dist/sitemap-index.xml` existe e lista as 3 versões de cada página
- [ ] Staging continua com `noindex`
- [ ] Validação sem erro em https://validator.w3.org/ para a home
