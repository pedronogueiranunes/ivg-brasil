# API de pings do globo (contrato)

Documento interno. Descreve a API que vai alimentar o modo "Quem passou por aqui" do globo da home. Nada disto está implementado: hoje o modo usa `src/data/globo/pings-exemplo.json`, com dados fictícios, e o botão "Deixar meu ping" está desabilitado.

A implementação fica com o Pedro (Worker + D1 na Cloudflare), depois da migração para o Cloudflare Pages. Este texto serve de referência para o backend, para o formulário no front e para a atualização da página de privacidade.

## Princípios

1. **Nunca guardar coordenada exata.** Latitude e longitude são arredondadas para 0,1 grau no navegador, antes do envio, e de novo no servidor, antes de gravar. O servidor não confia no cliente. Em 0,1 grau o erro fica em torno de 11 km na latitude (e um pouco menos na longitude, conforme a latitude), o que basta para mostrar a cidade sem apontar um endereço.
2. **Ping anônimo não tem dado pessoal.** Se `publico` for `false`, o servidor descarta `nome`, `instituicao`, `papel` e `mensagem` antes de gravar, mesmo que o cliente os envie. Ping anônimo é só um ponto no mapa.
3. **Consentimento explícito (LGPD).** Nenhum ping é gravado sem a caixa de consentimento marcada pela pessoa. O servidor grava a versão do texto aceito e a data.
4. **Não guardar IP.** O IP só é usado para o limite de taxa, na forma de hash com sal que troca todo dia. O hash não fica ligado ao ping.
5. **Localização vem da pessoa.** A posição é escolhida pela pessoa: clique no globo ou botão "Usar minha localização" (API de geolocalização do navegador, só depois do clique). Não usar geolocalização por IP.
6. **Remoção a pedido, sem burocracia.** Quem deixa um ping recebe um código de remoção. Sem o código, a remoção pode ser pedida pelo contato da IVG Brasil informando o identificador do ping.

## Visão geral

| Método | Caminho | Para quê | Quem chama |
| --- | --- | --- | --- |
| `POST` | `/api/pings` | Criar um ping | Formulário do site |
| `GET` | `/api/pings` | Listar pings publicados (só campos públicos) | Globo da home |
| `DELETE` | `/api/pings/:id` | Remover o próprio ping com o código de remoção | Página de remoção |
| `GET` | `/api/admin/pings` | Fila de moderação | Moderação |
| `PATCH` | `/api/admin/pings/:id` | Aprovar, rejeitar ou remover | Moderação |

Todas as respostas são JSON em UTF-8. Erros seguem o formato:

```json
{ "erro": "codigo_curto", "mensagem": "Texto legível em português." }
```

O front traduz `erro` para as três línguas usando chaves em `src/i18n/ui.ts`; `mensagem` serve para depuração.

## POST /api/pings

### Corpo

```json
{
  "lat": -25.4,
  "lng": -49.3,
  "publico": true,
  "nome": "Maria Souza",
  "instituicao": "UFPR",
  "papel": "Professora",
  "mensagem": "Primeira vez no congresso.",
  "consentimento": { "aceito": true, "versao": "2026-11" },
  "idioma": "pt",
  "site": ""
}
```

| Campo | Tipo | Regra |
| --- | --- | --- |
| `lat` | número | Entre -90 e 90. O servidor arredonda para 1 casa decimal. |
| `lng` | número | Entre -180 e 180. O servidor arredonda para 1 casa decimal. |
| `publico` | booleano | Obrigatório. `false` faz o servidor descartar os quatro campos abaixo. |
| `nome` | texto ou `null` | Obrigatório se `publico` for `true`. 2 a 80 caracteres. |
| `instituicao` | texto ou `null` | Opcional. Até 120 caracteres. |
| `papel` | texto ou `null` | Opcional. Até 60 caracteres (ex.: "Professora", "Doutorando"). |
| `mensagem` | texto ou `null` | Opcional. Até 280 caracteres, sem links (rejeita `http`, `www.` e domínios). |
| `consentimento.aceito` | booleano | Precisa ser `true`. |
| `consentimento.versao` | texto | Versão do texto de consentimento mostrado. O servidor só aceita versões conhecidas. |
| `idioma` | `pt`, `en` ou `de` | Idioma em que a pessoa preencheu. Ajuda na moderação. |
| `site` | texto | Honeypot. Campo escondido no formulário (fora da tela, `tabindex="-1"`, `autocomplete="off"`, `aria-hidden="true"`). Tem que chegar vazio. |

