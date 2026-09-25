import { DOCUMENT, Injectable, inject } from '@angular/core';
import { SectionDef, homeSections } from '../config/site.config';

/** Section id of the Home page (the hero). */
const HOME_ID = 'home';
/** Destination classes of the Home → page transition (see "Page navigation" in _motion.scss). */
const ENTER_PENDING_CLASS = 'page-enter-pending';
const ENTER_CLASS = 'page-enter';
/** Name of the entrance keyframes in _motion.scss. */
const ENTER_ANIMATION = 'page-enter';
/** Fallback for browsers without `scrollend`: how long a smooth scroll is allowed to take. */
const SCROLL_SETTLE_MS = 1200;
/** Share of the viewport, top and bottom, outside the band that counts as "still on Home". */
const BAND_MARGIN = 0.25;

/**
 * Section navigation for the single-page layout.
 *
 * This app has exactly one route (the root). Every "navigation" link therefore just scrolls the
 * current page to a section's element — it is a plain button click, not a Router navigation or a
 * URL fragment, so the address bar always stays at the site root (see AppComponent /
 * app.routes.ts). `items` are the navigable sections (hidden sections are excluded automatically).
 *
 * Leaving the Home page is cinematic: the smooth scroll travels the pinned zoom runway, so it
 * drives the Home page's zoom (HomeZoomDirective), and the destination is held zoomed out and
 * hidden while the page scrolls, then zooms into the viewport once the scroll settles.
 * Navigation between any other two sections is a plain scroll, and nothing is staged under
 * `prefers-reduced-motion`.
 */
@Injectable({ providedIn: 'root' })
export class NavigationService {
  private readonly document = inject(DOCUMENT);
  /** Undoes a staged entrance that has not played yet (a newer navigation superseded it). */
  private cancelEntrance: (() => void) | null = null;

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
    const reduceMotion =
      typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!reduceMotion && id !== HOME_ID && this.isHomeInFocus()) {
      this.stageEntrance(element);
    }

    // A section inside a zoom stage (Home) may currently be pinned partway down its runway, so
    // its own rect is not where it rests; the stage, plain flow, marks the real destination.
    const anchor = element.closest<HTMLElement>('.home-zoom') ?? element;
    const top = anchor.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: Math.max(0, top), behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  /** True while the Home page still occupies the middle half of the viewport. */
  private isHomeInFocus(): boolean {
    const home = this.document.getElementById(HOME_ID);
    if (!home) {
      return false;
    }
    const { top, bottom } = home.getBoundingClientRect();
    const inset = window.innerHeight * BAND_MARGIN;
    return bottom > inset && top < window.innerHeight - inset;
  }

  /**
   * Hides the destination (zoomed out) for the duration of the scroll, then plays its entrance
   * once the scroll settles — `scrollend` where supported, a timer otherwise — so it zooms into
   * the viewport on arrival rather than mid-flight. The entrance class is removed again when its
   * animation ends, so a later navigation can replay it.
   */
  private stageEntrance(section: HTMLElement): void {
    this.cancelEntrance?.();
    section.classList.add(ENTER_PENDING_CLASS);

    let timer: ReturnType<typeof setTimeout>;

    const onAnimationEnd = (event: AnimationEvent): void => {
      if (event.animationName === ENTER_ANIMATION) {
        section.classList.remove(ENTER_CLASS);
        section.removeEventListener('animationend', onAnimationEnd);
      }
    };
    const settle = (): void => {
      clearTimeout(timer);
      window.removeEventListener('scrollend', arrive);
      this.cancelEntrance = null;
    };
    const arrive = (): void => {
      settle();
      section.classList.remove(ENTER_PENDING_CLASS);
      section.classList.add(ENTER_CLASS);
      section.addEventListener('animationend', onAnimationEnd);
    };

    timer = setTimeout(arrive, SCROLL_SETTLE_MS);
    window.addEventListener('scrollend', arrive, { once: true });
    this.cancelEntrance = () => {
      settle();
      section.classList.remove(ENTER_PENDING_CLASS, ENTER_CLASS);
      section.removeEventListener('animationend', onAnimationEnd);
    };
  }
}
