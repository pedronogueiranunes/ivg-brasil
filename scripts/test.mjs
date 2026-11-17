// Testes de qualidade: links internos quebrados (linkinator) e acessibilidade (axe).
// Roda tudo localmente com `npm test`. Gera um build próprio na raiz (/) em dist-test/,
// porque os links do staging começam por /ivg-brasil/ e não existem numa pasta servida na raiz.
import { spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { LinkChecker } from 'linkinator';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const OUT = 'dist-test';
const LOCALES = ['', 'en/', 'de/'];
const IMPACTOS = ['serious', 'critical'];

const pular = process.argv.includes('--sem-build');
if (!pular) {
  const build = spawnSync('npx', ['astro', 'build', '--outDir', OUT], {
    stdio: 'inherit',
    env: { ...process.env, BASE_PATH: '/', SITE_URL: 'http://localhost' },
  });
  if (build.status !== 0) process.exit(build.status ?? 1);
  // Índice da busca (tarefa 05), como no `npm run build`.
  const indice = spawnSync('npx', ['pagefind', '--site', OUT], { stdio: 'inherit' });
  if (indice.status !== 0) process.exit(indice.status ?? 1);
}

const tipos = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.xml': 'application/xml', '.txt': 'text/plain', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2' };

function resolver(url) {
  const caminho = normalize(decodeURIComponent(new URL(url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
  const arquivo = join(OUT, caminho);
  if (existsSync(arquivo) && statSync(arquivo).isFile()) return arquivo;
  const indice = join(arquivo, 'index.html');
  if (existsSync(indice)) return indice;
  return null;
}

const servidor = createServer((req, res) => {
  const arquivo = resolver(req.url ?? '/');
  if (arquivo) {
    res.writeHead(200, { 'Content-Type': tipos[extname(arquivo)] ?? 'application/octet-stream' });
    res.end(readFileSync(arquivo));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(existsSync(join(OUT, '404.html')) ? readFileSync(join(OUT, '404.html')) : 'Not found');
  }
});
await new Promise((ok) => servidor.listen(0, '127.0.0.1', ok));
const origem = `http://127.0.0.1:${servidor.address().port}`;

let falhas = 0;

// 1. Links internos
console.log('\n== Links internos ==');
const verificador = new LinkChecker();
const resultado = await verificador.check({
  path: `${origem}/`,
  recurse: true,
  linksToSkip: [`^(?!${origem.replace(/[.]/g, '\\.')}).*`],
  timeout: 15000,
});
const quebrados = resultado.links.filter((l) => l.state === 'BROKEN');
console.log(`${resultado.links.length} links verificados, ${quebrados.length} quebrados.`);
for (const l of quebrados) console.log(`  QUEBRADO ${l.status ?? ''} ${l.url}  (em ${l.parent})`);
if (quebrados.length) falhas++;

// 2. Acessibilidade
console.log('\n== Acessibilidade (axe) ==');
const primeiraNoticia = () => {
  const dir = join(OUT, 'noticias');
  if (!existsSync(dir)) return null;
  const pasta = readdirSync(dir).find((n) => statSync(join(dir, n)).isDirectory());
  return pasta ? `noticias/${pasta}/` : null;
};
const modelos = ['', 'noticias/', primeiraNoticia(), 'agenda/', 'busca/', 'pesquisa/cursos/'].filter((m) => m !== null);
const paginas = [];
for (const modelo of modelos) {
  for (const loc of LOCALES) {
    const rota = `${loc}${modelo}`;
    // Todas as páginas da lista existem desde a tarefa 08 (agenda); faltar uma agora é erro.
    if (existsSync(join(OUT, rota, 'index.html'))) paginas.push(`/${rota}`);
    else { console.log(`FALHOU /${rota}  (página não gerada)`); falhas++; }
  }
}
const navegador = await chromium.launch();
for (const p of paginas) {
  const contexto = await navegador.newContext();
  const pagina = await contexto.newPage();
  await pagina.goto(origem + p);
  // A página de busca monta a interface do Pagefind depois do carregamento.
  if (p.endsWith('busca/')) await pagina.waitForSelector('.pagefind-ui__search-input', { timeout: 10000 });
  const { violations } = await new AxeBuilder({ page: pagina }).analyze();
  const graves = violations.filter((v) => IMPACTOS.includes(v.impact ?? ''));
  console.log(`${graves.length ? 'FALHOU' : 'ok    '} ${p}  (${violations.length} avisos, ${graves.length} graves)`);
  for (const v of graves) console.log(`    [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} elemento(s))`);
  if (graves.length) falhas++;
  await contexto.close();
}
await navegador.close();
servidor.close();

console.log(falhas ? `\n${falhas} verificação(ões) falharam.` : '\nTudo certo.');
process.exit(falhas ? 1 : 0);
