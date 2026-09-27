import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig, DOCUMENT, inject, provideZoneChangeDetection } from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { TitleStrategy, provideRouter, withViewTransitions } from '@angular/router';
import { MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import { AppPreset } from './config/app.preset';
import { isHomeRoute, routes } from './app.routes';
import { SeoTitleStrategy } from './seo/seo-title.strategy';

/** <html> classes that scope the route transition keyframes (see _motion.scss). */
const ROUTE_HOME_EXIT_CLASS = 'route-home-exit';
const ROUTE_HOME_ENTER_CLASS = 'route-home-enter';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      // Route changes animate only when they leave or return to the Home page — it recedes from
      // the screen, or zooms back in — and every other route change is left exactly as it is.
      // The initial navigation is skipped so it doesn't compete with the page landing. There is
      // only one route today; this is ready for any page added later.
      withViewTransitions({
        skipInitialTransition: true,
        onViewTransitionCreated: ({ transition, from, to }) => {
          const fromHome = isHomeRoute(from);
          const toHome = isHomeRoute(to);
          const reduceMotion =
            typeof matchMedia === 'function' &&
            matchMedia('(prefers-reduced-motion: reduce)').matches;
          if (fromHome === toHome || reduceMotion) {
            transition.skipTransition();
            return;
          }
          const root = inject(DOCUMENT).documentElement;
          const className = fromHome ? ROUTE_HOME_EXIT_CLASS : ROUTE_HOME_ENTER_CLASS;
          root.classList.add(className);
          const cleanup = (): void => root.classList.remove(className);
          transition.finished.then(cleanup, cleanup);
        },
      }),
    ),
    // The pages are pre-rendered at build time (angular.json `outputMode: "static"`). Hydration
    // reuses that server DOM instead of re-creating it, and replays clicks made before the app
    // booted. The HTTP transfer cache (on by default) ships portfolio.json's response inside the
    // HTML, so the browser renders the same "ready" state as the prerender without a request.
    provideClientHydration(withEventReplay()),
    // `fetch` is the only HTTP backend that works during the Node prerender; the build serves
    // relative asset URLs (assets/data/portfolio.json) to it from the output directory.
    provideHttpClient(withFetch()),
    // Applies each route's title + `data.seo` to the <head> on every navigation (see app/seo).
    { provide: TitleStrategy, useClass: SeoTitleStrategy },
    provideAnimationsAsync(),
    providePrimeNG({
      ripple: true,
      inputVariant: 'outlined',
      theme: {
        preset: AppPreset,
        options: {
          darkModeSelector: '.app-dark',
          cssLayer: false,
        },
      },
    }),
    MessageService,
  ],
};