Todo texto passa por `trim`, normalização Unicode (NFC) e remoção de caracteres de controle. HTML não é aceito: o servidor guarda texto puro e o front sempre escapa na hora de mostrar (o `Globo.astro` já faz isso com `esc()`).

### Fluxo no servidor

1. Conferir `Content-Type: application/json` e `Origin` igual a uma das origens do site. Fora disso, `415` ou `403`.
2. Limite de taxa (ver abaixo). Estourou, `429`.
3. Honeypot preenchido: responder `201` com um corpo falso e não gravar nada. Assim o robô não aprende que foi pego.
4. Validar campos. Falhou, `422` com o primeiro erro.
5. Se `publico` for `false`, zerar `nome`, `instituicao`, `papel` e `mensagem`.
6. Arredondar `lat` e `lng`.
7. Gerar `id` (ULID ou UUID v7) e um código de remoção aleatório de 128 bits. Gravar só o hash SHA-256 do código.
8. Definir o status inicial:
   - anônimo: `publicado` (só tem coordenada arredondada, risco baixo);
   - público: `pendente` (tem nome e texto, passa pela moderação).
9. Responder `201`.

### Resposta 201

```json
{
  "id": "01JD8Z6K1V3M7Q2T9X4C5B6N8P",
  "status": "pendente",
  "codigoRemocao": "k3Vh9...",
  "lat": -25.4,
  "lng": -49.3
}
```

O `codigoRemocao` aparece uma única vez. O front mostra o código com um botão de copiar e um link pronto para a página de remoção (`/pings/remover/#id=...&codigo=...`, com os dados no fragmento para não irem parar em log de servidor). A resposta traz as coordenadas já arredondadas, para o front mostrar onde o ponto vai ficar.

### Erros

| Código HTTP | `erro` | Quando |
| --- | --- | --- |
| 400 | `json_invalido` | Corpo não é JSON. |
| 403 | `origem_nao_permitida` | `Origin` fora da lista. |
| 415 | `tipo_nao_suportado` | `Content-Type` diferente de JSON. |
| 422 | `consentimento_ausente` | `consentimento.aceito` diferente de `true` ou versão desconhecida. |
| 422 | `coordenada_invalida` | `lat` ou `lng` fora do intervalo ou ausente. |
| 422 | `nome_obrigatorio` | Ping público sem nome. |
| 422 | `campo_longo` | Algum texto acima do limite. |
| 422 | `link_nao_permitido` | Mensagem com link. |
| 429 | `limite_excedido` | Limite de taxa. Vem com `Retry-After`. |
| 500 | `erro_interno` | Qualquer outra falha. Não expor detalhe. |

### Limite de taxa

- Chave: hash SHA-256 de `IP + sal do dia`. O sal troca a cada 24 horas e o anterior é descartado, então não dá para ligar dias diferentes.
- Por chave: 3 pings por hora e 10 por dia.
- Teto global: 500 pings por hora no site todo. Acima disso a API responde `429` para todos e avisa a moderação (protege contra ataque distribuído).
- Pode usar o recurso de limite de taxa do próprio Workers ou uma tabela no D1 (`limites`, abaixo). A tabela é apagada todo dia.
- Se o spam aparecer mesmo assim, o próximo passo é o Cloudflare Turnstile no formulário. Não entra na primeira versão para não pôr desafio na frente de todo mundo.

