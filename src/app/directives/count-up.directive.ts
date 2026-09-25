import { Directive, ElementRef, OnDestroy, OnInit, inject, input } from '@angular/core';
import { REVEAL_REARM_MARGIN, REVEAL_REPLAY_EVENT } from './reveal.directive';

/** Splits e.g. '1,250+' into ['', '1,250', '+']; null when there is no number to count. */
const NUMERIC = /^(\D*?)(\d[\d,]*)(.*)$/;

/**
 * Counts a stat up from zero once it scrolls into view: `<span [appCountUp]="'5+'"></span>`.
 *
 * The final value is written immediately, so the number is correct without JavaScript timing
 * (tests, reduced motion, no IntersectionObserver) and screen readers never meet a half-count.
 * Prefix/suffix text around the number ('+', '%', 'k') is kept; a thousands separator is
 * preserved if the source has one.
 *
 * The count is choreographed with the reveal around it (the About stat tiles): it starts at the
 * tile's first visible pixel, re-arms once the tile has fully left the same padded viewport the
 * reveal uses (`REVEAL_REARM_MARGIN`, so both replay together on the way back), and restarts on
 * `REVEAL_REPLAY_EVENT` — a navigation from Home therefore counts up while the tile cascades
 * in, never invisibly beneath the held-back page entrance. At rest the element always shows the
 * final value.
 */
@Directive({
  selector: '[appCountUp]',
})
export class CountUpDirective implements OnInit, OnDestroy {
  readonly value = input.required<string>({ alias: 'appCountUp' });
  /** Animation length in ms. */
  readonly duration = input(1400, { alias: 'countUpDuration' });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private startObserver: IntersectionObserver | null = null;
  private rearmObserver: IntersectionObserver | null = null;
  private frame = 0;
  /** Armed = the next first-visible-pixel starts the count. */
  private armed = true;
  /** Starts (or restarts) the count; null until a countable value is parsed. */
  private begin: (() => void) | null = null;

  ngOnInit(): void {
    const element = this.host.nativeElement;
    const raw = this.value();
    element.textContent = raw;

    const match = NUMERIC.exec(raw);
    const reduceMotion =
      typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!match || reduceMotion || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const [, prefix, digits, suffix] = match;
    const target = Number(digits.replace(/,/g, ''));
    const grouped = digits.includes(',');
    const format = (n: number): string =>
      `${prefix}${grouped ? n.toLocaleString('en-US') : n}${suffix}`;
    this.begin = () => this.animate(format, target);

    // Fires at the first visible pixel — before the tile's own reveal transition — so the count
    // starts while the tile is still fading in and never shows the final value first. Each
    // observer watches one element, so only a batched delivery's LAST entry is current.
    this.startObserver = new IntersectionObserver(
      (entries) => {
        if (this.armed && entries[entries.length - 1].isIntersecting) {
          this.armed = false;
          this.begin?.();
        }
      },
      { threshold: 0 },
    );
    // Re-arms once fully out of the padded viewport; the final value keeps standing while the
    // tile is away, and the next first visible pixel counts it up from zero again.
    this.rearmObserver = new IntersectionObserver(
      (entries) => {
        if (!entries[entries.length - 1].isIntersecting) {
          this.armed = true;
          this.cancel();
        }
      },
      { rootMargin: REVEAL_REARM_MARGIN },
    );
    this.startObserver.observe(element);
    this.rearmObserver.observe(element);
    window.addEventListener(REVEAL_REPLAY_EVENT, this.onReplay);
  }

  ngOnDestroy(): void {
    this.startObserver?.disconnect();
    this.rearmObserver?.disconnect();
    this.startObserver = null;
    this.rearmObserver = null;
    window.removeEventListener(REVEAL_REPLAY_EVENT, this.onReplay);
    this.cancel();
  }

  /** Restarts the count in sync with the surrounding reveal's replay (see NavigationService). */
  private readonly onReplay = (event: Event): void => {
    const root = (event as CustomEvent<{ root?: HTMLElement }>).detail?.root;
    if (!this.begin || !root?.contains(this.host.nativeElement)) {
      return;
    }
    this.armed = false;
    this.begin();
  };

  private animate(format: (n: number) => string, target: number): void {
    this.cancel();
    const element = this.host.nativeElement;
    const duration = this.duration();
    const start = performance.now();

    const tick = (now: number): void => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      element.textContent = format(Math.round(target * eased));
      this.frame = t < 1 ? requestAnimationFrame(tick) : 0;
    };
    this.frame = requestAnimationFrame(tick);
  }

  private cancel(): void {
    if (this.frame !== 0) {
      cancelAnimationFrame(this.frame);
      this.frame = 0;
    }
  }
}
