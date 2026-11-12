# IVG Brasil, site institucional

Site da IVG Brasil (Capítulo Brasileiro da Internationale Vereinigung für Germanistik) e do hotsite do XVI Congresso Internacional da IVG, Rio 2030.

- Staging: https://pedronogueiranunes.github.io/ivg-brasil/ (não indexado pelo Google)
- Produção (futuro): ivgbrasil.org, no Cloudflare Pages

## Stack

- Astro 5, site estático, TypeScript
- Keystatic como painel de conteúdo (modo local agora, Keystatic Cloud na produção)
- Conteúdo em Markdoc (`.mdoc`) dentro de `src/content/`
- Idiomas: PT (padrão, sem prefixo), EN (`/en/`) e DE (`/de/`)

## Rodar localmente

```bash
npm install
npm run dev
```

- Site: http://localhost:4321/
- Painel de conteúdo: http://localhost:4321/keystatic/

Em dev o site roda na raiz (`/`) porque o Keystatic não aceita subpasta. No build de staging ele vai para `/ivg-brasil/`. Por isso, links internos sempre passam por `href()` de `src/i18n/utils.ts`, nunca com caminho escrito à mão.

```bash
npm run check   # tipos e erros do Astro
npm run build   # gera dist/
npm run preview # serve o build
```

## Estrutura

```
src/
  components/     Header, Footer, LanguageSwitcher, NewsCard
  layouts/Base.astro
  pages/[...locale]/   todas as páginas, geradas para pt, en e de
  i18n/
    ui.ts         todos os textos de interface nos 3 idiomas
    utils.ts      t(), href(), getLocale(), switchLocale()
    nav.ts        seções do menu
    paths.ts      parâmetros de idioma para getStaticPaths
  content/        conteúdo editável (notícias etc.)
  content.config.ts   schema das coleções (espelha keystatic.config.ts)
  styles/tokens.css   cores, tipos e espaçamentos provisórios
keystatic.config.ts   schema do painel
docs/tarefas/         especificação de cada tarefa de desenvolvimento
```

## Deploy

Todo push na `main` publica o staging pelo GitHub Actions (`.github/workflows/deploy.yml`). Pull requests rodam `check` e `build` (`ci.yml`).

## Como trabalhamos

Cada tarefa em `docs/tarefas/` vira um branch e um pull request. Leia `AGENTS.md` antes de começar.