## GET /api/pings

Lista só pings com status `publicado`.

### Parâmetros

| Parâmetro | Padrão | Regra |
| --- | --- | --- |
| `limite` | 500 | Máximo 2000. |
| `desde` | nenhum | Data ISO (`2030-07-01`). Só pings publicados a partir dela. |

### Resposta 200

```json
{
  "atualizadoEm": "2030-07-15T12:00:00Z",
  "total": 2,
  "pings": [
    {
      "id": "01JD8Z6K1V3M7Q2T9X4C5B6N8P",
      "lat": -25.4,
      "lng": -49.3,
      "publico": true,
      "nome": "Maria Souza",
      "instituicao": "UFPR",
      "papel": "Professora",
      "mensagem": "Primeira vez no congresso.",
      "data": "2030-07-14"
    },
    {
      "id": "01JD8Z7A2B4C6D8E0F1G2H3J4K",
      "lat": -29.7,
      "lng": -51.1,
      "publico": false,
      "nome": null,
      "instituicao": null,
      "papel": null,
      "mensagem": null,
      "data": "2030-07-14"
    }
  ]
}
```

- A data sai só com o dia, sem hora.
- Nunca saem: status, idioma, versão do consentimento, hash do código de remoção, data de moderação, nada ligado ao IP.
- O formato de cada ping é o mesmo de `pings-exemplo.json` sem o campo `exemplo`, para a troca no front ser direta.
- Cabeçalhos: `Cache-Control: public, max-age=300` e CORS só para as origens do site.

## DELETE /api/pings/:id

Para a própria pessoa remover o ping.

- Cabeçalho `Authorization: Bearer <codigoRemocao>`.
- O servidor compara o hash do código com o gravado (comparação em tempo constante).
- Certo: apaga a linha de vez (não é exclusão lógica) e responde `204`.
- Errado ou id inexistente: `404` nos dois casos, para não revelar quais ids existem.
- Mesmo limite de taxa do `POST`.

Remoção sem código: a pessoa escreve para o contato da IVG Brasil com o id do ping ou com o nome e a cidade. A moderação apaga pelo endpoint de administração. Prazo de resposta a definir com o Paulo (a LGPD fala em prazo razoável; sugerimos até 15 dias).

## Moderação

### Quem acessa

As rotas `/api/admin/*` ficam atrás do Cloudflare Access (login por e-mail da equipe). O Worker confere o cabeçalho `Cf-Access-Jwt-Assertion` e recusa com `403` sem ele. Nada de senha própria no Worker.

### GET /api/admin/pings

Parâmetro `status` (`pendente`, `publicado`, `rejeitado`; padrão `pendente`). Devolve todos os campos, menos o hash do código de remoção.

### PATCH /api/admin/pings/:id

```json
{ "status": "publicado" }
```

Valores aceitos: `publicado`, `rejeitado`. Para apagar, `DELETE /api/admin/pings/:id`. Toda ação grava quem fez e quando (e-mail que vem do Access).

### Regras de moderação

- Publicar se o texto é sobre a pessoa e a relação dela com a germanística, o ensino de alemão ou o congresso.
- Rejeitar: propaganda, link disfarçado, ofensa, dado pessoal de terceiros, nome que claramente não é da pessoa.
- Ping rejeitado é apagado em até 7 dias.
- Ping pendente sem moderação em 30 dias é apagado.
- Aviso por e-mail para a moderação quando a fila passar de 20 pendentes (opcional na primeira versão).

## Banco (D1)

