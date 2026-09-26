import { BootstrapContext, bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';

/**
 * Server entry used ONLY at build time: `ng build` (outputMode "static") boots the app once per
 * route in a Node worker, serialises the rendered DOM to `dist/.../browser/<route>/index.html`
 * and throws the server bundle away. Nothing here runs in production.
 */
const bootstrap = (context: BootstrapContext) => bootstrapApplication(AppComponent, config, context);

export default bootstrap;
