#!/usr/bin/env node
// Importa cursos de um CSV para a coleção `cursos` (tarefa 12).
//
// Uso:
//   node scripts/importar-cursos.mjs <arquivo.csv> [--force] [--sem-geo] [--completar-geo] [--destino <pasta>]
//   node scripts/importar-cursos.mjs --completar-geo [--destino <pasta>]
//
// Colunas do CSV: instituicao, cidade, uf, nivel, modalidade, link
// (separadas por vírgula ou por ponto e vírgula, como o Excel exporta em português).
//
// - Gera um .yaml por curso em src/content/cursos/pt/ (ou em --destino).
// - Nome do arquivo: slug da instituição. Se duas linhas do CSV derem o mesmo nome,
//   acrescenta o nível (e depois a modalidade) para separar.
// - Arquivo que já existe não é tocado, a não ser com --force. Rodar de novo não duplica nada.
// - Latitude e longitude vêm do Nominatim (OpenStreetMap) pela cidade, no máximo 1 pedido
//   por segundo, com cache em scripts/.cache-geo.json. --sem-geo pula essa etapa.
//   O cache é versionado de propósito: quem importar depois não repete as consultas.
//   Para identificar o projeto ao Nominatim com um e-mail, use NOMINATIM_EMAIL=...
// - --completar-geo acrescenta lat e lng só aos arquivos que ainda não têm posição (curso criado
//   com a rede fora do ar, ou cadastrado no painel). Não mexe em mais nada do arquivo, então
//   as edições feitas no Keystatic ficam. Sem CSV, varre todos os arquivos da pasta.
//   Os campos seguem o schema em src/content.config.ts e keystatic.config.ts.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CACHE = process.env.IMPORTAR_CACHE ?? join(RAIZ, 'scripts', '.cache-geo.json');
const NOMINATIM = process.env.NOMINATIM_URL ?? 'https://nominatim.openstreetmap.org/search';
const USER_AGENT = 'IVG-Brasil-importador-de-cursos/1.0 (+https://pedronogueira.dev/ivg-brasil/)';
const INTERVALO_MS = 1100; // política do Nominatim: no máximo 1 pedido por segundo

// Mesmas listas do schema (src/content.config.ts).
const UFS = {
  AC: 'Acre', AL: 'Alagoas', AP: 'Amapá', AM: 'Amazonas', BA: 'Bahia', CE: 'Ceará', DF: 'Distrito Federal',
  ES: 'Espírito Santo', GO: 'Goiás', MA: 'Maranhão', MT: 'Mato Grosso', MS: 'Mato Grosso do Sul',
  MG: 'Minas Gerais', PA: 'Pará', PB: 'Paraíba', PR: 'Paraná', PE: 'Pernambuco', PI: 'Piauí',
  RJ: 'Rio de Janeiro', RN: 'Rio Grande do Norte', RS: 'Rio Grande do Sul', RO: 'Rondônia', RR: 'Roraima',
  SC: 'Santa Catarina', SP: 'São Paulo', SE: 'Sergipe', TO: 'Tocantins',
};
const NIVEIS = { graduacao: 'graduacao', licenciatura: 'graduacao', bacharelado: 'graduacao', pos: 'pos', posgraduacao: 'pos', mestrado: 'pos', doutorado: 'pos' };
const MODALIDADES = { presencial: 'presencial', ead: 'ead', adistancia: 'ead', distancia: 'ead', online: 'ead', hibrido: 'hibrido', semipresencial: 'hibrido' };
const COLUNAS = ['instituicao', 'cidade', 'uf', 'nivel', 'modalidade', 'link'];

// ---------- argumentos ----------
const args = process.argv.slice(2);
const force = args.includes('--force');
const semGeo = args.includes('--sem-geo');
const completarGeo = args.includes('--completar-geo');
const iDestino = args.indexOf('--destino');
const destino = iDestino >= 0 ? resolve(args[iDestino + 1] ?? '') : join(RAIZ, 'src', 'content', 'cursos', 'pt');
const arquivo = args.find((a, i) => !a.startsWith('--') && i !== iDestino + 1);
if (!arquivo && !completarGeo) {
  console.error('Uso: node scripts/importar-cursos.mjs <arquivo.csv> [--force] [--sem-geo] [--completar-geo] [--destino <pasta>]');
  console.error('     node scripts/importar-cursos.mjs --completar-geo [--destino <pasta>]');
  process.exit(2);
}

// ---------- utilidades ----------
const semAcento = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
const chave = (s) => semAcento(String(s ?? '')).toLowerCase().replace(/[^a-z0-9]/g, '');
const slug = (s) => semAcento(String(s)).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const yaml = (v) => JSON.stringify(v); // string entre aspas duplas: YAML válido para qualquer texto
const espera = (ms) => new Promise((ok) => setTimeout(ok, ms));

