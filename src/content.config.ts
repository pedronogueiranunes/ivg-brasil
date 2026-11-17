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

// Coleções de dados editadas pelo painel (tarefa 02). Campos de texto opcionais podem vir vazios ('').
const dados = (colecao: string) => glob({ pattern: '**/*.yaml', base: `./src/content/${colecao}` });
const opt = z.string().optional();

const eventos = defineCollection({
  loader: glob({ pattern: '**/*.mdoc', base: './src/content/eventos' }),
  schema: z.object({
    titulo: z.string(),
    dataInicio: z.coerce.date(),
    dataFim: z.coerce.date().nullish(),
    // tarefa 08: HH:MM no fuso America/Sao_Paulo; vazio = dia inteiro.
    horaInicio: z.string().regex(/^(([01]\d|2[0-3]):[0-5]\d)?$/).optional(),
    horaFim: z.string().regex(/^(([01]\d|2[0-3]):[0-5]\d)?$/).optional(),
    local: opt,
    online: z.boolean().default(false),
    link: opt,
    resumo: opt,
    editoria: z.enum(['congresso', 'seminario', 'formacao', 'institucional']),
  }),
});

const pessoas = defineCollection({
  loader: dados('pessoas'),
  schema: z.object({
    nome: z.string(),
    cargo: opt,
    instituicao: opt,
    foto: z.string().nullish(),
    fotoAlt: opt,
    orgao: z.enum(['diretoria', 'comite-deliberativo', 'conselho-fiscal', 'comite-rio2030']),
    ordem: z.number().nullish(),
    lattes: opt,
    email: opt,
  }),
});

const documentos = defineCollection({
  loader: dados('documentos'),
  schema: z.object({
    titulo: z.string(),
    tipo: z.enum(['estatuto', 'ata', 'relatorio', 'outro']),
    idioma: z.enum(['pt', 'en', 'de']),
    data: z.coerce.date(),
    arquivo: z.string().nullish(),
  }),
});

const cursos = defineCollection({
  loader: dados('cursos'),
  schema: z.object({
    instituicao: z.string(),
    cidade: opt,
    uf: z.enum(['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']),
    nivel: z.enum(['graduacao', 'pos']),
    modalidade: z.enum(['presencial', 'ead', 'hibrido']),
    link: opt,
    lat: z.number().nullish(),
    lng: z.number().nullish(),
  }),
});

const grupos = defineCollection({
  loader: dados('grupos'),
  schema: z.object({
    nome: z.string(),
    lider: opt,
    instituicao: opt,
    linhas: z.array(z.string()).default([]),
    link: opt,
  }),
});

const congressos = defineCollection({
  loader: dados('congressos'),
  schema: z.object({
    edicao: z.string(),
    ano: z.number(),
    cidade: opt,
    pais: opt,
    tema: opt,
    link: opt,
    destaque: z.boolean().default(false),
  }),
});

const parceiros = defineCollection({
  loader: dados('parceiros'),
  schema: z.object({
    nome: z.string(),
    logo: z.string().nullish(),
    logoAlt: opt,
    link: opt,
    ordem: z.number().nullish(),
  }),
});

const oportunidades = defineCollection({
  loader: dados('oportunidades'),
  schema: z.object({
    titulo: z.string(),
    tipo: z.enum(['bolsa', 'vaga', 'premio', 'chamada']),
    prazo: z.coerce.date().nullish(),
    link: opt,
    resumo: opt,
  }),
});

const faq = defineCollection({
  loader: glob({ pattern: '**/*.mdoc', base: './src/content/faq' }),
  schema: z.object({
    pergunta: z.string(),
    secao: z.enum(['geral', 'filiacao', 'rio2030', 'ensino']),
    ordem: z.number().nullish(),
  }),
});

const config = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/config' }),
  schema: z.object({
    email: opt,
    instagram: opt,
    facebook: opt,
    linkedin: opt,
    youtube: opt,
    whatsapp: opt,
    numeroMembros: z.number().nullish(),
    dataCongresso: z.coerce.date().nullish(),
  }),
});

export const collections = { noticias, paginas, home, eventos, pessoas, documentos, cursos, grupos, congressos, parceiros, oportunidades, faq, config };
