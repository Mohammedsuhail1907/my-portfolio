import { AfterViewInit, DestroyRef, Directive, ElementRef, NgZone, inject } from '@angular/core';

/** Fallbacks when the `--home-zoom-*` tokens (see _tokens.scss) can't be read. */
const DEFAULT_MAX_SCALE = 1.6;
const DEFAULT_DISTANCE = 0.75;
/** Progress at which the page starts fading out; it is gone at 1. */
const FADE_FROM = 0.55;
/** Per-frame share of the remaining distance the zoom origin moves towards the pointer. */
const ORIGIN_FOLLOW = 0.15;
/** Origin movement (px) below which the follow is considered settled. */
const ORIGIN_SETTLED = 0.5;

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));
const smoothstep = (t: number): number => {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
};

/**
 * Scroll-driven zoom for the Home page. Apply to the Home section; its direct `.container` child
 * is what zooms.
 *
 * Nothing here plays on its own — the effect is scrubbed by the scroll position. Scrolling away
 * from Home maps to a progress of 0 → 1 over `--home-zoom-distance` of the section's height:
 * the container scales from 1 to `--home-zoom-max` (accelerating, so small scrolls zoom a
 * little and longer ones a lot) and the page fades out over the last part, while the next
 * section slides in beneath it in normal flow — no blank frame, no hard swap. Scrolling back
 * reverses it exactly, so returning to Home starts from the zoomed state and zooms out.
 *
 * The zoom is anchored to the pointer: `transform-origin` is the last mouse position in the
 * container's own coordinates, so the visitor zooms into what they are pointing at. The origin
 * follows the pointer with a short lerp (jumping it while scaled would shift the content). Touch
 * devices, or no pointer yet, zoom from the centre of the viewport.
 *
 * Only `transform` and `opacity` change, written once per animation frame from passive
 * listeners registered outside Angular's zone; the frame loop stops as soon as there is nothing
 * left to settle. Inert under `prefers-reduced-motion`, leaving normal scrolling.
 */
@Directive({
  selector: '[appHomeZoom]',
  host: { class: 'home-zoom' },
})
export class HomeZoomDirective implements AfterViewInit {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);

  private container: HTMLElement | null = null;
  private maxScale = DEFAULT_MAX_SCALE;
  private distance = DEFAULT_DISTANCE;

  // Untransformed layout geometry (document px), refreshed on resize.
  private sectionTop = 0;
  private sectionLeft = 0;
  private sectionHeight = 1;
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
    const reduceMotion =
      typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    const container = this.host.nativeElement.querySelector<HTMLElement>(':scope > .container');
    if (reduceMotion || !container || typeof requestAnimationFrame !== 'function') {
      return;
    }
    this.container = container;
    this.readTokens();
    this.measure();

    // Scroll and pointer events are frequent; none of them needs change detection.
    this.zone.runOutsideAngular(() => {
      window.addEventListener('scroll', this.schedule, { passive: true });
      window.addEventListener('resize', this.onResize, { passive: true });
      if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
        window.addEventListener('pointermove', this.onPointerMove, { passive: true });
      }
      this.schedule();
    });

    this.destroyRef.onDestroy(() => {
      window.removeEventListener('scroll', this.schedule);
      window.removeEventListener('resize', this.onResize);
      window.removeEventListener('pointermove', this.onPointerMove);
      if (this.frame !== 0) {
        cancelAnimationFrame(this.frame);
      }
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
    const section = this.host.nativeElement;
    const container = this.container;
    if (!container) {
      return;
    }

    const scrollY = window.scrollY;
    const progress = clamp01((scrollY - this.sectionTop) / (this.sectionHeight * this.distance));

    // Zoom origin: the pointer (or the viewport centre) in the container's own coordinates.
    const pointerX = Number.isNaN(this.pointerX) ? window.innerWidth / 2 : this.pointerX;
    const pointerY = Number.isNaN(this.pointerY) ? window.innerHeight / 2 : this.pointerY;
    const targetX = pointerX - (this.sectionLeft - window.scrollX + this.containerLeft);
    const targetY = pointerY - (this.sectionTop - scrollY + this.containerTop);
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
    this.zooming = progress > 0;
    section.classList.toggle('is-zooming', this.zooming);

    // Keep going only while the origin is still catching up with the pointer.
    const settled =
      Math.abs(targetX - this.originX) < ORIGIN_SETTLED &&
      Math.abs(targetY - this.originY) < ORIGIN_SETTLED;
    if (this.zooming && !settled) {
      this.schedule();
    }
  };

  /** The section itself is never transformed, so its rect is plain layout geometry. */
  private measure(): void {
    const section = this.host.nativeElement;
    const container = this.container;
    if (!container) {
      return;
    }
    const rect = section.getBoundingClientRect();
    this.sectionTop = rect.top + window.scrollY;
    this.sectionLeft = rect.left + window.scrollX;
    this.sectionHeight = Math.max(1, section.offsetHeight);
    // The section is positioned, so these are relative to it.
    this.containerTop = container.offsetTop;
    this.containerLeft = container.offsetLeft;
  }

  private readTokens(): void {
    const style = getComputedStyle(this.host.nativeElement);
    const maxScale = Number.parseFloat(style.getPropertyValue('--home-zoom-max'));
    const distance = Number.parseFloat(style.getPropertyValue('--home-zoom-distance'));
    if (maxScale > 1) {
      this.maxScale = maxScale;
    }
    if (distance > 0) {
      this.distance = distance;
    }
  }
}
