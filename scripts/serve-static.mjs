/**
 * Serves the build output locally the way the static host will (see vercel.json): a
 * directory's index.html for its path, files as they are, and the root index.html for anything
 * unknown (the SPA fallback rewrite). No JavaScript runs on the server — what `curl` shows is
 * exactly what a crawler gets.
 *
 *   npm run build && npm run preview            → http://localhost:4173/
 *   npm run preview -- --port 5000
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { browserOutputDir } from './lib/prerender-output.mjs';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.map': 'application/json',
};

const portIndex = process.argv.indexOf('--port');
const port = portIndex === -1 ? 4173 : Number(process.argv[portIndex + 1]);
const root = await browserOutputDir();

async function fileInfo(file) {
  try {
    return await stat(file);
  } catch {
    return null;
  }
}

/** The file for a request path: the file itself, a directory's index.html, or null. */
async function resolve(pathname) {
  const target = path.normalize(path.join(root, decodeURIComponent(pathname)));
  if (!target.startsWith(root)) {
    return null;
  }
  const info = await fileInfo(target);
  if (info?.isFile()) {
    return target;
  }
  if (info?.isDirectory()) {
    const index = path.join(target, 'index.html');
    return (await fileInfo(index))?.isFile() ? index : null;
  }
  return null;
}

const server = createServer(async (request, response) => {
  const { pathname } = new URL(request.url ?? '/', `http://${request.headers.host}`);
  let file = await resolve(pathname);
  let fallback = false;
  if (!file) {
    file = path.join(root, 'index.html');
    fallback = true;
  }
  try {
    const body = await readFile(file);
    response.writeHead(200, {
      'Content-Type': MIME[path.extname(file).toLowerCase()] ?? 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    response.end(body);
    console.log(`200 ${pathname}${fallback ? '  → index.html (SPA fallback)' : ''}`);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
    console.log(`404 ${pathname}`);
  }
});

server.listen(port, () => {
  console.log(`Serving ${path.relative(process.cwd(), root)} at http://localhost:${port}/  (Ctrl+C to stop)`);
});
