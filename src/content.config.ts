import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Os arquivos são escritos pelo Keystatic. Este schema precisa espelhar keystatic.config.ts.
const noticias = defineCollection({
  loader: glob({ pattern: '**/*.mdoc', base: './src/content/noticias' }),
  schema: z.object({
    titulo: z.string(),
    resumo: z.string(),
    data: z.coerce.date(),
    editoria: z.enum(['carreira', 'rio2030', 'escolas', 'historia']),
    autor: z.string().optional(),
    imagem: z.string().nullable().optional(),
    imagemAlt: z.string().optional(),
    rascunho: z.boolean().default(false),
  }),
});

const paginas = defineCollection({
  loader: glob({ pattern: '**/*.mdoc', base: './src/content/paginas' }),
  schema: z.object({
    titulo: z.string(),
    intro: z.string().optional(),
    seoTitulo: z.string().optional(),
    seoDescricao: z.string().optional(),
    faq: z.array(z.object({ pergunta: z.string(), resposta: z.string() })).default([]),
  }),
});

const home = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/home' }),
  schema: z.object({
    titulo: z.string(),
    texto: z.string(),
    botao1Texto: z.string(), botao1Link: z.string(),
    botao2Texto: z.string(), botao2Link: z.string(),
    perfisTitulo: z.string(),
    perfis: z.array(z.object({ titulo: z.string(), texto: z.string(), link: z.string() })),
    numeros: z.array(z.object({ valor: z.string(), rotulo: z.string() })),
    filiarTitulo: z.string(), filiarTexto: z.string(), filiarBotao: z.string(),
    seoTitulo: z.string().optional(),
    seoDescricao: z.string().optional(),
  }),
});

export const collections = { noticias, paginas, home };
