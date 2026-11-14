# Migração para Cloudflare Pages + Keystatic Cloud

Documento interno do Pedro. O código já está preparado no branch `infra/cloudflare-keystatic-cloud`; faltam as contas e as variáveis.

## Como funciona

- O site continua 100% estático. Só as rotas do painel (`/keystatic` e `/api/keystatic`) rodam em servidor, pelo adaptador `@astrojs/cloudflare`.
- O modo Cloudflare liga sozinho quando o build roda no Cloudflare Pages (`CF_PAGES=1`). Nesse modo o site fica na raiz (sem `/ivg-brasil`).
- O staging do GitHub Pages não muda: o workflow e o build dele seguem iguais.
- O painel usa Keystatic Cloud quando existe a variável `PUBLIC_KEYSTATIC_CLOUD_PROJECT`. Sem ela, volta para o modo local (`npm run dev`).
- Quando alguém salva no painel, o Keystatic Cloud grava um commit no GitHub e o Cloudflare Pages publica de novo.

## O que o Pedro precisa criar (no e-mail da IVG Brasil)

1. Conta na Cloudflare (plano gratuito basta).
2. Conta no Keystatic Cloud (keystatic.cloud), com uma equipe e um projeto ligado ao repositório `pedronogueiranunes/ivg-brasil`. Anotar o nome no formato `equipe/projeto`.
3. Convidar a equipe no Keystatic Cloud. Grátis até 3 usuários; Pro custa US$ 10 por mês mais US$ 5 por usuário extra.

## Passos no Cloudflare Pages

1. Workers & Pages, Create, Pages, Connect to Git, escolher `ivg-brasil`.
2. Branch de produção: `main` (ou um branch `producao`, se quiser separar do staging).
3. Comando de build: `npm run build`. Pasta de saída: `dist`.
4. Variáveis de ambiente (Production e Preview):
   - `NODE_VERSION` = `22`
   - `SITE_URL` = `https://ivgbrasil.org` (ou a URL `*.pages.dev` enquanto não houver domínio)
   - `PUBLIC_KEYSTATIC_CLOUD_PROJECT` = `equipe/projeto`
5. Domínio próprio: adicionar `ivgbrasil.org` em Custom domains quando o Paulo confirmar o domínio.

## Pontos para conferir no primeiro deploy

- Abrir `/keystatic` na URL do Pages, entrar com a conta do Keystatic Cloud e editar uma página de teste.
- Confirmar que o commit chegou ao GitHub e que o site republicou.
- O `staging` do GitHub Pages também roda a cada push na `main`. Se o painel gravar na `main`, os dois publicam. Decidir se o staging continua ou se passa a ouvir outro branch.
- Fotos enviadas pelo painel vão para `public/uploads/<coleção>/` e entram no repositório.
- Não trocar a versão do `@keystatic/astro` (fica em 5.2.0).
- Conferir na documentação do Keystatic Cloud se o plano gratuito exige algum token adicional no Cloudflare. Eu não consegui testar o login daqui, por não ter as contas.
