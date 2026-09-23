import { Component, inject } from '@angular/core';
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
  constructor() {
    // Instantiate eagerly so the persisted/system theme is applied as soon as the app boots.
    inject(ThemeService);

    // This is a single-page portfolio: section navigation scrolls in place and never touches the
    // URL (see NavigationService.scrollTo). Clean up a leftover #fragment from an old bookmark or
    // shared link so the address bar always shows just the origin. replaceState neither creates a
    // history entry nor triggers navigation.
    if (location.hash) {
      history.replaceState(null, '', location.pathname + location.search);
    }
  }
}
