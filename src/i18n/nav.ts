import type { UIKey } from './ui';
// As 7 seções do sitemap (docs/arquitetura-de-conteudo.md). Slugs iguais nos três idiomas.
export const sections: { slug: string; label: UIKey }[] = [
  { slug: 'sobre', label: 'nav.sobre' },
  { slug: 'pesquisa', label: 'nav.pesquisa' },
  { slug: 'ensino', label: 'nav.ensino' },
  { slug: 'filiacao', label: 'nav.filiacao' },
  { slug: 'rio2030', label: 'nav.rio2030' },
  { slug: 'noticias', label: 'nav.noticias' },
  { slug: 'contato', label: 'nav.contato' },
];
