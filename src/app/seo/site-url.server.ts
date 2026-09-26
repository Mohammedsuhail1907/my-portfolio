import { SITE } from '../config/site.config';
import { normalizeSiteUrl } from './site-url.token';

/**
 * Site URL for the build-time prerender (only ever imported by app.config.server.ts). First
 * match wins:
 *
 *  1. `SITE_URL` env var — explicit override (`SITE_URL=https://example.com npm run build`).
 *  2. `SITE.siteUrl` — hand-set in site.config.ts.
 *  3. `VERCEL_PROJECT_PRODUCTION_URL` — set by Vercel on every build, preview builds included,
 *     and always the PRODUCTION domain (shortest custom domain, else the *.vercel.app one), so
 *     preview deployments canonicalise to production instead of to themselves.
 *
 * A bare host ('example.com') is accepted and given `https://`. Returns '' when nothing is set:
 * the absolute tags are then omitted and `scripts/verify-prerender.mjs` reports it.
 */
export function resolveSiteUrlFromEnvironment(env: NodeJS.ProcessEnv = process.env): string {
  const candidates = [env['SITE_URL'], SITE.siteUrl, env['VERCEL_PROJECT_PRODUCTION_URL']];
  for (const candidate of candidates) {
    const value = candidate?.trim();
    if (!value) {
      continue;
    }
    const url = normalizeSiteUrl(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    if (url) {
      return url;
    }
  }
  return '';
}
