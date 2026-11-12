import { config, collection, singleton, fields } from '@keystatic/core';

// Coleções do painel. As demais seguem este padrão
// (ver docs/tarefas/02-colecoes-keystatic.md). Este schema precisa espelhar src/content.config.ts.

const seo = {
  seoTitulo: fields.text({ label: 'Título para o Google', description: 'Até 65 caracteres. Se ficar vazio, usa o título da página.', validation: { length: { max: 70 } } }),
  seoDescricao: fields.text({ label: 'Descrição para o Google', description: 'Até 160 caracteres. Aparece abaixo do título nos resultados de busca.', multiline: true, validation: { length: { max: 170 } } }),
};
export default config({
  storage: { kind: 'local' },
  ui: { brand: { name: 'IVG Brasil' } },
  singletons: {
    home: singleton({
      label: 'Página inicial',
      path: 'src/content/home/pt',
      format: { data: 'yaml' },
      schema: {
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
        titulo: fields.slug({
          name: { label: 'Título da página (H1)' },
          slug: { label: 'Endereço', description: 'Igual ao nome da seção: sobre, pesquisa, ensino, filiacao, rio2030, contato.' },
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
      },
    }),
    noticias: collection({
      label: 'Notícias',
      slugField: 'titulo',
      path: 'src/content/noticias/pt/*',
      format: { contentField: 'corpo' },
      entryLayout: 'content',
      schema: {
        titulo: fields.slug({ name: { label: 'Título', validation: { length: { min: 5, max: 110 } } } }),
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
      },
    }),
  },
});
