# Regras para agentes (ChatGPT/Codex, Claude) e colaboradores

Leia este arquivo inteiro antes de qualquer mudança.

## Fluxo

1. Uma tarefa por branch, um pull request por tarefa. Branch: `tarefa/NN-nome-curto`.
2. A especificação está em `docs/tarefas/NN-*.md`. Siga os critérios de aceite dela. Se algo não estiver claro, escreva a dúvida na descrição do PR em vez de inventar.
3. Antes de abrir o PR: `npm run check` e `npm run build` precisam passar sem erro.
4. Não faça merge. O Pedro (ou o Claude, a pedido dele) revisa e faz o merge.
5. Não mexa em arquivos fora do escopo da tarefa. Refatorações "aproveitando" ficam para outro PR.

## Não toque

- `astro.config.mjs` (base, site, i18n), a menos que a tarefa peça.
- `.github/workflows/`
- Qualquer coisa de pagamento, formulários com backend, Workers, D1, chaves ou segredos. Essas partes são feitas pelo Pedro.
- `src/styles/tokens.css`: os tokens são provisórios e vão mudar com a identidade visual. Use as variáveis existentes; não crie cores ou fontes novas.

## Código

- Astro + TypeScript estrito. Componentes `.astro` sempre que der; React só para ilhas interativas de verdade.
- Sem frameworks de CSS (nada de Tailwind). CSS com escopo no próprio componente, usando `var(--...)` de `tokens.css`.
- `getStaticPaths` sempre na forma de função:
  ```ts
  export function getStaticPaths() { return localeParams; }
  ```
  A forma `export const getStaticPaths = () => ...` quebra o build.
- Links internos: sempre `href(locale, '/caminho/')`. Nunca escreva `/ivg-brasil/` nem `/en/` à mão.
- `trailingSlash` é `always` no build: todo link interno termina com `/`.

## Idiomas

- Todo texto de interface (botões, rótulos, mensagens) vai em `src/i18n/ui.ts`, nas três línguas. Nada de texto solto no componente.
- PT é a referência. Tradução EN e DE pode ser feita por IA; marque no PR que precisa de revisão do Prof. Paulo.
- Página sem tradução mostra o aviso `lang.missing` e o conteúdo em PT. Nunca deixe uma página em branco.

## Conteúdo e Keystatic

- O schema existe em dois lugares e eles têm que bater: `keystatic.config.ts` (painel) e `src/content.config.ts` (zod). Mudou um, mude o outro no mesmo PR.
- Conteúdo de exemplo deve ser claramente marcado como exemplo.
- Imagens enviadas pelo painel vão para `public/uploads/<coleção>/`.

## Acessibilidade (obrigatório)

- HTML semântico, um `h1` por página, ordem de títulos sem pulos.
- Tudo funciona com teclado e tem foco visível.
- Imagens com `alt` (vazio só se decorativa).
- Contraste AA. Respeite `prefers-reduced-motion`.

## Texto

- Português do Brasil, tom institucional e direto. Sem travessão (—), sem frases de efeito genéricas.
