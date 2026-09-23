import { DOCUMENT, Injectable, inject } from '@angular/core';
import { SectionDef, homeSections } from '../config/site.config';

/**
 * Section navigation for the single-page layout.
 *
 * This app has exactly one route (the root). Every "navigation" link therefore just scrolls the
 * current page to a section's element — it is a plain button click, not a Router navigation or a
 * URL fragment, so the address bar always stays at the site root (see AppComponent /
 * app.routes.ts). `items` are the navigable sections (hidden sections are excluded automatically).
 */
@Injectable({ providedIn: 'root' })
export class NavigationService {
  private readonly document = inject(DOCUMENT);

  readonly items: SectionDef[] = homeSections();

  /**
   * Scroll a section to the top of the viewport. This is the ONLY section-navigation mechanism
   * in the app — it never touches `location` (no path, no `#fragment`, no history entry), which
   * is what keeps the browser's address bar unchanged while navigating.
   */
  scrollTo(id: string): void {
    const element = this.document.getElementById(id);
    if (!element) {
      return;
    }
    const top = element.getBoundingClientRect().top + window.scrollY;
    const reduceMotion =
      typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: Math.max(0, top), behavior: reduceMotion ? 'auto' : 'smooth' });
  }
}
