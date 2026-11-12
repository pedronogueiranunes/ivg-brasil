# Tarefas de desenvolvimento

Cada arquivo é uma tarefa independente que vira um PR. Ordem sugerida abaixo; tarefas com a mesma letra podem andar em paralelo.

| # | Tarefa | Features | Quem | Depende de |
| --- | --- | --- | --- | --- |
| 02 | Coleções do Keystatic | base | ChatGPT | |
| 03 | Pastas de conteúdo EN/DE e revisão das strings | F01 | ChatGPT | 02 |
| 04 | Aviso de página sem tradução | F01 | ChatGPT | 03 |
| 05 | Busca com Pagefind | F03 | ChatGPT | 02 |
| 06 | Sitemap, robots e hreflang | SEO | ChatGPT | |
| 07 | Imagens de compartilhamento (OG) | F24, F36 | ChatGPT | 02 |
| 08 | Agenda e arquivo .ics | F23 | ChatGPT | 02 |
| 09 | Mapa de cursos (Leaflet) | F12 | ChatGPT | 02, 12 |
| 10 | Linha do tempo dos congressos | F08, F27 | ChatGPT | 02 |
| 11 | 404, privacidade e cookies | F07 | ChatGPT | |
| 12 | Script de importação de cursos (CSV) | F12 | ChatGPT | 02 |
| 13 | Testes no CI: links e acessibilidade | qualidade | ChatGPT | |

Fica com o Pedro e o Claude (não passar para o ChatGPT): layout final com a identidade visual, home, filiação e pagamentos (Asaas/Stripe, Worker, D1), formulários com backend, fórum, migração para Cloudflare e Keystatic Cloud.

Antes de qualquer tarefa, leia `AGENTS.md` na raiz.
