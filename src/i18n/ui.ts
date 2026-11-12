// Todo texto de interface mora aqui. Nunca escreva texto direto num componente.
export const locales = ['pt', 'en', 'de'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'pt';

export const localeNames: Record<Locale, string> = { pt: 'Português', en: 'English', de: 'Deutsch' };

export const ui = {
  pt: {
    'site.name': 'IVG Brasil',
    'site.tagline': 'Associação Internacional de Germanística, Capítulo Brasileiro',
    'nav.sobre': 'Sobre', 'nav.pesquisa': 'Pesquisa', 'nav.ensino': 'Ensino', 'nav.filiacao': 'Filiação',
    'nav.rio2030': 'Rio 2030', 'nav.noticias': 'Notícias', 'nav.contato': 'Contato',
    'cta.filiar': 'Filiar-se', 'nav.menu': 'Menu', 'nav.skip': 'Pular para o conteúdo',
    'lang.label': 'Idioma',
    'lang.missing': 'Esta página ainda não foi traduzida. Você está vendo a versão em português.',
    'home.title': 'Germanística no Brasil, rumo ao Rio 2030',
    'home.lead': 'A IVG Brasil reúne pesquisadores, professores e estudantes de alemão e organiza o XVI Congresso Internacional da IVG, no Rio de Janeiro, em 2030.',
    'home.latest': 'Notícias recentes',
    'news.readmore': 'Ler mais', 'news.all': 'Todas as notícias',
    'placeholder.wip': 'Página em construção.',
    'faq.title': 'Perguntas frequentes', 'home.numbersTitle': 'A IVG em números',
    'footer.rights': 'Todos os direitos reservados.',
  },
  en: {
    'site.name': 'IVG Brasil',
    'site.tagline': 'International Association for Germanic Studies, Brazilian Chapter',
    'nav.sobre': 'About', 'nav.pesquisa': 'Research', 'nav.ensino': 'Teaching', 'nav.filiacao': 'Membership',
    'nav.rio2030': 'Rio 2030', 'nav.noticias': 'News', 'nav.contato': 'Contact',
    'cta.filiar': 'Join', 'nav.menu': 'Menu', 'nav.skip': 'Skip to content',
    'lang.label': 'Language',
    'lang.missing': 'This page has not been translated yet. You are viewing the Portuguese version.',
    'home.title': 'Germanic Studies in Brazil, on the way to Rio 2030',
    'home.lead': 'IVG Brasil brings together researchers, teachers and students of German and organizes the XVI International IVG Congress in Rio de Janeiro in 2030.',
    'home.latest': 'Latest news',
    'news.readmore': 'Read more', 'news.all': 'All news',
    'placeholder.wip': 'Page under construction.',
    'faq.title': 'Frequently asked questions', 'home.numbersTitle': 'The IVG in numbers',
    'footer.rights': 'All rights reserved.',
  },
  de: {
    'site.name': 'IVG Brasil',
    'site.tagline': 'Internationale Vereinigung für Germanistik, Brasilianische Sektion',
    'nav.sobre': 'Über uns', 'nav.pesquisa': 'Forschung', 'nav.ensino': 'Lehre', 'nav.filiacao': 'Mitgliedschaft',
    'nav.rio2030': 'Rio 2030', 'nav.noticias': 'Aktuelles', 'nav.contato': 'Kontakt',
    'cta.filiar': 'Mitglied werden', 'nav.menu': 'Menü', 'nav.skip': 'Zum Inhalt springen',
    'lang.label': 'Sprache',
    'lang.missing': 'Diese Seite ist noch nicht übersetzt. Sie sehen die portugiesische Fassung.',
    'home.title': 'Germanistik in Brasilien, auf dem Weg nach Rio 2030',
    'home.lead': 'IVG Brasil vereint Forschende, Lehrkräfte und Studierende der deutschen Sprache und richtet 2030 den XVI. Internationalen IVG-Kongress in Rio de Janeiro aus.',
    'home.latest': 'Aktuelles',
    'news.readmore': 'Weiterlesen', 'news.all': 'Alle Meldungen',
    'placeholder.wip': 'Seite im Aufbau.',
    'faq.title': 'Häufige Fragen', 'home.numbersTitle': 'Die IVG in Zahlen',
    'footer.rights': 'Alle Rechte vorbehalten.',
  },
} as const;

export type UIKey = keyof (typeof ui)['pt'];
