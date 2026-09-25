import { DOCUMENT, Injectable, computed, effect, inject, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

/** Viewport point (px) the theme reveal expands from — normally the centre of the toggle. */
export interface ThemeOrigin {
  x: number;
  y: number;
}

const STORAGE_KEY = 'portfolio-theme';
const DARK_CLASS = 'app-dark';
/** Held on <html> while the circular reveal runs (see _motion.scss). */
const REVEAL_CLASS = 'theme-reveal';
/** Fallback cross-fade: held on <html> for `FADE_MS` (see _motion.scss). */
const FADE_CLASS = 'theme-transition';
const FADE_MS = 500;
const THEME_COLOR: Record<Theme, string> = { light: '#ffffff', dark: '#020617' };

/**
 * Light/dark theme state.
 *
 * - Follows the OS preference until the visitor chooses explicitly; the choice is persisted.
 * - Applies the `.app-dark` class on <html>, which drives both the design tokens and PrimeNG's
 *   `darkModeSelector` (see app.config.ts). index.html sets the same class before first paint.
 * - Animates the switch: a circular reveal of the new scheme from the toggle where the View
 *   Transitions API is available, otherwise a plain colour cross-fade. Neither runs under
 *   `prefers-reduced-motion`.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly media =
    typeof matchMedia === 'function' ? matchMedia('(prefers-color-scheme: dark)') : null;

  private hasStoredPreference = this.readStored() !== null;
  /** Identifies the latest reveal so a superseded one does not tear down the running one. */
  private revealId = 0;

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

  toggle(origin?: ThemeOrigin): void {
    this.set(this.isDark() ? 'light' : 'dark', origin);
  }

  set(theme: Theme, origin?: ThemeOrigin): void {
    this.hasStoredPreference = true;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Storage may be unavailable (private mode); the choice simply won't persist.
    }
    this.withTransition(theme, origin);
  }

  private apply(theme: Theme): void {
    const root = this.document.documentElement;
    root.classList.toggle(DARK_CLASS, theme === 'dark');
    this.document
      .querySelector<HTMLMetaElement>('meta[name="theme-color"]')
      ?.setAttribute('content', THEME_COLOR[theme]);
  }

  private withTransition(theme: Theme, origin?: ThemeOrigin): void {
    const root = this.document.documentElement;
    const reduceMotion =
      typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      this.theme.set(theme);
      return;
    }

    if (origin && typeof this.document.startViewTransition === 'function') {
      this.reveal(theme, origin);
      return;
    }

    root.classList.add(FADE_CLASS);
    this.theme.set(theme);
    setTimeout(() => root.classList.remove(FADE_CLASS), FADE_MS);
  }

  /** Circular reveal of the new scheme, growing from `origin` until it reaches the farthest corner. */
  private reveal(theme: Theme, origin: ThemeOrigin): void {
    const root = this.document.documentElement;
    const id = ++this.revealId;
    const radius = Math.hypot(
      Math.max(origin.x, window.innerWidth - origin.x),
      Math.max(origin.y, window.innerHeight - origin.y),
    );

    root.style.setProperty('--theme-x', `${origin.x}px`);
    root.style.setProperty('--theme-y', `${origin.y}px`);
    root.style.setProperty('--theme-r', `${radius}px`);
    root.classList.add(REVEAL_CLASS);

    const transition = this.document.startViewTransition(() => {
      this.theme.set(theme);
      // The effect applies the class asynchronously; do it now so the "new" snapshot is captured
      // with the new scheme already in place.
      this.apply(theme);
    });

    const cleanup = (): void => {
      if (id !== this.revealId) {
        return;
      }
      root.classList.remove(REVEAL_CLASS);
      for (const property of ['--theme-x', '--theme-y', '--theme-r']) {
        root.style.removeProperty(property);
      }
    };
    transition.finished.then(cleanup, cleanup);
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
