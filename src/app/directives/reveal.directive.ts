import {
  Directive,
  ElementRef,
  OnDestroy,
  OnInit,
  booleanAttribute,
  inject,
  input,
  numberAttribute,
  signal,
} from '@angular/core';

export type RevealVariant = '' | 'up' | 'fade' | 'scale' | 'left' | 'right';

/**
 * Reveals the host once it enters the viewport (IntersectionObserver), by toggling `is-visible`.
 * The transitions themselves live in `src/styles/_motion.scss`.
 *
 * Usage:
 *   <div appReveal>                       fade + translate up (default)
 *   <div appReveal="fade">                fade only  ('scale' | 'left' | 'right' also available)
 *   <ul appReveal revealStagger>          children with class `reveal-item` and `[style.--i]="$index"`
 *   <div appReveal [revealDelay]="120">   extra delay in ms
 *
 * Respects `prefers-reduced-motion` (content shows immediately) and degrades gracefully when
 * IntersectionObserver is unavailable.
 */
@Directive({
  selector: '[appReveal]',
  host: {
    '[class.reveal]': '!stagger()',
    '[class.reveal-group]': 'stagger()',
    '[class.reveal--fade]': 'variant() === "fade"',
    '[class.reveal--scale]': 'variant() === "scale"',
    '[class.reveal--left]': 'variant() === "left"',
    '[class.reveal--right]': 'variant() === "right"',
    '[class.is-visible]': 'visible()',
    '[style.transition-delay.ms]': 'delay() || null',
  },
})
export class RevealDirective implements OnInit, OnDestroy {
  readonly variant = input<RevealVariant>('', { alias: 'appReveal' });
  readonly stagger = input(false, { alias: 'revealStagger', transform: booleanAttribute });
  readonly delay = input(0, { alias: 'revealDelay', transform: numberAttribute });

  protected readonly visible = signal(false);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private observer: IntersectionObserver | null = null;

  ngOnInit(): void {
    const reduceMotion =
      typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion || typeof IntersectionObserver === 'undefined') {
      this.visible.set(true);
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          this.visible.set(true);
          this.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );
    this.observer.observe(this.host.nativeElement);
  }

  ngOnDestroy(): void {
    this.disconnect();
  }

  private disconnect(): void {
    this.observer?.disconnect();
    this.observer = null;
  }
}