```sql
CREATE TABLE pings (
  id              TEXT PRIMARY KEY,
  lat             REAL NOT NULL CHECK (lat BETWEEN -90 AND 90),
  lng             REAL NOT NULL CHECK (lng BETWEEN -180 AND 180),
  publico         INTEGER NOT NULL CHECK (publico IN (0, 1)),
  nome            TEXT,
  instituicao     TEXT,
  papel           TEXT,
  mensagem        TEXT,
  idioma          TEXT NOT NULL CHECK (idioma IN ('pt', 'en', 'de')),
  status          TEXT NOT NULL CHECK (status IN ('pendente', 'publicado', 'rejeitado')),
  consentimento_versao TEXT NOT NULL,
  consentimento_em     TEXT NOT NULL,
  criado_em       TEXT NOT NULL,
  publicado_em    TEXT,
  moderado_por    TEXT,
  moderado_em     TEXT,
  remocao_hash    TEXT NOT NULL,
  -- ping anônimo não pode ter dado pessoal, nem por engano
  CHECK (publico = 1 OR (nome IS NULL AND instituicao IS NULL AND papel IS NULL AND mensagem IS NULL)),
  -- coordenada sempre com no máximo uma casa decimal
  CHECK (lat = round(lat, 1) AND lng = round(lng, 1))
);

CREATE INDEX pings_status_publicado ON pings (status, publicado_em);

CREATE TABLE limites (
  chave      TEXT NOT NULL,   -- hash(IP + sal do dia)
  janela     TEXT NOT NULL,   -- ex.: '2030-07-14T13' para a hora
  contagem   INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (chave, janela)
);
```

As duas restrições `CHECK` da tabela `pings` repetem no banco as regras 1 e 2 dos princípios, para que um erro no Worker não consiga gravar coordenada exata nem dado pessoal em ping anônimo.

Tarefas agendadas (Cron Trigger do Worker, uma vez por dia): apagar `limites` de dias anteriores, apagar rejeitados com mais de 7 dias e pendentes com mais de 30.

## Mudanças no front quando a API existir

- `Globo.astro` passa a buscar `GET /api/pings` quando o modo "Quem passou por aqui" for aberto. Se a API falhar, o modo mostra um aviso curto e a tabela em texto fica vazia com a mesma mensagem. Nada de cair de volta nos dados de exemplo.
- Remover `pings-exemplo.json` e o rótulo "Dado de exemplo" (`globe.ping.example`).
- Formulário "Deixar meu ping" em diálogo acessível (`<dialog>` com foco preso e volta do foco ao botão), com:
  - escolha da posição: clique no globo ou "Usar minha localização"; o ponto mostrado já arredondado;
  - escolha entre ping público e anônimo, com o anônimo como padrão;
  - campos de texto só aparecem no modo público;
  - caixa de consentimento sem marcação prévia, com link para a página de privacidade;
  - honeypot `site`;
  - mensagens de erro ligadas aos campos com `aria-describedby`.
- Página de remoção que lê `id` e `codigo` do fragmento da URL e chama o `DELETE`.
- Todos os textos novos em `src/i18n/ui.ts`, nas três línguas.

## Página de privacidade

Quando a API entrar no ar, a página de privacidade precisa de uma seção sobre os pings dizendo: o que é coletado (posição arredondada e, no ping público, nome, instituição, papel e mensagem), para quê (mostrar no globo), base legal (consentimento), o que não é coletado (posição exata, IP), por quanto tempo fica e como pedir a remoção. A página ainda está como rascunho para revisão jurídica e o e-mail de contato está "a definir".

## Dúvidas para o Pedro e o Paulo

1. Por quanto tempo os pings publicados ficam no ar? Sugestão: até um ano depois do congresso Rio 2030, salvo remoção antes.
2. Quem modera? Precisa de pelo menos duas pessoas com acesso pelo Cloudflare Access.
3. O texto de consentimento precisa de revisão jurídica junto com a página de privacidade. A versão aprovada vira o valor de `consentimento.versao`.
4. O ping anônimo entra publicado direto. Se aparecer abuso (pontos em massa), passa a entrar como pendente também.
5. Contato para pedidos de remoção: qual e-mail?
