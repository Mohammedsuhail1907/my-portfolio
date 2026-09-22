import { DOCUMENT, Injectable, computed, effect, inject, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'portfolio-theme';
const DARK_CLASS = 'app-dark';
const THEME_COLOR: Record<Theme, string> = { light: '#ffffff', dark: '#020617' };

/**
 * Light/dark theme state.
 *
 * - Follows the OS preference until the visitor chooses explicitly; the choice is persisted.
 * - Applies the `.app-dark` class on <html>, which drives both the design tokens and PrimeNG's
 *   `darkModeSelector` (see app.config.ts). index.html sets the same class before first paint.
 * - Cross-fades colours by adding `.theme-transition` for one beat (see _motion.scss).
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly media =
    typeof matchMedia === 'function' ? matchMedia('(prefers-color-scheme: dark)') : null;

  private hasStoredPreference = this.readStored() !== null;

  readonly theme = signal<Theme>(this.readStored() ?? (this.media?.matches ? 'dark' : 'light'));
  readonly isDark = computed(() => this.theme() === 'dark');

  constructor() {
    effect(() => this.apply(this.theme()));
    this.media?.addEventListener('change', (event) => {
      if (!this.hasStoredPreference) {
        this.theme.set(event.matches ? 'dark' : 'light');
      }
    });
  }

  toggle(): void {
    this.set(this.isDark() ? 'light' : 'dark');
  }

  set(theme: Theme): void {
    this.hasStoredPreference = true;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Storage may be unavailable (private mode); the choice simply won't persist.
    }
    this.withTransition(() => this.theme.set(theme));
  }

  private apply(theme: Theme): void {
    const root = this.document.documentElement;
    root.classList.toggle(DARK_CLASS, theme === 'dark');
    this.document
      .querySelector<HTMLMetaElement>('meta[name="theme-color"]')
      ?.setAttribute('content', THEME_COLOR[theme]);
  }

  private withTransition(update: () => void): void {
    const root = this.document.documentElement;
    const reduceMotion =
      typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      update();
      return;
    }
    root.classList.add('theme-transition');
    update();
    setTimeout(() => root.classList.remove('theme-transition'), 500);
  }

  private readStored(): Theme | null {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      return value === 'dark' || value === 'light' ? value : null;
    } catch {
      return null;
    }
  }
}
