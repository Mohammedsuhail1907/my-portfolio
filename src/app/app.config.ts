import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  ActivatedRouteSnapshot,
  ViewTransitionInfo,
  provideRouter,
  withInMemoryScrolling,
  withRouterConfig,
  withViewTransitions,
} from '@angular/router';
import { MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import { AppPreset } from './config/app.preset';
import { routes } from './app.routes';

/** Route path of the innermost activated child (e.g. 'home', 'about'). */
function primaryPath(snapshot: ActivatedRouteSnapshot): string {
  let node: ActivatedRouteSnapshot | null = snapshot;
  while (node?.firstChild) {
    node = node.firstChild;
  }
  return node?.routeConfig?.path ?? '';
}

/** Only animate real page changes — fragment jumps within the same page scroll instead. */
function skipSamePageTransitions({ transition, from, to }: ViewTransitionInfo): void {
  if (primaryPath(from) === primaryPath(to)) {
    transition.skipTransition();
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }),
      withRouterConfig({ onSameUrlNavigation: 'reload' }),
      withViewTransitions({
        skipInitialTransition: true,
        onViewTransitionCreated: skipSamePageTransitions,
      }),
    ),
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
