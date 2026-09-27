/**
 * Writes `sitemap.xml` and `robots.txt` into the build output, derived from the pre-rendered
 * pages themselves: each `index.html` contributes its `<link rel="canonical">` (pages marked
 * `noindex` are left out), so the sitemap can never drift from what was actually rendered and
 * the site URL has a single source of truth (SITE_URL, see src/app/seo).
 *
 * Runs after `ng build` (package.json "build"). `lastmod` is the last commit date, or now.
 * With no canonical on any page (site URL unknown) it warns — and fails on CI / Vercel, where
 * the URL is always available and its absence means a misconfiguration.
 */
import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  browserOutputDir,
  canonicalHrefs,
  listPrerenderedPages,
  metaContents,
  parseHead,
} from './lib/prerender-output.mjs';

const strict = process.argv.includes('--strict') || !!process.env.CI || !!process.env.VERCEL;

function escapeXml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function lastModified() {
  try {
    return execFileSync('git', ['log', '-1', '--format=%cI'], { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return new Date().toISOString();
  }
}

const outDir = await browserOutputDir();
const pages = await listPrerenderedPages(outDir);
if (pages.length === 0) {
  console.error(`✖ No pre-rendered pages found under ${outDir}. Run "ng build" first.`);
  process.exit(1);
}

const urls = [];
const withoutCanonical = [];
const excluded = [];
for (const page of pages) {
  const head = parseHead(await readFile(page.file, 'utf8'));
  const [canonical] = canonicalHrefs(head);
  if (!canonical) {
    withoutCanonical.push(page.route);
    continue;
  }
  if (metaContents(head, 'name', 'robots').some((robots) => /noindex/i.test(robots))) {
    excluded.push(page.route);
    continue;
  }
  urls.push(canonical);
}

const lastmod = lastModified();
const origin = urls.length ? new URL(urls[0]).origin : '';

const robots = ['User-agent: *', 'Allow: /', ''];
if (origin) {
  robots.push(`Sitemap: ${origin}/sitemap.xml`, '');
}
await writeFile(path.join(outDir, 'robots.txt'), robots.join('\n'));
console.log(`✔ robots.txt${origin ? '' : ' (no Sitemap line: site URL unknown)'}`);

if (urls.length) {
  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((loc) => `  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`),
    '</urlset>',
    '',
  ].join('\n');
  await writeFile(path.join(outDir, 'sitemap.xml'), sitemap);
  console.log(`✔ sitemap.xml — ${urls.length} URL(s), lastmod ${lastmod}`);
  for (const loc of urls) {
    console.log(`    ${loc}`);
  }
}
for (const route of excluded) {
  console.log(`  · ${route} left out of the sitemap (noindex)`);
}
if (withoutCanonical.length) {
  const message =
    `${withoutCanonical.length} page(s) have no canonical URL, so no sitemap entry: ${withoutCanonical.join(', ')}.\n` +
    '  The site URL is unknown at build time — set SITE.siteUrl in src/app/config/site.config.ts,\n' +
    '  or the SITE_URL environment variable (Vercel builds resolve it automatically).';
  if (strict) {
    console.error(`✖ ${message}`);
    process.exit(1);
  }
  console.warn(`⚠ ${message}`);
}
