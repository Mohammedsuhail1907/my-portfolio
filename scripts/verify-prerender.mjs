/**
 * Proves, before anything is deployed, that the build output is what crawlers and link
 * scrapers will read WITHOUT running JavaScript: every pre-rendered `index.html` must carry a
 * rendered app (not an empty <app-root>), one <h1>, a title, a description, the Open Graph /
 * Twitter tags, valid JSON-LD — and, once the site URL is known, canonical + og:url + og:image.
 *
 * Runs after `ng build` (package.json "build") and exits 1 on any error, so a regression
 * (a component that throws during the prerender, a route without SEO data, a duplicated tag)
 * fails the build instead of shipping. Site-URL checks are warnings locally and errors on
 * CI / Vercel (or with --strict), where the URL is always resolvable.
 */
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import {
  PROJECT_ROOT,
  bodyText,
  browserOutputDir,
  canonicalHrefs,
  decodeEntities,
  listPrerenderedPages,
  metaContents,
  parseHead,
} from './lib/prerender-output.mjs';

const strict = process.argv.includes('--strict') || !!process.env.CI || !!process.env.VERCEL;
let errors = 0;
let warnings = 0;

function report(kind, message) {
  if (kind === 'error') {
    errors += 1;
    console.log(`    ✖ ${message}`);
  } else if (kind === 'warn') {
    warnings += 1;
    console.log(`    ⚠ ${message}`);
  } else {
    console.log(`    ✔ ${message}`);
  }
}

/** Site-URL-dependent tags: an error when the URL must be known, a warning otherwise. */
const siteUrlKind = strict ? 'error' : 'warn';

function exactlyOne(values, label, kind = 'error') {
  if (values.length === 0) {
    report(kind, `${label} missing`);
    return undefined;
  }
  if (values.length > 1) {
    report('error', `${label} duplicated (${values.length}×)`);
  }
  if (!values[0]) {
    report(kind, `${label} is empty`);
    return undefined;
  }
  return values[0];
}

function isAbsolute(url) {
  return /^https?:\/\/\S+$/i.test(url ?? '');
}

function jsonLdTypes(node, into = []) {
  if (Array.isArray(node)) {
    node.forEach((item) => jsonLdTypes(item, into));
  } else if (node && typeof node === 'object') {
    if (typeof node['@type'] === 'string') {
      into.push(node['@type']);
    }
    if (Array.isArray(node['@graph'])) {
      jsonLdTypes(node['@graph'], into);
    }
  }
  return into;
}

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

const outDir = await browserOutputDir();
const pages = await listPrerenderedPages(outDir);
console.log(`Verifying pre-rendered output in ${path.relative(process.cwd(), outDir)} (${strict ? 'strict' : 'local'} mode)\n`);
if (pages.length === 0) {
  console.log('✖ No pre-rendered pages found. Is angular.json `outputMode` set to "static" and `server` to src/main.server.ts?');
  process.exit(1);
}

