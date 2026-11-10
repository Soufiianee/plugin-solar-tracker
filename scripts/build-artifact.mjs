/**
 * Turns the normal static build (dist/) into a self-contained copy that can be published as a
 * claude.ai Artifact (out dir given as argv[2]). The real site is not changed.
 *
 *  - every root link ("/states/vermont/") becomes a relative file link ("states/vermont/index.html");
 *    a tiny click handler does the same for links the tool builds in the browser
 *  - page scripts are bundled (esbuild, IIFE) and inlined; the heading font is inlined as a data URI
 *  - the home page loses its <!doctype>/<html>/<head>/<body> wrapper (the Artifact host adds its own)
 *  - run `ARTIFACT_BUILD=1 astro build` first so the MailerLite signup is switched off
 *    (the Artifact host blocks third-party scripts)
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, rmSync } from 'node:fs';
import { join, dirname, relative, posix } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const out = process.argv[2];
if (!out) throw new Error('usage: node scripts/build-artifact.mjs <outDir>');
rmSync(out, { recursive: true, force: true });

const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const pages = walk(dist).filter((f) => f.endsWith('.html'));
const font = readFileSync(join(dist, 'fonts/source-serif-4-700-latin.woff2')).toString('base64');
const fontUri = `data:font/woff2;base64,${font}`;
const site = JSON.parse(readFileSync(join(root, 'config/site.json'), 'utf8'));
const siteName = site.SITE_NAME === 'TBD' ? 'Plug-in Solar Tracker' : site.SITE_NAME;

// bundle each referenced module script once
const bundles = new Map();
async function bundle(src) {
  if (!bundles.has(src)) {
    const r = await build({ entryPoints: [join(dist, src)], bundle: true, format: 'iife', minify: true, write: false, target: 'es2019' });
    bundles.set(src, r.outputFiles[0].text.replace(/<\/script/gi, '<\\/script'));
  }
  return bundles.get(src);
}

/** "/a/b/" relative to a page at depth -> "../a/b/index.html" */
function rel(href, prefix) {
  const [pathAndQuery, hash = ''] = href.split('#');
  let p = pathAndQuery.replace(/^\//, '');
  if (p === '' || p.endsWith('/')) p += 'index.html';
  return prefix + p + (hash ? '#' + hash : '');
}

for (const file of pages) {
  const relPath = relative(dist, file).split('\\').join('/');
  const depth = relPath.split('/').length - 1;
  const prefix = depth ? '../'.repeat(depth) : '';
  let html = readFileSync(file, 'utf8');

  // inline module scripts
  for (const m of [...html.matchAll(/<script type="module" src="\/(_astro\/[^"]+\.js)"><\/script>/g)]) {
    const code = await bundle(m[1]);
    html = html.replace(m[0], () => `<script>${code}</script>`); // function form: no $-pattern expansion
  }
  // font: inline, drop preload
  html = html.replace(/<link rel="preload" href="\/fonts\/[^"]+"[^>]*>/g, '');
  html = html.replace(/url\(["']?\/fonts\/source-serif-4-700-latin\.woff2["']?\)/g, () => `url("${fontUri}")`);
  // static root links -> relative file links (skip protocol-relative)
  html = html.replace(/(href|src)="\/(?!\/)([^"]*)"/g, (_, attr, p) => `${attr}="${rel('/' + p, prefix)}"`);
  // links built at runtime by the tool
  const fixer = `<script>(function(){var P=${JSON.stringify(prefix)};document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href^="/"]');if(!a)return;var h=a.getAttribute('href');if(h.indexOf('//')===0)return;var s=h.split('#'),p=s[0].slice(1);if(p===''||p.slice(-1)==='/')p+='index.html';a.setAttribute('href',P+p+(s[1]?'#'+s[1]:''));},true);})();</script>`;
  html = html.replace('</body>', fixer + '</body>');

  if (relPath === 'index.html') {
    // Artifact page contract: no document wrapper on the main page; title is the site name
    const head = html.match(/<head>([\s\S]*?)<\/head>/)[1];
    const body = html.match(/<body[^>]*>([\s\S]*)<\/body>/)[1];
    html = head.replace(/<meta charset="utf-8"\s*\/?>/i, '').replace(/<meta name="viewport"[^>]*>/i, '').replace(/<title>[^<]*<\/title>/, `<title>${siteName}</title>`) + body;
  }
  const dest = join(out, relPath);
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, html);
}

for (const extra of ['favicon.svg', 'updates/rss.xml']) {
  mkdirSync(dirname(join(out, extra)), { recursive: true });
  writeFileSync(join(out, extra), readFileSync(join(dist, extra)));
}

const files = walk(out).map((f) => relative(out, f).split('\\').join('/')).filter((f) => f !== 'index.html').sort();
writeFileSync(join(out, '..', 'artifact-files.json'), JSON.stringify(files, null, 1));
console.log(`Artifact copy: ${pages.length} pages in ${out}; ${files.length} supporting files listed in artifact-files.json`);
