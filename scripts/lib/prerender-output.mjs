/**
 * Shared helpers for the post-build SEO scripts: where the browser output is, which
 * pre-rendered pages it contains, and a small <head> parser (no dependencies).
 */
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

/** `dist/<app>/browser`, read from angular.json so the scripts follow the build config. */
export async function browserOutputDir() {
  const angularJson = JSON.parse(await readFile(path.join(PROJECT_ROOT, 'angular.json'), 'utf8'));
  const [project] = Object.values(angularJson.projects);
  const { outputPath } = project.architect.build.options;
  const base = typeof outputPath === 'string' ? outputPath : outputPath.base;
  const browser = typeof outputPath === 'string' ? 'browser' : (outputPath.browser ?? 'browser');
  return path.join(PROJECT_ROOT, base, browser);
}

/**
 * Every pre-rendered page under `dir`: `{ route, file }`, with `route` as the site-relative
 * path ('/' for the root, '/about' for about/index.html). `index.csr.html` (the client-only
 * shell the builder keeps next to a pre-rendered root) is not a page and is skipped.
 */
export async function listPrerenderedPages(dir) {
  const pages = [];
  async function walk(current, route) {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        await walk(path.join(current, entry.name), `${route}${entry.name}/`);
      } else if (entry.name === 'index.html') {
        pages.push({ route: route === '/' ? '/' : route.slice(0, -1), file: path.join(current, entry.name) });
      }
    }
  }
  await walk(dir, '/');
  return pages.sort((a, b) => a.route.localeCompare(b.route));
}

function attributes(tag) {
  const attrs = {};
  for (const [, name, value] of tag.matchAll(/([a-zA-Z_:][\w:.-]*)\s*=\s*"([^"]*)"/g)) {
    attrs[name.toLowerCase()] = decodeEntities(value);
  }
  return attrs;
}

export function decodeEntities(text) {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

/** The parts of a page's <head> the SEO checks care about. */
export function parseHead(html) {
  const head = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i)?.[1] ?? '';
  const title = decodeEntities(head.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '').trim();
  const metas = [...head.matchAll(/<meta\b[^>]*>/gi)].map((m) => attributes(m[0]));
  const links = [...head.matchAll(/<link\b[^>]*>/gi)].map((m) => attributes(m[0]));
  const jsonLd = [...head.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].map(
    (m) => m[1].trim(),
  );
  return { title, metas, links, jsonLd };
}

/** All `content` values of the <meta> tags with `attr="key"` (normally zero or one). */
export function metaContents(head, attr, key) {
  return head.metas.filter((m) => m[attr] === key).map((m) => m.content ?? '');
}

export function canonicalHrefs(head) {
  return head.links.filter((l) => l.rel === 'canonical').map((l) => l.href ?? '');
}

/** Visible text of the document body: scripts, styles and tags removed, whitespace collapsed. */
export function bodyText(html) {
  const body = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] ?? '';
  return decodeEntities(
    body
      .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/\s+/g, ' ')
    .trim();
}