for (const page of pages) {
  const html = await readFile(page.file, 'utf8');
  const head = parseHead(html);
  const text = bodyText(html);
  const words = text ? text.split(' ').length : 0;
  console.log(`${page.route}  →  ${path.relative(outDir, page.file)}  (${(html.length / 1024).toFixed(1)} kB, ${words} words of visible text)`);

  // --- Rendered body -------------------------------------------------------------------------
  const appRoot = html.match(/<app-root\b([^>]*)>([\s\S]*?)<\/app-root>/i);
  if (!appRoot) {
    report('error', '<app-root> missing');
  } else if (!/\bng-version=/.test(appRoot[1]) || appRoot[2].replace(/<!--[\s\S]*?-->/g, '').trim().length < 200) {
    report('error', '<app-root> is empty — the page was NOT pre-rendered (client-side rendering only)');
  } else {
    report('ok', `app rendered (ng-version ${appRoot[1].match(/ng-version="([^"]*)"/)?.[1]}, hydration annotations ${/\bngh=/.test(appRoot[1]) ? 'present' : 'absent'})`);
  }
  const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => decodeEntities(m[1].replace(/<[^>]+>/g, '')).trim());
  if (h1s.length !== 1 || !h1s[0]) {
    report('error', `expected exactly one non-empty <h1>, found ${h1s.length}${h1s.length ? `: ${h1s.map((h) => JSON.stringify(h)).join(', ')}` : ''}`);
  } else {
    const h2s = (html.match(/<h2\b/gi) ?? []).length;
    report('ok', `<h1> ${JSON.stringify(h1s[0])}, ${h2s} <h2>`);
  }
  if (words < 100) {
    report('error', `only ${words} words of visible text`);
  }
  // A static `autofocus` is honoured by the browser on load: it focuses the element and
  // scrolls the page to it. PrimeNG's <p-button> writes autofocus="true" whenever its input is
  // unset — use the pButton directive on a native <button> instead.
  const autofocused = [...html.matchAll(/<([a-z-]+)\b[^>]*\sautofocus(?=[\s=>/])[^>]*>/gi)];
  if (autofocused.length) {
    report('error', `${autofocused.length} element(s) carry an autofocus attribute (the page would scroll to them on load): ${autofocused.map((m) => `<${m[1]}>`).join(', ')}`);
  }

  // --- Title + description -------------------------------------------------------------------
  const title = exactlyOne(head.title ? [head.title] : [], '<title>');
  if (title) {
    report(title.length > 70 ? 'warn' : 'ok', `title (${title.length} chars) ${JSON.stringify(title)}`);
  }
  const description = exactlyOne(metaContents(head, 'name', 'description'), 'meta description');
  if (description) {
    const kind = description.length > 160 || description.length < 50 ? 'warn' : 'ok';
    report(kind, `description (${description.length} chars${kind === 'warn' ? ', aim for 50–160' : ''})`);
  }
  const robots = metaContents(head, 'name', 'robots');
  if (robots.length) {
    report('ok', `robots ${JSON.stringify(robots[0])}`);
  }

  // --- Canonical ------------------------------------------------------------------------------
  const canonical = exactlyOne(canonicalHrefs(head), 'canonical link', siteUrlKind);
  if (canonical && !isAbsolute(canonical)) {
    report('error', `canonical is not an absolute URL: ${canonical}`);
  } else if (canonical) {
    report('ok', `canonical ${canonical}`);
  }

  // --- Open Graph -----------------------------------------------------------------------------
  const ogTitle = exactlyOne(metaContents(head, 'property', 'og:title'), 'og:title');
  const ogDescription = exactlyOne(metaContents(head, 'property', 'og:description'), 'og:description');
  const ogType = exactlyOne(metaContents(head, 'property', 'og:type'), 'og:type');
  const ogUrl = exactlyOne(metaContents(head, 'property', 'og:url'), 'og:url', siteUrlKind);
  const ogImage = exactlyOne(metaContents(head, 'property', 'og:image'), 'og:image', siteUrlKind);
  if (ogUrl && canonical && ogUrl !== canonical) {
    report('error', `og:url (${ogUrl}) differs from the canonical (${canonical})`);
  }
  if (ogImage && !isAbsolute(ogImage)) {
    report('error', `og:image must be an absolute URL, got ${ogImage}`);
  }
  if (ogTitle && ogDescription && ogType) {
    report('ok', `Open Graph type=${ogType}, title, description${ogUrl ? ', url' : ''}${ogImage ? ', image' : ''}`);
  }

  // --- Twitter card ---------------------------------------------------------------------------
  const card = exactlyOne(metaContents(head, 'name', 'twitter:card'), 'twitter:card');
  const twitterTitle = exactlyOne(metaContents(head, 'name', 'twitter:title'), 'twitter:title');
  const twitterDescription = exactlyOne(metaContents(head, 'name', 'twitter:description'), 'twitter:description');
  const twitterImage = metaContents(head, 'name', 'twitter:image');
  if (card && twitterTitle && twitterDescription) {
    report('ok', `Twitter card=${card}, title, description${twitterImage.length ? ', image' : ''}`);
  }

  // --- JSON-LD --------------------------------------------------------------------------------
  if (head.jsonLd.length === 0) {
    report('warn', 'no JSON-LD structured data');
  }
  head.jsonLd.forEach((raw, index) => {
    try {
      const data = JSON.parse(raw);
      const context = Array.isArray(data) ? data[0]?.['@context'] : data['@context'];
      if (!/schema\.org/.test(String(context))) {
        report('error', `JSON-LD #${index + 1} has no schema.org @context`);
      } else {
        report('ok', `JSON-LD #${index + 1}: ${jsonLdTypes(data).join(', ') || 'no @type'}`);
      }
    } catch (error) {
      report('error', `JSON-LD #${index + 1} is not valid JSON: ${error.message}`);
    }
  });
  console.log('');
}

