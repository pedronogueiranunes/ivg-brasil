import { config, collection, singleton, fields } from '@keystatic/core';

// Coleções do painel. As demais seguem este padrão
// (ver docs/tarefas/02-colecoes-keystatic.md). Este schema precisa espelhar src/content.config.ts.

const seo = {
  seoTitulo: fields.text({ label: 'Título para o Google', description: 'Até 65 caracteres. Se ficar vazio, usa o título da página.', validation: { length: { max: 70 } } }),
  seoDescricao: fields.text({ label: 'Descrição para o Google', description: 'Até 160 caracteres. Aparece abaixo do título nos resultados de busca.', multiline: true, validation: { length: { max: 170 } } }),
};

const UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];
const ufOptions = UFS.map((uf) => ({ label: uf, value: uf }));

// Idiomas além do português. O mesmo schema vale para os três (src/content.config.ts não muda).
// Cada item traduzido usa o mesmo endereço (nome do arquivo) da versão em português.
const traducoes = [
  { lang: 'en', rotulo: 'EN' },
  { lang: 'de', rotulo: 'DE' },
] as const;
const enderecoTraduzido = { label: 'Endereço', description: 'Tem que ser igual ao da versão em português.' };

const homeSchema = () => ({
    titulo: fields.text({ label: 'Título principal' }),
    texto: fields.text({ label: 'Texto de abertura', multiline: true }),
    botao1Texto: fields.text({ label: 'Botão 1: texto' }),
    botao1Link: fields.text({ label: 'Botão 1: seção', description: 'Ex.: sobre, rio2030' }),
    botao2Texto: fields.text({ label: 'Botão 2: texto' }),
    botao2Link: fields.text({ label: 'Botão 2: seção' }),
    perfisTitulo: fields.text({ label: 'Atalhos por perfil: título' }),
    perfis: fields.array(
      fields.object({
        titulo: fields.text({ label: 'Perfil' }),
        texto: fields.text({ label: 'Chamada', multiline: true }),
        link: fields.text({ label: 'Leva para (seção)' }),
      }),
      { label: 'Atalhos por perfil', itemLabel: (p) => p.fields.titulo.value },
    ),
    numeros: fields.array(
      fields.object({ valor: fields.text({ label: 'Número' }), rotulo: fields.text({ label: 'Legenda' }) }),
      { label: 'Números', itemLabel: (p) => p.fields.valor.value },
    ),
    filiarTitulo: fields.text({ label: 'Chamada final: título' }),
    filiarTexto: fields.text({ label: 'Chamada final: texto', multiline: true }),
    filiarBotao: fields.text({ label: 'Chamada final: botão' }),
    ...seo,
});

const paginasSchema = (traduzido: boolean) => ({
    titulo: fields.slug({
      name: { label: 'Título da página (H1)' },
      slug: { label: 'Endereço', description: traduzido ? 'Tem que ser igual ao da versão em português.' : 'Igual ao nome da seção: sobre, pesquisa, ensino, filiacao, rio2030, contato.' },
    }),
    intro: fields.text({ label: 'Frase de abertura', description: 'A primeira frase da página. Diga o que é, com o nome completo da entidade.', multiline: true }),
    ...seo,
    faq: fields.array(
      fields.object({
        pergunta: fields.text({ label: 'Pergunta' }),
        resposta: fields.text({ label: 'Resposta', description: '2 a 3 frases que façam sentido sozinhas.', multiline: true }),
      }),
      { label: 'Perguntas frequentes', itemLabel: (p) => p.fields.pergunta.value },
    ),
    corpo: fields.markdoc({ label: 'Texto' }),
});

const noticiasSchema = (traduzido: boolean) => ({
    titulo: fields.slug({ name: { label: 'Título', validation: { length: { min: 5, max: 110 } } }, ...(traduzido ? { slug: enderecoTraduzido } : {}) }),
    resumo: fields.text({ label: 'Resumo', description: 'Duas linhas. Aparece nos cards e no compartilhamento.', multiline: true, validation: { length: { min: 20, max: 220 } } }),
    data: fields.date({ label: 'Data de publicação', validation: { isRequired: true } }),
    editoria: fields.select({
      label: 'Editoria',
      options: [
        { label: 'Carreira em Germanística', value: 'carreira' },
        { label: 'Rumo ao Rio 2030', value: 'rio2030' },
        { label: 'Alemão nas Escolas Públicas', value: 'escolas' },
        { label: 'História e Ciência', value: 'historia' },
      ],
      defaultValue: 'historia',
    }),
    autor: fields.text({ label: 'Autor' }),
    imagem: fields.image({ label: 'Imagem de capa', directory: 'public/uploads/noticias', publicPath: '/uploads/noticias/' }),
    imagemAlt: fields.text({ label: 'Descrição da imagem (acessibilidade)' }),
    rascunho: fields.checkbox({ label: 'Rascunho', description: 'Rascunhos não aparecem no site.', defaultValue: true }),
    corpo: fields.markdoc({ label: 'Texto' }),
});

