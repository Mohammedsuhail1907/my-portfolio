import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Render mode per route for the build-time prerender (see angular.json `outputMode: "static"`).
 *
 * Every route is pre-rendered to a static HTML file. Parameterised routes added later
 * (`projects/:slug`, …) must list their parameter values through `getPrerenderParams`, e.g.
 *
 *   { path: 'projects/:slug', renderMode: RenderMode.Prerender,
 *     getPrerenderParams: async () => PROJECTS.map((p) => ({ slug: p.slug })) }
 *
 * `redirectTo` routes are skipped automatically, so the client `'**'` redirect needs no entry.
 */
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