/** CSV simples (RFC 4180): aspas, aspas duplicadas, quebras de linha dentro de aspas, BOM. */
function lerCsv(texto) {
  texto = texto.replace(/^﻿/, '');
  const primeira = texto.split(/\r?\n/, 1)[0];
  const sep = (primeira.match(/;/g)?.length ?? 0) > (primeira.match(/,/g)?.length ?? 0) ? ';' : ',';
  const linhas = [];
  let campo = '', linha = [], aspas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (aspas) {
      if (c === '"' && texto[i + 1] === '"') { campo += '"'; i++; }
      else if (c === '"') aspas = false;
      else campo += c;
    } else if (c === '"') aspas = true;
    else if (c === sep) { linha.push(campo); campo = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && texto[i + 1] === '\n') i++;
      linha.push(campo); linhas.push(linha); linha = []; campo = '';
    } else campo += c;
  }
  if (campo !== '' || linha.length) { linha.push(campo); linhas.push(linha); }
  return linhas.filter((l) => l.some((v) => v.trim() !== ''));
}

/** Valida e normaliza uma linha. Devolve { curso } ou { erro }. */
function normalizar(reg) {
  const instituicao = reg.instituicao?.trim();
  if (!instituicao) return { erro: 'instituição vazia' };
  const uf = reg.uf?.trim().toUpperCase();
  if (!UFS[uf]) return { erro: `UF inválida: "${reg.uf ?? ''}"` };
  const nivel = NIVEIS[chave(reg.nivel)];
  if (!nivel) return { erro: `nível inválido: "${reg.nivel ?? ''}" (use graduacao ou pos)` };
  const modalidade = MODALIDADES[chave(reg.modalidade)];
  if (!modalidade) return { erro: `modalidade inválida: "${reg.modalidade ?? ''}" (use presencial, ead ou hibrido)` };
  let link = reg.link?.trim() ?? '';
  if (link && !/^https?:\/\//i.test(link)) link = `https://${link}`;
  if (link) { try { new URL(link); } catch { return { erro: `link inválido: "${reg.link}"` }; } }
  return { curso: { instituicao, cidade: reg.cidade?.trim() ?? '', uf, nivel, modalidade, link } };
}

// ---------- geocodificação ----------
let cache = {};
if (existsSync(CACHE)) {
  try { cache = JSON.parse(readFileSync(CACHE, 'utf8')); }
  catch { console.warn(`Aviso: ${CACHE} ilegível; começando um cache novo.`); }
}
const salvarCache = () => writeFileSync(CACHE, JSON.stringify(cache, null, 2) + '\n');
let ultimoPedido = 0;

async function coordenadas(cidade, uf) {
  if (!cidade) return null;
  const k = `${chave(cidade)}|${uf}`;
  if (k in cache) return cache[k] && { lat: cache[k].lat, lng: cache[k].lng };
  if (semGeo) return null;

  const falta = ultimoPedido + INTERVALO_MS - Date.now();
  if (falta > 0) await espera(falta);
  ultimoPedido = Date.now();

  const url = new URL(NOMINATIM);
  url.search = new URLSearchParams({
    city: cidade, state: UFS[uf], country: 'Brasil', countrycodes: 'br', format: 'jsonv2', limit: '1',
    ...(process.env.NOMINATIM_EMAIL ? { email: process.env.NOMINATIM_EMAIL } : {}),
  }).toString();
  try {
    const resp = await fetch(url, { headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'pt-BR' } });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const [r] = await resp.json();
    // Não achou: guarda null para não perguntar de novo; apague a entrada do cache para tentar outra vez.
    cache[k] = r ? { cidade, uf, lat: Math.round(Number(r.lat) * 1e4) / 1e4, lng: Math.round(Number(r.lon) * 1e4) / 1e4, fonte: 'nominatim', em: new Date().toISOString().slice(0, 10) } : null;
    salvarCache();
    if (!r) console.warn(`  Aviso: ${cidade}/${uf} não encontrada no Nominatim; o curso fica sem posição no mapa.`);
    return cache[k] && { lat: cache[k].lat, lng: cache[k].lng };
  } catch (e) {
    // Falha de rede não entra no cache: na próxima execução tenta de novo.
    console.warn(`  Aviso: não consegui consultar o Nominatim para ${cidade}/${uf} (${e.message}); o curso fica sem posição.`);
    return null;
  }
}

