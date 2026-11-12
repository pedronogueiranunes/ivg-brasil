# 09. Mapa de cursos de alemão (F12)

## O que fazer
- Página dentro de Pesquisa: `/pesquisa/cursos/`.
- Lista acessível dos cursos (coleção `cursos`), agrupada por UF, sempre visível. O mapa é complemento, não substitui a lista.
- Mapa com Leaflet + tiles do OpenStreetMap, carregado só quando entra na tela (ilha `client:visible`).
- Filtros: UF, nível, modalidade. Os filtros afetam lista e mapa.

## Critérios de aceite
- [ ] Página funciona sem JavaScript (só a lista)
- [ ] Mapa não pesa no carregamento inicial (Lighthouse performance >= 90 no celular)
- [ ] Atribuição do OpenStreetMap visível
