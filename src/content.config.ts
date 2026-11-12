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

export const collections = { noticias };
