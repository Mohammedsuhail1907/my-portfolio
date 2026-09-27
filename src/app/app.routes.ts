import { ActivatedRouteSnapshot, Routes } from '@angular/router';
import { SITE } from './config/site.config';
import { PageSeo } from './seo/seo.model';
import { homeStructuredData } from './seo/structured-data';

/** Path of the Home page — the site root. */
export const HOME_PATH = '';

/**
 * Search / social contract of the Home page, applied on navigation by SeoTitleStrategy and
 * baked into the pre-rendered HTML at build time (see app/seo).
 *
 * Note on the card size: `summary_large_image` asks scrapers for a wide (≈1.91:1) banner, but
 * the share image here is the 800×1421 portrait, so X and WhatsApp centre-crop it to a band
 * across the middle. Switch this back to 'summary' for an uncropped square thumbnail, or point
 * `image` at a purpose-made 1200×630 card to use the wide slot properly.
 */
const HOME_SEO: PageSeo = {
  description: SITE.seo.description,
  socialDescription: SITE.seo.socialDescription,
  image: SITE.portrait.src,
  imageAlt: SITE.portrait.alt,
  imageWidth: SITE.portrait.width,
  imageHeight: SITE.portrait.height,
  type: 'website',
  twitterCard: 'summary_large_image',
  robots: 'index, follow',
  jsonLd: homeStructuredData,
};

/**
 * A single route.
 *
 * This is a one-page portfolio — every section lives on this one page and section navigation
 * scrolls in place (see NavigationService.scrollTo); there is nothing to route BETWEEN. The
 * route below exists only so the page can still be lazy-loaded and the browser tab gets a title;
 * it is the site root and never shows up in the address bar. Any other path (an old bookmark to
 * a since-removed page, a typo) redirects back here rather than 404ing.
 */
export const routes: Routes = [
  {
    path: HOME_PATH,
    title: `${SITE.name} | ${SITE.role}`,
    data: { seo: HOME_SEO },
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  { path: '**', redirectTo: HOME_PATH },
];

/** True when a navigation snapshot resolves to the Home page (scopes the route transitions). */
export function isHomeRoute(snapshot: ActivatedRouteSnapshot): boolean {
  let leaf = snapshot;
  while (leaf.firstChild) {
    leaf = leaf.firstChild;
  }
  return leaf.routeConfig?.path === HOME_PATH;
}
