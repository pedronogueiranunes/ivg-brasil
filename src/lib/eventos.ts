// Agenda (tarefa 08): datas, filtro de eventos passados, arquivo .ics e link do Google Agenda.
// As datas do Keystatic chegam como meia-noite UTC; por isso toda conta e formatação usa UTC,
// e os horários (horaInicio, horaFim) são sempre do fuso America/Sao_Paulo.
import type { CollectionEntry } from 'astro:content';
import { getLocalizedList } from '@/lib/content';
import type { Locale } from '@/i18n/ui';

export const FUSO = 'America/Sao_Paulo';
type Evento = CollectionEntry<'eventos'>;

const iso = (d: Date) => d.toISOString().slice(0, 10);
/** Data de hoje (AAAA-MM-DD) no fuso de Brasília, no momento do build. */
export const hojeEmBrasilia = () => new Intl.DateTimeFormat('en-CA', { timeZone: FUSO }).format(new Date());
/** Último dia do evento: dataFim ou, sem ela, dataInicio. */
export const ultimoDia = (e: Evento) => e.data.dataFim ?? e.data.dataInicio;
/** Regra F48: o evento sai das listas de próximos depois do último dia. Vale no build. */
export const jaTerminou = (e: Evento, hoje = hojeEmBrasilia()) => iso(ultimoDia(e)) < hoje;

/** Eventos do idioma (com fallback PT), separados em próximos (mais cedo primeiro) e passados (mais recente primeiro). */
export async function agenda(locale: Locale) {
  const todos = await getLocalizedList('eventos', locale);
  const hoje = hojeEmBrasilia();
  const proximos = todos.filter((i) => !jaTerminou(i.entry, hoje))
    .sort((a, b) => a.entry.data.dataInicio.valueOf() - b.entry.data.dataInicio.valueOf());
  const passados = todos.filter((i) => jaTerminou(i.entry, hoje))
    .sort((a, b) => ultimoDia(b.entry).valueOf() - ultimoDia(a.entry).valueOf());
  return { proximos, passados };
}

/** "12 – 14 de maio de 2027" ou "12 de maio de 2027". */
export function periodo(e: Evento, locale: string) {
  const f = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  const { dataInicio, dataFim } = e.data;
  return dataFim && iso(dataFim) !== iso(dataInicio) ? f.formatRange(dataInicio, dataFim) : f.format(dataInicio);
}

/** Início e fim em horário local de Brasília, como texto AAAAMMDDTHHMMSS, ou datas de dia inteiro (fim exclusivo). */
function intervalo(e: Evento) {
  const { dataInicio, horaInicio, horaFim } = e.data;
  const compacta = (d: Date) => iso(d).replace(/-/g, '');
  if (!horaInicio) {
    const depois = new Date(ultimoDia(e).valueOf() + 86_400_000);
    return { diaInteiro: true, inicio: compacta(dataInicio), fim: compacta(depois) };
  }
  // Conta feita em UTC só como relógio "ingênuo"; o fuso real entra pelo TZID.
  const comHora = (d: Date, hhmm: string) => new Date(`${iso(d)}T${hhmm}:00Z`);
  const inicio = comHora(dataInicio, horaInicio);
  const fim = horaFim ? comHora(ultimoDia(e), horaFim) : new Date(inicio.valueOf() + 3_600_000);
  const texto = (d: Date) => d.toISOString().slice(0, 19).replace(/[-:]/g, '');
  return { diaInteiro: false, inicio: texto(inicio), fim: texto(fim > inicio ? fim : new Date(inicio.valueOf() + 3_600_000)) };
}

/** Horário de início e, se houver, de término, para exibir na agenda. */
export const horario = (e: Evento) => (e.data.horaInicio ? { inicio: e.data.horaInicio, fim: e.data.horaFim || undefined } : undefined);

const local = (e: Evento) => (e.data.online ? 'Online' : e.data.local ?? '');
const descricao = (e: Evento) => [e.data.resumo, e.data.link].filter(Boolean).join('\n\n');

/** Link "adicionar" do Google Agenda, no fuso de Brasília. */
export function googleAgenda(e: Evento) {
  const { inicio, fim } = intervalo(e);
  const p = new URLSearchParams({ action: 'TEMPLATE', text: e.data.titulo, dates: `${inicio}/${fim}`, ctz: FUSO });
  if (descricao(e)) p.set('details', descricao(e));
  if (local(e)) p.set('location', local(e));
  return `https://calendar.google.com/calendar/render?${p}`;
}

// Formato iCalendar (RFC 5545): CRLF, texto escapado, linhas dobradas em 75 bytes.
const escapar = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
function dobrar(linha: string) {
  const bytes = new TextEncoder();
  const partes: string[] = [];
  let atual = '';
  for (const c of linha) {
    if (bytes.encode(atual + c).length > (partes.length ? 74 : 75)) { partes.push(atual); atual = ''; }
    atual += c;
  }
  partes.push(atual);
  return partes.join('\r\n ');
}

/** Conteúdo do arquivo .ics de um evento. */
export function ics(e: Evento, uid: string, url: string) {
  const { diaInteiro, inicio, fim } = intervalo(e);
  const carimbo = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const linhas = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//IVG Brasil//Agenda//PT', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    ...(diaInteiro ? [] : [
      'BEGIN:VTIMEZONE', `TZID:${FUSO}`,
      // Sem horário de verão desde 2019.
      'BEGIN:STANDARD', 'DTSTART:19700101T000000', 'TZOFFSETFROM:-0300', 'TZOFFSETTO:-0300', 'TZNAME:-03', 'END:STANDARD',
      'END:VTIMEZONE',
    ]),
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${carimbo}`,
    diaInteiro ? `DTSTART;VALUE=DATE:${inicio}` : `DTSTART;TZID=${FUSO}:${inicio}`,
    diaInteiro ? `DTEND;VALUE=DATE:${fim}` : `DTEND;TZID=${FUSO}:${fim}`,
    `SUMMARY:${escapar(e.data.titulo)}`,
    ...(descricao(e) ? [`DESCRIPTION:${escapar(descricao(e))}`] : []),
    ...(local(e) ? [`LOCATION:${escapar(local(e))}`] : []),
    `URL:${e.data.link || url}`,
    'END:VEVENT', 'END:VCALENDAR',
  ];
  return linhas.map(dobrar).join('\r\n') + '\r\n';
}
