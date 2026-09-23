import { Directive, ElementRef, OnDestroy, OnInit, inject, input } from '@angular/core';

/** Splits e.g. '1,250+' into ['', '1,250', '+']; null when there is no number to count. */
const NUMERIC = /^(\D*?)(\d[\d,]*)(.*)$/;

/**
 * Counts a stat up from zero once it scrolls into view: `<span [appCountUp]="'5+'"></span>`.
 *
 * The final value is written immediately, so the number is correct without JavaScript timing
 * (tests, reduced motion, no IntersectionObserver) and screen readers never meet a half-count.
 * Prefix/suffix text around the number ('+', '%', 'k') is kept; a thousands separator is
 * preserved if the source has one.
 */
@Directive({
  selector: '[appCountUp]',
})
export class CountUpDirective implements OnInit, OnDestroy {
  readonly value = input.required<string>({ alias: 'appCountUp' });
  /** Animation length in ms. */
  readonly duration = input(1400, { alias: 'countUpDuration' });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private observer: IntersectionObserver | null = null;
  private frame = 0;

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

    // Fires at the first visible pixel — before the tile's own reveal transition — so the count
    // starts while the tile is still fading in and never shows the final value first.
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          this.disconnect();
          this.animate((n) => `${prefix}${grouped ? n.toLocaleString('en-US') : n}${suffix}`, target);
        }
      },
      { threshold: 0 },
    );
    this.observer.observe(element);
  }

  ngOnDestroy(): void {
    this.disconnect();
    if (this.frame !== 0) {
      cancelAnimationFrame(this.frame);
    }
  }

  private animate(format: (n: number) => string, target: number): void {
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

  private disconnect(): void {
    this.observer?.disconnect();
    this.observer = null;
  }
}
