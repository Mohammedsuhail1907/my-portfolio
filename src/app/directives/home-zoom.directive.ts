import { AfterViewInit, DestroyRef, Directive, ElementRef, NgZone, inject } from '@angular/core';

/** Fallback when the `--home-zoom-max` token (see _tokens.scss) can't be read. */
const DEFAULT_MAX_SCALE = 1.6;
/** Progress at which the page starts fading out; it is gone at 1. */
const FADE_FROM = 0.55;
/** Per-frame share of the remaining distance the zoom origin moves towards the pointer. */
const ORIGIN_FOLLOW = 0.15;
/** Origin movement (px) below which the follow is considered settled. */
const ORIGIN_SETTLED = 0.5;
/** Arms the runway + sticky pin in _motion.scss; only added when the zoom actually runs. */
const PINNED_CLASS = 'home-zoom--pinned';

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));
const smoothstep = (t: number): number => {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
};

/**
 * Scroll-driven, pinned zoom for the Home page. Apply to the stage wrapper around the Home
 * section; the section pins inside it and the section's direct `.container` child is what zooms.
 *
 * Nothing here plays on its own — the effect is scrubbed by the scroll position, so it runs the
 * same for a mouse wheel, a trackpad, a touch drag or a dragged scrollbar, in both directions.
 * On init the directive arms the stage with `home-zoom--pinned` (_motion.scss): the stage grows
 * a runway of `--home-zoom-distance` viewport-heights below the section, and the section becomes
 * `position: sticky`. Scrolling through the runway holds the page visually fixed while progress
 * runs 0 → 1: the container scales from 1 to `--home-zoom-max` (accelerating, so small scrolls
 * zoom a little and longer ones a lot) and the page fades out over the last part — the visitor
 * moves INTO the page rather than past it. Only when the zoom completes does the next section
 * scroll in beneath it in normal flow — no blank frame, no hard swap, and no scroll hijacking:
 * the pin is pure CSS geometry, so native scrolling (and its momentum) is never interfered with.
 * Scrolling back reverses it exactly: the page zooms back out and, at the top, is normal again.
 *
 * A page taller than the viewport (the stacked mobile layout) pins by its bottom edge instead
 * (`--home-zoom-pin-top`, set here), so the visitor first scrolls through all of it and the zoom
 * begins only at its end.
 *
 * The zoom is anchored to the pointer: `transform-origin` is the last mouse position in the
 * container's own coordinates, so the visitor zooms into what they are pointing at. The origin
 * follows the pointer with a short lerp (jumping it while scaled would shift the content). Touch
 * devices, or no pointer yet, zoom from the centre of the viewport.
 *
 * Only `transform`, `opacity` and `visibility` change (the last so the invisible, fully-zoomed
 * page can't be clicked or tabbed into while the next section arrives), written once per
 * animation frame from passive listeners registered outside Angular's zone; the frame loop stops
 * as soon as there is nothing left to settle. Inert under `prefers-reduced-motion` — the stage is
 * never armed, so the page stays in normal flow with no dead scroll distance — and it disarms
 * itself if the preference flips mid-visit.
 */
