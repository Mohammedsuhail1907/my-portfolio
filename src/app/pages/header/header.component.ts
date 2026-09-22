import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { TooltipModule } from 'primeng/tooltip';
import { SITE } from '../../config/site.config';
import { NavigationService } from '../../services/navigation.service';
import { ThemeService } from '../../services/theme.service';

/** Scroll offset (px) past which the header gains its border and shadow. */
const SCROLLED_AFTER = 8;

/**
 * Fixed site header: brand, primary section links (desktop), theme toggle and a right-hand
 * drawer menu for small screens. Links are plain buttons that call `NavigationService.scrollTo`
 * — this is a single-page app, so nothing here is a real hyperlink or changes the URL. Scroll-spy
 * state comes from NavigationService and the colour scheme from ThemeService.
 */
@Component({
  selector: 'app-header',
  imports: [ButtonModule, DrawerModule, TooltipModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  protected readonly navigation = inject(NavigationService);
  protected readonly theme = inject(ThemeService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly site = SITE;

  /** True once the page is scrolled past the top; drives the border/shadow state. */
  protected readonly scrolled = signal(false);
  /** Two-way bound to the drawer's `visible` input. */
  protected readonly menuOpen = signal(false);
  /** Set when the drawer has actually shown; triggers the staggered item entrance. */
  protected readonly drawerShown = signal(false);

  protected readonly themeIcon = computed(() => (this.theme.isDark() ? 'pi pi-sun' : 'pi pi-moon'));
  protected readonly themeLabel = computed(() =>
    this.theme.isDark() ? 'Switch to light theme' : 'Switch to dark theme',
  );

  constructor() {
    afterNextRender(() => this.trackScroll());
  }

  protected isActive(id: string): boolean {
    return this.navigation.activeSection() === id;
  }

  protected openMenu(): void {
    this.menuOpen.set(true);
  }

  /** Closes the drawer (link clicks). */
  protected closeMenu(): void {
    this.menuOpen.set(false);
    this.drawerShown.set(false);
  }

  protected onDrawerShow(): void {
    this.drawerShown.set(true);
  }

  protected onDrawerHide(): void {
    this.drawerShown.set(false);
  }

  /** Passive scroll listener, throttled to one update per animation frame. */
  private trackScroll(): void {
    let frame = 0;

    const update = (): void => {
      frame = 0;
      this.scrolled.set(window.scrollY > SCROLLED_AFTER);
    };
    const onScroll = (): void => {
      if (frame === 0) {
        frame = requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    this.destroyRef.onDestroy(() => {
      window.removeEventListener('scroll', onScroll);
      if (frame !== 0) {
        cancelAnimationFrame(frame);
      }
    });
  }
}
