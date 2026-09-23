import { ActivatedRouteSnapshot, Routes } from '@angular/router';
import { SITE } from './config/site.config';

/** Path of the Home page — the site root. */
export const HOME_PATH = '';

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
    title: `${SITE.name} — ${SITE.role}`,
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
