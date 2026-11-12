# 03. Conteúdo em EN e DE e revisão das strings

## Objetivo
Permitir versões EN e DE de cada item de conteúdo e completar as traduções da interface.

## O que fazer
- Para `noticias`, `paginas` e `eventos`: aceitar arquivos em `src/content/<colecao>/{pt,en,de}/<slug>.mdoc`, com o mesmo slug nos três idiomas.
- No Keystatic, criar coleções separadas por idioma (ex.: `noticias_en`, rótulo "Notícias (EN)") apontando para a pasta do idioma. Mesmo schema.
- Criar `src/i18n/content.ts` com `getLocalized(collection, slug, locale)`: devolve a versão do idioma pedido ou a PT com uma flag `fallback: true`.
- Revisar `src/i18n/ui.ts`: toda chave tem PT, EN e DE. Adicionar chaves que faltarem para as tarefas seguintes.

## Critérios de aceite
- [ ] Uma notícia de exemplo existe em PT e EN; em `/en/noticias/<slug>/` aparece a versão EN
- [ ] A mesma notícia em `/de/...` aparece em PT com `fallback: true`
- [ ] PR marca que as traduções precisam de revisão do Prof. Paulo
