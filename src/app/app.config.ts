import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import { AppPreset } from './config/app.preset';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
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
