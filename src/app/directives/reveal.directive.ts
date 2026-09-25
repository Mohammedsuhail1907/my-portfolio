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
 * Dispatched on `window` (a CustomEvent with detail `{ root: HTMLElement }`) to make every
 * reveal inside `root` play again. NavigationService fires it when a navigation from Home
 * arrives, so the destination's components cascade in instead of standing already revealed
 * behind the page entrance.
 */
export const REVEAL_REPLAY_EVENT = 'app-reveal-replay';

/**
 * How far past the viewport (top and bottom) the host must FULLY leave before its reveal
 * re-arms. The margin is what keeps small back-and-forth scrolling from ever replaying an
 * entrance — only genuinely scrolling away and coming back does.
 */
const REARM_MARGIN = '25% 0px 25% 0px';

/**
 * Reveals the host when it enters the viewport (IntersectionObserver), by toggling `is-visible`.
 * The transitions themselves live in `src/styles/_motion.scss`.
 *
 * Usage:
 *   <div appReveal>                       fade + translate up (default)
 *   <div appReveal="fade">                fade only  ('scale' | 'left' | 'right' also available)
 *   <ul appReveal revealStagger>          children with class `reveal-item` and `[style.--i]="$index"`
 *                                         (items take `reveal-item--left/right/scale` modifiers)
 *   <div appReveal [revealDelay]="120">   extra delay in ms
 *
 * The delay is exposed as the inherited `--reveal-delay` custom property, so a staggered group's
 * items (and any reveal nested inside a delayed one) start after it — that is how each section's
 * hierarchy is choreographed: heading first (no delay), then body groups, then their items.
 *
 * Reveals replay: once the host has fully left a well-padded viewport (`REARM_MARGIN`), the
 * reveal re-arms, so scrolling back to a section plays its entrance again — but a tiny scroll
 * jiggle never does. A `REVEAL_REPLAY_EVENT` on `window` replays every reveal inside the event's
 * `root` immediately (see NavigationService).
 *
 * Respects `prefers-reduced-motion` (content shows immediately, nothing ever replays) and
 * degrades gracefully when IntersectionObserver is unavailable.
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
    '[style.--reveal-delay]': 'delay() ? delay() + "ms" : null',
  },
})
export class RevealDirective implements OnInit, OnDestroy {
  readonly variant = input<RevealVariant>('', { alias: 'appReveal' });
  readonly stagger = input(false, { alias: 'revealStagger', transform: booleanAttribute });
  readonly delay = input(0, { alias: 'revealDelay', transform: numberAttribute });

  protected readonly visible = signal(false);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private showObserver: IntersectionObserver | null = null;
  private rearmObserver: IntersectionObserver | null = null;

  ngOnInit(): void {
    const reduceMotion =
      typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion || typeof IntersectionObserver === 'undefined') {
      this.visible.set(true);
      return;
    }

    const element = this.host.nativeElement;
    this.showObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          this.visible.set(true);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );
    // Separate observer for re-arming: it fires "gone" only when the host has completely left
    // the padded viewport, which can never overlap with the show observer's "entered".
    this.rearmObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => !entry.isIntersecting)) {
          this.visible.set(false);
        }
      },
      { rootMargin: REARM_MARGIN },
    );
    this.showObserver.observe(element);
    this.rearmObserver.observe(element);
    window.addEventListener(REVEAL_REPLAY_EVENT, this.onReplay);
  }

  ngOnDestroy(): void {
    this.showObserver?.disconnect();
    this.rearmObserver?.disconnect();
    this.showObserver = null;
    this.rearmObserver = null;
    window.removeEventListener(REVEAL_REPLAY_EVENT, this.onReplay);
  }

  /** Replays this reveal when the event's root contains the host (and motion is allowed). */
  private readonly onReplay = (event: Event): void => {
    const root = (event as CustomEvent<{ root?: HTMLElement }>).detail?.root;
    const element = this.host.nativeElement;
    if (!this.showObserver || !root?.contains(element)) {
      return;
    }
    this.visible.set(false);
    // Re-observing re-delivers the current intersection on the next frame, so a host that is in
    // the viewport transitions straight back in (with its stagger delays) rather than waiting
    // for a fresh threshold crossing.
    this.showObserver.unobserve(element);
    this.showObserver.observe(element);
  };
}
