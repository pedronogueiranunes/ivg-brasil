// Dados estruturados (schema.org) reaproveitados nas páginas.
// Os nomes e links oficiais precisam ser sempre os mesmos, em todas as páginas e idiomas.

export const organization = (siteUrl: string) => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'IVG Brasil',
  alternateName: [
    'Associação Internacional de Germanística, Capítulo Brasileiro',
    'Internationale Vereinigung für Germanistik, Brasilianische Sektion',
  ],
  url: siteUrl,
  parentOrganization: {
    '@type': 'Organization',
    name: 'Internationale Vereinigung für Germanistik (IVG)',
    foundingDate: '1955',
    foundingLocation: 'Roma',
  },
  // sameAs: preencher com Instagram, LinkedIn e Wikidata quando existirem.
});

export const faqPage = (items: { pergunta: string; resposta: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map((i) => ({
    '@type': 'Question',
    name: i.pergunta,
    acceptedAnswer: { '@type': 'Answer', text: i.resposta },
  })),
});
