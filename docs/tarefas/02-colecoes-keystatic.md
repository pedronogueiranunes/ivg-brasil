# 02. Coleções do Keystatic

## Objetivo
Criar todas as coleções de conteúdo que a equipe vai editar pelo painel, seguindo o modelo de `noticias`.

## Coleções
Para cada uma: definir em `keystatic.config.ts`, espelhar em `src/content.config.ts` (zod), criar 1 ou 2 itens de exemplo marcados como exemplo.

| Coleção | Tipo | Campos principais |
| --- | --- | --- |
| `paginas` | collection | titulo, slug, resumo, corpo (markdoc), secao (select: sobre, pesquisa, ensino, filiacao, rio2030, contato) |
| `eventos` | collection | titulo, dataInicio, dataFim, local, online (checkbox), link, resumo, corpo, editoria |
| `pessoas` | collection | nome, cargo, instituicao, foto, fotoAlt, orgao (select: diretoria, comite-deliberativo, conselho-fiscal, comite-rio2030), ordem, lattes, email |
| `documentos` | collection | titulo, tipo (estatuto, ata, relatorio, outro), idioma, data, arquivo (file em public/uploads/documentos) |
| `cursos` | collection | instituicao, cidade, uf, nivel (graduacao, pos), modalidade, link, lat, lng |
| `grupos` | collection | nome, lider, instituicao, linhas (array de texto), link |
| `congressos` | collection | ano, cidade, pais, tema, link, destaque (checkbox) |
| `parceiros` | collection | nome, logo, logoAlt, link, ordem |
| `oportunidades` | collection | titulo, tipo (bolsa, vaga, premio, chamada), prazo, link, resumo |
| `faq` | collection | pergunta, resposta (markdoc), secao, ordem |
| `config` | singleton | email de contato, redes sociais, número de membros, data do congresso |

Conteúdo em PT fica em `src/content/<colecao>/pt/`. As pastas `en` e `de` são criadas na tarefa 03.

## Critérios de aceite
- [ ] Todas as coleções aparecem e salvam pelo painel em `npm run dev`
- [ ] `getCollection('<nome>')` funciona em uma página de teste para cada coleção
- [ ] Schemas do Keystatic e do zod batem campo a campo
- [ ] Rótulos do painel em português, com `description` curta nos campos que não são óbvios
- [ ] `check` e `build` passam
