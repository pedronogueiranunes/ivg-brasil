# 13. Testes no CI: links e acessibilidade

## O que fazer
- No `ci.yml`, depois do build: verificar links internos quebrados em `dist/` (ex.: `linkinator` em modo local).
- Rodar `@axe-core/playwright` na home, numa notícia e na agenda, nos 3 idiomas. Falha o PR com violações sérias ou críticas.
- Script `npm run test` que roda tudo localmente.

## Critérios de aceite
- [ ] Um link quebrado proposital faz o CI falhar
- [ ] Tempo total do CI abaixo de 4 minutos