const eventosSchema = (traduzido: boolean) => ({
    titulo: fields.slug({ name: { label: 'Nome do evento' }, ...(traduzido ? { slug: enderecoTraduzido } : {}) }),
    dataInicio: fields.date({ label: 'Data de início', validation: { isRequired: true } }),
    dataFim: fields.date({ label: 'Data de término', description: 'Deixe vazio se o evento durar um dia.' }),
    local: fields.text({ label: 'Local', description: 'Cidade e instituição. Para evento online, escreva Online.' }),
    online: fields.checkbox({ label: 'Evento online', defaultValue: false }),
    link: fields.url({ label: 'Link do evento ou da inscrição' }),
    resumo: fields.text({ label: 'Resumo', description: 'Duas linhas. Aparece na agenda.', multiline: true }),
    editoria: fields.select({
      label: 'Tipo',
      options: [
        { label: 'Congresso', value: 'congresso' },
        { label: 'Seminário ou simpósio', value: 'seminario' },
        { label: 'Curso ou formação', value: 'formacao' },
        { label: 'Reunião institucional', value: 'institucional' },
      ],
      defaultValue: 'seminario',
    }),
    corpo: fields.markdoc({ label: 'Descrição completa' }),
});

export default config({
  storage: { kind: 'local' },
  ui: { brand: { name: 'IVG Brasil' } },
  singletons: {
    home: singleton({
      label: 'Página inicial',
      path: 'src/content/home/pt',
      format: { data: 'yaml' },
      schema: {
        ...homeSchema(),
      },
    }),
    ...Object.fromEntries(traducoes.map(({ lang, rotulo }) => [`home_${lang}`, singleton({
      label: `Página inicial (${rotulo})`,
      path: `src/content/home/${lang}`,
      format: { data: 'yaml' },
      schema: homeSchema(),
    })])),
    config: singleton({
      label: 'Dados gerais do site',
      path: 'src/content/config/pt',
      format: { data: 'yaml' },
      schema: {
        email: fields.text({ label: 'E-mail de contato', description: 'Aparece no rodapé e na página de contato.' }),
        instagram: fields.text({ label: 'Instagram', description: 'Endereço completo do perfil.' }),
        facebook: fields.text({ label: 'Facebook', description: 'Endereço completo da página.' }),
        linkedin: fields.text({ label: 'LinkedIn', description: 'Endereço completo da página.' }),
        youtube: fields.text({ label: 'YouTube', description: 'Endereço completo do canal.' }),
        whatsapp: fields.text({ label: 'WhatsApp', description: 'Endereço do grupo ou da comunidade, se houver.' }),
        numeroMembros: fields.integer({ label: 'Número de membros', description: 'Usado nos números da página inicial.' }),
        dataCongresso: fields.date({ label: 'Data do congresso Rio 2030', description: 'Deixe vazio até a data ser confirmada.' }),
      },
    }),
  },
  collections: {
    paginas: collection({
      label: 'Páginas das seções',
      slugField: 'titulo',
      path: 'src/content/paginas/pt/*',
      format: { contentField: 'corpo' },
      entryLayout: 'content',
      schema: {
        ...paginasSchema(false),
      },
    }),
    noticias: collection({
      label: 'Notícias',
      slugField: 'titulo',
      path: 'src/content/noticias/pt/*',
      format: { contentField: 'corpo' },
      entryLayout: 'content',
      schema: {
        ...noticiasSchema(false),
      },
    }),
    eventos: collection({
      label: 'Eventos',
      slugField: 'titulo',
      path: 'src/content/eventos/pt/*',
      format: { contentField: 'corpo' },
      entryLayout: 'content',
      schema: {
        ...eventosSchema(false),
      },
    }),
    pessoas: collection({
      label: 'Pessoas (governança)',
      slugField: 'nome',
      path: 'src/content/pessoas/pt/*',
      format: { data: 'yaml' },
      schema: {
        nome: fields.slug({ name: { label: 'Nome' } }),
        cargo: fields.text({ label: 'Cargo', description: 'Ex.: Presidente, Tesoureira.' }),
        instituicao: fields.text({ label: 'Instituição' }),
        foto: fields.image({ label: 'Foto', directory: 'public/uploads/pessoas', publicPath: '/uploads/pessoas/' }),
        fotoAlt: fields.text({ label: 'Descrição da foto (acessibilidade)' }),
        orgao: fields.select({
          label: 'Órgão',
          options: [
            { label: 'Diretoria', value: 'diretoria' },
            { label: 'Comitê Deliberativo', value: 'comite-deliberativo' },
            { label: 'Conselho Fiscal', value: 'conselho-fiscal' },
            { label: 'Comitê Organizador Rio 2030', value: 'comite-rio2030' },
          ],
          defaultValue: 'diretoria',
        }),
        ordem: fields.integer({ label: 'Ordem de exibição', description: 'Menor número aparece primeiro.', defaultValue: 100 }),
        lattes: fields.url({ label: 'Currículo Lattes' }),
        email: fields.text({ label: 'E-mail público', description: 'Deixe vazio se a pessoa não quiser divulgar.' }),
      },
    }),
    documentos: collection({
      label: 'Documentos',
      slugField: 'titulo',
      path: 'src/content/documentos/pt/*',
      format: { data: 'yaml' },
      schema: {
        titulo: fields.slug({ name: { label: 'Título' } }),
        tipo: fields.select({
          label: 'Tipo',
          options: [
            { label: 'Estatuto', value: 'estatuto' },
            { label: 'Ata', value: 'ata' },
            { label: 'Relatório', value: 'relatorio' },
            { label: 'Outro', value: 'outro' },
          ],
          defaultValue: 'outro',
        }),
        idioma: fields.select({
          label: 'Idioma do documento',
          options: [
            { label: 'Português', value: 'pt' },
            { label: 'Inglês', value: 'en' },
            { label: 'Alemão', value: 'de' },
          ],
          defaultValue: 'pt',
        }),
        data: fields.date({ label: 'Data do documento', validation: { isRequired: true } }),
        arquivo: fields.file({ label: 'Arquivo (PDF)', directory: 'public/uploads/documentos', publicPath: '/uploads/documentos/' }),
      },
    }),
    cursos: collection({
      label: 'Cursos de alemão e Letras',
      slugField: 'instituicao',
      path: 'src/content/cursos/pt/*',
      format: { data: 'yaml' },
      schema: {
        instituicao: fields.slug({
          name: {
            label: 'Instituição',
            description: 'Se a mesma instituição tiver graduação e pós, acrescente o nível: UFPR graduação.',
          },
        }),
        cidade: fields.text({ label: 'Cidade' }),
        uf: fields.select({ label: 'Estado', options: ufOptions, defaultValue: 'PR' }),
        nivel: fields.select({
          label: 'Nível',
          options: [
            { label: 'Graduação', value: 'graduacao' },
            { label: 'Pós-graduação', value: 'pos' },
          ],
          defaultValue: 'graduacao',
        }),
        modalidade: fields.select({
          label: 'Modalidade',
          options: [
            { label: 'Presencial', value: 'presencial' },
            { label: 'A distância', value: 'ead' },
            { label: 'Híbrido', value: 'hibrido' },
          ],
          defaultValue: 'presencial',
        }),
        link: fields.url({ label: 'Página do curso' }),
        lat: fields.number({ label: 'Latitude', description: 'Usada no mapa. Ex.: -25.4284' }),
        lng: fields.number({ label: 'Longitude', description: 'Usada no mapa. Ex.: -49.2733' }),
      },
    }),
    grupos: collection({
      label: 'Grupos de pesquisa',
      slugField: 'nome',
      path: 'src/content/grupos/pt/*',
      format: { data: 'yaml' },
      schema: {
        nome: fields.slug({ name: { label: 'Nome do grupo' } }),
        lider: fields.text({ label: 'Líder' }),
        instituicao: fields.text({ label: 'Instituição' }),
        linhas: fields.array(fields.text({ label: 'Linha de pesquisa' }), {
          label: 'Linhas de pesquisa',
          itemLabel: (p) => p.value,
        }),
        link: fields.url({ label: 'Página do grupo ou do CNPq' }),
      },
    }),
    congressos: collection({
      label: 'Congressos',
      slugField: 'edicao',
      path: 'src/content/congressos/pt/*',
      format: { data: 'yaml' },
      schema: {
        edicao: fields.slug({
          name: { label: 'Edição', description: 'Ex.: XVI Congresso Internacional da IVG, Rio de Janeiro 2030.' },
        }),
        ano: fields.integer({ label: 'Ano', validation: { isRequired: true, min: 1950, max: 2100 } }),
        cidade: fields.text({ label: 'Cidade' }),
        pais: fields.text({ label: 'País' }),
        tema: fields.text({ label: 'Tema', multiline: true }),
        link: fields.url({ label: 'Site do congresso' }),
        destaque: fields.checkbox({ label: 'Destacar na linha do tempo', defaultValue: false }),
      },
    }),
    parceiros: collection({
      label: 'Parceiros',
      slugField: 'nome',
      path: 'src/content/parceiros/pt/*',
      format: { data: 'yaml' },
      schema: {
        nome: fields.slug({ name: { label: 'Nome da organização' } }),
        logo: fields.image({ label: 'Logo', directory: 'public/uploads/parceiros', publicPath: '/uploads/parceiros/' }),
        logoAlt: fields.text({ label: 'Descrição do logo (acessibilidade)', description: 'Normalmente o nome da organização.' }),
        link: fields.url({ label: 'Site da organização' }),
        ordem: fields.integer({ label: 'Ordem de exibição', description: 'Menor número aparece primeiro.', defaultValue: 100 }),
      },
    }),
    oportunidades: collection({
      label: 'Oportunidades',
      slugField: 'titulo',
      path: 'src/content/oportunidades/pt/*',
      format: { data: 'yaml' },
      schema: {
        titulo: fields.slug({ name: { label: 'Título' } }),
        tipo: fields.select({
          label: 'Tipo',
          options: [
            { label: 'Bolsa', value: 'bolsa' },
            { label: 'Vaga', value: 'vaga' },
            { label: 'Prêmio', value: 'premio' },
            { label: 'Chamada de trabalhos', value: 'chamada' },
          ],
          defaultValue: 'chamada',
        }),
        prazo: fields.date({ label: 'Prazo', description: 'Último dia para participar.' }),
        link: fields.url({ label: 'Link' }),
        resumo: fields.text({ label: 'Resumo', multiline: true }),
      },
    }),
    faq: collection({
      label: 'Perguntas frequentes',
      slugField: 'pergunta',
      path: 'src/content/faq/pt/*',
      format: { contentField: 'resposta' },
      entryLayout: 'content',
      schema: {
        pergunta: fields.slug({ name: { label: 'Pergunta' } }),
        secao: fields.select({
          label: 'Seção',
          options: [
            { label: 'Geral', value: 'geral' },
            { label: 'Filiação', value: 'filiacao' },
            { label: 'Rio 2030', value: 'rio2030' },
            { label: 'Ensino', value: 'ensino' },
          ],
          defaultValue: 'geral',
        }),
        ordem: fields.integer({ label: 'Ordem dentro da seção', defaultValue: 100 }),
        resposta: fields.markdoc({ label: 'Resposta', description: '2 a 3 frases que façam sentido sozinhas.' }),
      },
    }),
    // Versões em EN e DE de páginas, notícias e eventos (tarefa 03). Mesmo schema, outra pasta.
    ...Object.fromEntries(traducoes.flatMap(({ lang, rotulo }) => [
      [`paginas_${lang}`, collection({
        label: `Páginas das seções (${rotulo})`,
        slugField: 'titulo',
        path: `src/content/paginas/${lang}/*`,
        format: { contentField: 'corpo' },
        entryLayout: 'content',
        schema: paginasSchema(true),
      })],
      [`noticias_${lang}`, collection({
        label: `Notícias (${rotulo})`,
        slugField: 'titulo',
        path: `src/content/noticias/${lang}/*`,
        format: { contentField: 'corpo' },
        entryLayout: 'content',
        schema: noticiasSchema(true),
      })],
      [`eventos_${lang}`, collection({
        label: `Eventos (${rotulo})`,
        slugField: 'titulo',
        path: `src/content/eventos/${lang}/*`,
        format: { contentField: 'corpo' },
        entryLayout: 'content',
        schema: eventosSchema(true),
      })],
    ])),
  },
});
