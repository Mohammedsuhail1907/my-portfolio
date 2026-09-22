import { DOCUMENT, Injectable, OnDestroy, inject, signal } from '@angular/core';
import { SectionDef, homeSections } from '../config/site.config';

/**
 * Section navigation for the single-page layout.
 *
 * This app has exactly one route (the root). Every "navigation" link therefore just scrolls the
 * current page to a section's element — it is a plain button click, not a Router navigation or a
 * URL fragment, so the address bar always stays at the site root (see AppComponent /
 * app.routes.ts). `scrollTo` accounts for the fixed header itself, since there is no
 * router-driven anchor scrolling to do it for us.
 *
 * - `items` are the navigable sections (hidden sections are excluded automatically).
 * - `activeSection` is kept in sync with the section currently under the header (scroll-spy);
 *   HomeComponent calls `observe()` after its sections render.
 */
/** Distance below the header at which the scroll-spy probe line sits. */
const PROBE_OFFSET = 32;
/** Extra breathing room below the header when landing on a section. */
const SCROLL_GAP = 16;

@Injectable({ providedIn: 'root' })
export class NavigationService implements OnDestroy {
  private readonly document = inject(DOCUMENT);
  private observer: IntersectionObserver | null = null;
  private observedIds: string[] = [];
  private resizeTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly onResize = (): void => {
    if (this.resizeTimer !== null) {
      clearTimeout(this.resizeTimer);
    }
    this.resizeTimer = setTimeout(() => this.createObserver(), 200);
  };

  readonly items: SectionDef[] = homeSections();
  readonly activeSection = signal<string>('home');

  /** Start tracking which of the given section ids is in view. Safe to call repeatedly. */
  observe(ids: string[]): void {
    this.disconnect();
    if (typeof IntersectionObserver === 'undefined') {
      return;
    }
    this.observedIds = ids;
    this.createObserver();
    window.addEventListener('resize', this.onResize, { passive: true });
  }

  disconnect(): void {
    this.observer?.disconnect();
    this.observer = null;
    window.removeEventListener('resize', this.onResize);
    if (this.resizeTimer !== null) {
      clearTimeout(this.resizeTimer);
      this.resizeTimer = null;
    }
  }

  /**
   * The observer's root is shrunk to a 1px line just below the header; sections are contiguous,
   * so exactly one of them crosses that line at any time and it is the active one. Rebuilt on
   * resize because rootMargin is fixed in pixels.
   */
  private createObserver(): void {
    this.observer?.disconnect();
    const lineTop = this.headerHeight() + PROBE_OFFSET;
    const lineBottom = Math.max(0, window.innerHeight - lineTop - 1);
    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.activeSection.set((entry.target as HTMLElement).id);
          }
        }
      },
      { rootMargin: `-${lineTop}px 0px -${lineBottom}px 0px`, threshold: 0 },
    );
    for (const id of this.observedIds) {
      const element = this.document.getElementById(id);
      if (element) {
        this.observer.observe(element);
      }
    }
  }

  /**
   * Scroll to a section, clearing the fixed header. This is the ONLY section-navigation
   * mechanism in the app — it never touches `location` (no path, no `#fragment`, no history
   * entry), which is what keeps the browser's address bar unchanged while navigating.
   */
  scrollTo(id: string): void {
    const element = this.document.getElementById(id);
    if (!element) {
      return;
    }
    const top = element.getBoundingClientRect().top + window.scrollY - this.headerHeight() - SCROLL_GAP;
    const reduceMotion =
      typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: Math.max(0, top), behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  /** Current header height in px, read from the `--header-h` token. */
  headerHeight(): number {
    const rootStyle = getComputedStyle(this.document.documentElement);
    const raw = rootStyle.getPropertyValue('--header-h').trim();
    const value = parseFloat(raw);
    if (Number.isNaN(value)) {
      return 64;
    }
    return raw.endsWith('rem') ? value * parseFloat(rootStyle.fontSize) : value;
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