@Directive({
  selector: '[appHomeZoom]',
  host: { class: 'home-zoom' },
})
export class HomeZoomDirective implements AfterViewInit {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);

  private section: HTMLElement | null = null;
  private container: HTMLElement | null = null;
  private maxScale = DEFAULT_MAX_SCALE;

  // Untransformed layout geometry (px), refreshed on resize.
  /** Scroll distance over which the pinned page is scrubbed from progress 0 to 1. */
  private runway = 1;
  /** Scroll covered before the pin engages (pages taller than the viewport). */
  private pinOffset = 0;
  private containerTop = 0;
  private containerLeft = 0;

  /** Last mouse position (viewport px); NaN means "use the viewport centre". */
  private pointerX = Number.NaN;
  private pointerY = Number.NaN;
  private originX = 0;
  private originY = 0;
  private originSet = false;

  private frame = 0;
  private zooming = false;

  ngAfterViewInit(): void {
    const stage = this.host.nativeElement;
    const reduceMotion =
      typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;
    const section = stage.querySelector<HTMLElement>(':scope > section');
    const container = section?.querySelector<HTMLElement>(':scope > .container') ?? null;
    if (
      !reduceMotion ||
      reduceMotion.matches ||
      !section ||
      !container ||
      typeof requestAnimationFrame !== 'function'
    ) {
      return;
    }
    this.section = section;
    this.container = container;
    this.readTokens();
    stage.classList.add(PINNED_CLASS);
    this.measure();

    // Scroll and pointer events are frequent; none of them needs change detection.
    this.zone.runOutsideAngular(() => {
      window.addEventListener('scroll', this.schedule, { passive: true });
      window.addEventListener('resize', this.onResize, { passive: true });
      if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
        window.addEventListener('pointermove', this.onPointerMove, { passive: true });
      }
      // The first change can only be reduce turning on (it was off above): return to normal flow.
      reduceMotion.addEventListener?.('change', this.disarm, { once: true });
      this.schedule();
    });

    this.destroyRef.onDestroy(() => {
      this.teardown();
      reduceMotion.removeEventListener?.('change', this.disarm);
    });
  }

  private readonly onPointerMove = (event: PointerEvent): void => {
    if (event.pointerType !== 'mouse') {
      return;
    }
    this.pointerX = event.clientX;
    this.pointerY = event.clientY;
    if (this.zooming) {
      this.schedule();
    }
  };

  private readonly onResize = (): void => {
    this.measure();
    this.schedule();
  };

  private readonly schedule = (): void => {
    if (this.frame === 0) {
      this.frame = requestAnimationFrame(this.tick);
    }
  };

  private readonly tick = (): void => {
    this.frame = 0;
    const stage = this.host.nativeElement;
    const section = this.section;
    const container = this.container;
    if (!section || !container) {
      return;
    }

    // Both rects are plain layout geometry: the stage never pins nor transforms, and of the
    // section only its .container child is transformed.
    const scrolled = -stage.getBoundingClientRect().top;
    const progress = clamp01((scrolled - this.pinOffset) / this.runway);
    const sectionRect = section.getBoundingClientRect();

    // Zoom origin: the pointer (or the viewport centre) in the container's own coordinates.
    const pointerX = Number.isNaN(this.pointerX) ? window.innerWidth / 2 : this.pointerX;
    const pointerY = Number.isNaN(this.pointerY) ? window.innerHeight / 2 : this.pointerY;
    const targetX = pointerX - (sectionRect.left + this.containerLeft);
    const targetY = pointerY - (sectionRect.top + this.containerTop);
    if (!this.originSet || progress === 0) {
      // At scale 1 the origin is invisible, so it can snap to the pointer freely.
      this.originX = targetX;
      this.originY = targetY;
      this.originSet = true;
    } else {
      this.originX += (targetX - this.originX) * ORIGIN_FOLLOW;
      this.originY += (targetY - this.originY) * ORIGIN_FOLLOW;
    }

    const scale = 1 + progress * progress * (this.maxScale - 1);
    const opacity = 1 - smoothstep((progress - FADE_FROM) / (1 - FADE_FROM));

    container.style.transformOrigin = `${this.originX.toFixed(1)}px ${this.originY.toFixed(1)}px`;
    container.style.transform = progress === 0 ? '' : `scale(${scale.toFixed(4)})`;
    section.style.opacity = progress === 0 ? '' : opacity.toFixed(3);
    // Fully zoomed, the page is invisible but still pinned beneath the arriving next section:
    // keep it out of hit-testing and the tab order until the visitor scrolls back.
    section.style.visibility = progress >= 1 ? 'hidden' : '';
    this.zooming = progress > 0;
    stage.classList.toggle('is-zooming', this.zooming);

    // Keep going only while the origin is still catching up with the pointer.
    const settled =
      Math.abs(targetX - this.originX) < ORIGIN_SETTLED &&
      Math.abs(targetY - this.originY) < ORIGIN_SETTLED;
    if (this.zooming && !settled) {
      this.schedule();
    }
  };

  private measure(): void {
    const stage = this.host.nativeElement;
    const section = this.section;
    const container = this.container;
    if (!section || !container) {
      return;
    }
    // A page taller than the viewport pins by its bottom edge, so the zoom starts only once the
    // visitor has scrolled through all of it.
    this.pinOffset = Math.max(0, section.offsetHeight - window.innerHeight);
    stage.style.setProperty('--home-zoom-pin-top', `${-this.pinOffset}px`);
    // The runway is whatever the pinning CSS added below the section (see _motion.scss).
    this.runway = Math.max(1, stage.offsetHeight - section.offsetHeight);
    // The section is positioned, so these are relative to it.
    this.containerTop = container.offsetTop;
    this.containerLeft = container.offsetLeft;
  }

  /** Reduced motion turned on mid-visit: stop and hand the page back to normal flow. */
  private readonly disarm = (): void => {
    this.teardown();
    const stage = this.host.nativeElement;
    stage.classList.remove(PINNED_CLASS, 'is-zooming');
    stage.style.removeProperty('--home-zoom-pin-top');
    if (this.section) {
      this.section.style.opacity = '';
      this.section.style.visibility = '';
    }
    if (this.container) {
      this.container.style.transform = '';
      this.container.style.transformOrigin = '';
    }
    // A frame scheduled before the teardown bails out on the cleared refs.
    this.section = null;
    this.container = null;
  };

  private teardown(): void {
    window.removeEventListener('scroll', this.schedule);
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('pointermove', this.onPointerMove);
    if (this.frame !== 0) {
      cancelAnimationFrame(this.frame);
      this.frame = 0;
    }
  }

  private readTokens(): void {
    const style = getComputedStyle(this.host.nativeElement);
    const maxScale = Number.parseFloat(style.getPropertyValue('--home-zoom-max'));
    if (maxScale > 1) {
      this.maxScale = maxScale;
    }
  }
}
