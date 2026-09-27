import { isPlatformBrowser } from '@angular/common';
import { Component, PLATFORM_ID, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ScrollTop } from 'primeng/scrolltop';
import { Toast } from 'primeng/toast';
import { FooterComponent } from './pages/footer/footer.component';
import { ThemeService } from './services/theme.service';
import { AmbientBackgroundComponent } from './shared/ambient-background/ambient-background.component';
import { ThemeToggleComponent } from './shared/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-root',
  imports: [
    ThemeToggleComponent,
    AmbientBackgroundComponent,
    FooterComponent,
    RouterOutlet,
    Toast,
    ScrollTop,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  /**
   * The scroll-to-top button should not appear while the visitor is still inside the Home
   * page's pinned zoom runway (~1.75 viewport-heights of scroll during which the page LOOKS
   * like the top of the site) — only once the next section is well in view.
   */
  protected readonly scrollTopThreshold =
    typeof window === 'undefined' ? 600 : Math.round(window.innerHeight * 2.25);

  constructor() {
    // Instantiate eagerly so the persisted/system theme is applied as soon as the app boots.
    inject(ThemeService);

    // This is a single-page portfolio: section navigation scrolls in place and never touches the
    // URL (see NavigationService.scrollTo). Clean up a leftover #fragment from an old bookmark or
    // shared link so the address bar always shows just the origin. replaceState neither creates a
    // history entry nor triggers navigation. Browser only: the build-time prerender has no
    // `location` (and nothing to clean up).
    if (isPlatformBrowser(inject(PLATFORM_ID)) && location.hash) {
      history.replaceState(null, '', location.pathname + location.search);
    }
  }
}