// ---------- importação do CSV ----------
async function importar() {
  const linhas = lerCsv(readFileSync(resolve(arquivo), 'utf8'));
  if (!linhas.length) { console.error('CSV vazio.'); process.exit(1); }
  const cabecalho = linhas[0].map((c) => chave(c));
  const faltam = COLUNAS.filter((c) => !cabecalho.includes(c));
  if (faltam.length) {
    console.error(`Faltam colunas no CSV: ${faltam.join(', ')}. Esperado: ${COLUNAS.join(', ')}.`);
    process.exit(1);
  }

  const erros = [];
  const cursos = [];
  linhas.slice(1).forEach((valores, i) => {
    const reg = Object.fromEntries(cabecalho.map((c, j) => [c, valores[j]]));
    const { curso, erro } = normalizar(reg);
    if (erro) erros.push(`linha ${i + 2}: ${erro}`);
    else cursos.push({ ...curso, linha: i + 2 });
  });

  // Nomes de arquivo estáveis: a mesma linha gera sempre o mesmo nome.
  const usados = new Map();
  for (const c of cursos) {
    // Linha igual a outra já vista (mesma instituição, nível e modalidade) é repetição, não um curso novo.
    const repetida = [...usados.values()].find((o) => o.instituicao === c.instituicao && o.nivel === c.nivel && o.modalidade === c.modalidade);
    if (repetida) { erros.push(`linha ${c.linha}: curso repetido (igual à linha ${repetida.linha})`); c.ignorar = true; continue; }
    const candidatos = [slug(c.instituicao), slug(`${c.instituicao} ${c.nivel}`), slug(`${c.instituicao} ${c.nivel} ${c.modalidade}`)];
    const base = candidatos.find((n) => !usados.has(n)) ?? `${candidatos[2]}-${c.linha}`;
    usados.set(base, c);
    c.arquivo = `${base}.yaml`;
  }

  mkdirSync(destino, { recursive: true });
  let criados = 0, atualizados = 0, mantidos = 0;
  for (const c of cursos) {
    if (c.ignorar) continue;
    const caminho = join(destino, c.arquivo);
    const existe = existsSync(caminho);
    if (existe && !force) { mantidos++; continue; }
    const pos = await coordenadas(c.cidade, c.uf);
    const conteudo = [
      `instituicao: ${yaml(c.instituicao)}`,
      `cidade: ${yaml(c.cidade)}`,
      `uf: ${c.uf}`,
      `nivel: ${c.nivel}`,
      `modalidade: ${c.modalidade}`,
      `link: ${yaml(c.link)}`,
      ...(pos ? [`lat: ${pos.lat}`, `lng: ${pos.lng}`] : []),
    ].join('\n') + '\n';
    if (existe && readFileSync(caminho, 'utf8') === conteudo) { mantidos++; continue; }
    writeFileSync(caminho, conteudo);
    existe ? atualizados++ : criados++;
    console.log(`${existe ? 'atualizado' : 'criado    '} ${caminho.replace(RAIZ + '/', '')}${pos ? '' : '  (sem posição no mapa)'}`);
  }

  console.log(`\n${criados} criado(s), ${atualizados} atualizado(s), ${mantidos} sem mudança${force ? '' : ' (use --force para reescrever os que já existem)'}.`);
  return erros;
}

// ---------- --completar-geo ----------
const valorDe = (texto, campo) => {
  const m = texto.match(new RegExp(`^${campo}:[ \\t]*(.*?)[ \\t]*$`, 'm'));
  if (!m) return '';
  const v = m[1];
  if (v.startsWith('"')) { try { return JSON.parse(v); } catch { return v.slice(1, -1); } }
  if (v.startsWith("'")) return v.slice(1, -1).replace(/''/g, "'");
  return v;
};
const vazio = (v) => v === '' || v === 'null' || v === '~';

/** Acrescenta (ou preenche) lat e lng num arquivo que não os tem, sem tocar no resto. */
async function completar() {
  const { readdirSync } = await import('node:fs');
  if (!existsSync(destino)) { console.log(`Pasta ${destino} não existe; nada a completar.`); return; }
  let completados = 0, semPosicao = 0, jaTinham = 0;
  for (const nome of readdirSync(destino).filter((n) => n.endsWith('.yaml')).sort()) {
    const caminho = join(destino, nome);
    const texto = readFileSync(caminho, 'utf8');
    if (!vazio(valorDe(texto, 'lat')) && !vazio(valorDe(texto, 'lng'))) { jaTinham++; continue; }
    const cidade = valorDe(texto, 'cidade').trim();
    const uf = valorDe(texto, 'uf').trim().toUpperCase();
    const pos = UFS[uf] ? await coordenadas(cidade, uf) : null;
    if (!pos) { semPosicao++; console.log(`sem posição  ${nome}${cidade ? '' : '  (sem cidade)'}`); continue; }
    let novo = texto.endsWith('\n') ? texto : texto + '\n';
    for (const [campo, v] of [['lat', pos.lat], ['lng', pos.lng]]) {
      const linha = new RegExp(`^${campo}:.*$`, 'm');
      novo = linha.test(novo) ? novo.replace(linha, `${campo}: ${v}`) : novo + `${campo}: ${v}\n`;
    }
    writeFileSync(caminho, novo);
    completados++;
    console.log(`completado   ${nome}  (${pos.lat}, ${pos.lng})`);
  }
  console.log(`\n${completados} completado(s), ${semPosicao} sem posição, ${jaTinham} já tinham posição.`);
}

// ---------- principal ----------
const erros = arquivo ? await importar() : [];
if (completarGeo) await completar();
if (erros.length) {
  console.log(`\n${erros.length} linha(s) com problema, não importada(s):`);
  erros.sort((x, y) => Number(x.match(/\d+/)[0]) - Number(y.match(/\d+/)[0]));
  for (const e of erros) console.log(`  ${e}`);
  process.exit(1);
}
