# 05. Busca com Pagefind (F03)

## Objetivo
Busca no site inteiro, sem servidor, separada por idioma.

## O que fazer
- Instalar `pagefind` e rodar depois do build (`"build": "astro build && pagefind --site dist"`).
- Página `/busca/` (e `/en/busca/`, `/de/busca/`) com a UI padrão do Pagefind, estilizada com os tokens.
- Atributo `data-pagefind-body` só no conteúdo principal (não indexar header e footer).
- Filtro por idioma via `lang` do `<html>`.
- Link para a busca no Header (ícone com rótulo acessível).

## Critérios de aceite
- [ ] Buscar "Rio" em PT acha a notícia de exemplo
- [ ] Busca em EN não mostra páginas PT
- [ ] Funciona no staging com o `base` `/ivg-brasil/`
