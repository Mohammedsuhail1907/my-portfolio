import { InjectionToken } from '@angular/core';
import { SITE } from '../config/site.config';

/** Trims and drops trailing slashes; '' unless the result is an absolute http(s) URL. */
export function normalizeSiteUrl(value: string | undefined | null): string {
  const trimmed = (value ?? '').trim().replace(/\/+$/, '');
  return /^https?:\/\/\S+$/i.test(trimmed) ? trimmed : '';
}

/** `path` relative to the site root → absolute URL; '' when the site URL is unknown. */
export function absoluteUrl(siteUrl: string, path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  return siteUrl ? `${siteUrl}/${path.replace(/^\/+/, '')}` : '';
}

/**
 * Public origin of the site, without a trailing slash — the base of every absolute URL in the
 * page head (canonical, og:url, og:image, JSON-LD).
 *
 * - Build-time prerender: provided from the environment in app.config.server.ts
 *   (`SITE_URL` → `SITE.siteUrl` → Vercel's `VERCEL_PROJECT_PRODUCTION_URL`).
 * - Browser: `SITE.siteUrl`, or the page's own origin — which, on the production deployment, is
 *   the same thing (previews are `noindex` on Vercel, so their origin never reaches an index).
 */
export const SITE_URL = new InjectionToken<string>('SITE_URL', {
  providedIn: 'root',
  factory: () =>
    normalizeSiteUrl(SITE.siteUrl) || (typeof location === 'undefined' ? '' : location.origin),
});