// --- Static fallback head in src/index.html -----------------------------------------------------
// src/index.html hard-codes the same title / description / Open Graph / Twitter tags, so a
// response that never runs the app (index.csr.html, a JavaScript-less scraper) still carries the
// contract. SeoService updates each tag in place, so the two must agree or the fallback ships
// stale copy. Compared against the pre-rendered site root.
console.log('static fallback head (src/index.html)');
const rootPage = pages.find((page) => page.route === '/');
if (!rootPage) {
  report('warn', 'no pre-rendered site root to compare against');
} else {
  const staticHead = parseHead(await readFile(path.join(PROJECT_ROOT, 'src', 'index.html'), 'utf8'));
  const renderedHead = parseHead(await readFile(rootPage.file, 'utf8'));
  const compare = [
    ['<title>', () => [staticHead.title], () => [renderedHead.title]],
    ...[
      ['name', 'description'],
      ['name', 'keywords'],
      ['name', 'robots'],
      ['property', 'og:type'],
      ['property', 'og:url'],
      ['property', 'og:title'],
      ['property', 'og:description'],
      ['property', 'og:image'],
      ['name', 'twitter:card'],
      ['name', 'twitter:title'],
      ['name', 'twitter:description'],
      ['name', 'twitter:image'],
    ].map(([attr, key]) => [key, () => metaContents(staticHead, attr, key), () => metaContents(renderedHead, attr, key)]),
    ['canonical', () => canonicalHrefs(staticHead), () => canonicalHrefs(renderedHead)],
  ];
  let drifted = 0;
  for (const [label, staticValues, renderedValues] of compare) {
    const fallback = staticValues()[0] ?? '';
    const rendered = renderedValues()[0] ?? '';
    if (fallback !== rendered) {
      drifted += 1;
      report('warn', `${label} differs — src/index.html has ${JSON.stringify(fallback)}, rendered ${JSON.stringify(rendered)}`);
    }
  }
  if (!drifted) {
    report('ok', `${compare.length} fallback tag(s) match the rendered output`);
  }
  if (staticHead.jsonLd.length !== 1) {
    report('warn', `expected exactly 1 JSON-LD block in src/index.html, found ${staticHead.jsonLd.length}`);
  } else {
    try {
      JSON.parse(staticHead.jsonLd[0]);
      report('ok', 'fallback JSON-LD is valid JSON');
    } catch (error) {
      report('error', `fallback JSON-LD in src/index.html is not valid JSON: ${error.message}`);
    }
  }
}
console.log('');

// --- Crawler files ----------------------------------------------------------------------------
console.log('crawler files');
for (const name of ['robots.txt', 'sitemap.xml']) {
  if (await exists(path.join(outDir, name))) {
    report('ok', name);
  } else {
    report(name === 'robots.txt' ? 'error' : siteUrlKind, `${name} missing (run scripts/generate-seo-files.mjs)`);
  }
}

console.log(`\n${errors} error(s), ${warnings} warning(s).`);
if (errors) {
  console.log('Fix the errors above before deploying — this output would ship broken SEO.');
  process.exit(1);
}
