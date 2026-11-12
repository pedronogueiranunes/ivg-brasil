# 04. Aviso de página sem tradução (F01)

## Objetivo
Quando o conteúdo não existe no idioma escolhido, mostrar o texto em PT com um aviso claro, no idioma do visitante.

## O que fazer
- Componente `src/components/LangNotice.astro` usando a chave `lang.missing`.
- Usar em todas as páginas de detalhe que chamam `getLocalized` (tarefa 03).
- O conteúdo em PT recebe `lang="pt-BR"` no elemento que o envolve.
- O seletor de idioma (`LanguageSwitcher.astro`) continua levando para a mesma página nos outros idiomas.

## Critérios de aceite
- [ ] Aviso aparece só quando há fallback
- [ ] Leitor de tela anuncia o trecho em português com a pronúncia certa (atributo `lang`)
- [ ] Visual discreto, usando tokens existentes
