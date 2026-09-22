import { Routes } from '@angular/router';
import { SITE } from './config/site.config';

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
    path: '',
    title: `${SITE.name} — ${SITE.role}`,
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  { path: '**', redirectTo: '' },
];
