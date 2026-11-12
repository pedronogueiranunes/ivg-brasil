import { config, collection, fields } from '@keystatic/core';

// Modelo de coleção. As outras 11 coleções seguem este padrão
// (ver docs/tarefas/02-colecoes-keystatic.md).
export default config({
  storage: { kind: 'local' },
  ui: { brand: { name: 'IVG Brasil' } },
  collections: {
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
