# 12. Script de importação de cursos

## O que fazer
- `scripts/importar-cursos.mjs` que lê um CSV (colunas: instituicao, cidade, uf, nivel, modalidade, link) e gera os arquivos da coleção `cursos`.
- Busca lat/lng pela cidade com o Nominatim (1 pedido por segundo, com User-Agent identificando o projeto) e guarda um cache em `scripts/.cache-geo.json`.
- Não sobrescreve arquivos existentes sem `--force`.
- `scripts/exemplo-cursos.csv` com 5 linhas.

## Critérios de aceite
- [ ] `node scripts/importar-cursos.mjs scripts/exemplo-cursos.csv` gera 5 cursos válidos para o schema
- [ ] Rodar duas vezes não duplica nada
