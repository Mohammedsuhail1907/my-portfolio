import { ViewportScroller } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ScrollTop } from 'primeng/scrolltop';
import { Toast } from 'primeng/toast';
import { FooterComponent } from './pages/footer/footer.component';
import { HeaderComponent } from './pages/header/header.component';
import { NavigationService } from './services/navigation.service';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  imports: [HeaderComponent, FooterComponent, RouterOutlet, Toast, ScrollTop],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private readonly navigation = inject(NavigationService);

  constructor() {
    // Instantiate eagerly so the persisted/system theme is applied as soon as the app boots.
    inject(ThemeService);
    // Router anchor scrolling uses window.scrollTo, which ignores CSS scroll-padding, so the
    // fixed-header offset is applied here instead.
    inject(ViewportScroller).setOffset([0, this.navigation.headerHeight() + 16]);
  }
}
