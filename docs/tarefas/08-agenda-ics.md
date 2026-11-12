# 08. Agenda e arquivo .ics (F23)

## O que fazer
- Página `/agenda/` com próximos eventos (coleção `eventos`) e, abaixo, eventos passados recolhidos.
- Eventos passados saem da home automaticamente (regra F48): filtro por `dataFim` no build.
- Para cada evento, um arquivo `/agenda/<slug>.ics` gerado no build (sem biblioteca pesada; o formato é texto).
- Botão "Adicionar ao calendário" com o .ics e link para Google Agenda.
- Fuso horário America/Sao_Paulo.

## Critérios de aceite
- [ ] .ics abre no Google Agenda, Apple Calendar e Outlook com data e hora certas
- [ ] Evento online mostra o link; presencial mostra o local
