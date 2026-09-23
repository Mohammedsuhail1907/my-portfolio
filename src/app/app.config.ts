import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, DOCUMENT, inject, provideZoneChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withViewTransitions } from '@angular/router';
import { MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import { AppPreset } from './config/app.preset';
import { isHomeRoute, routes } from './app.routes';

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
    provideHttpClient(),
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
