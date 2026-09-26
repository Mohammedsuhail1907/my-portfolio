import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { SITE_URL } from './seo/site-url.token';
import { resolveSiteUrlFromEnvironment } from './seo/site-url.server';

/**
 * Providers for the build-time prerender only (see main.server.ts). Everything else is shared
 * with the browser through `appConfig`.
 */
const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    // The public origin baked into canonical / og:url / JSON-LD. Resolved from the build
    // environment (Vercel exposes the production domain), so no per-deploy code change is needed.
    { provide: SITE_URL, useFactory: resolveSiteUrlFromEnvironment },
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
