import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeZoomDirective } from './home-zoom.directive';

// The Karma build loads the real global stylesheet, so arming the stage (`home-zoom--pinned`,
// added by the directive) creates the actual runway spacer and sticky pin from _motion.scss —
// the tests below therefore exercise the real pin geometry, not a re-implementation. The runway
// length is viewport-relative, so expectations are computed from the measured layout.
@Component({
  imports: [HomeZoomDirective],
  template: `
    <div appHomeZoom style="--home-zoom-max: 1.6">
      <section style="height: 100px; overflow: clip">
        <div class="container" style="height: 100%">Home</div>
      </section>
    </div>
    <div style="height: 5000px"></div>
  `,
})
class HostComponent {}

// A section taller than the viewport (the stacked mobile hero) pins by its bottom edge.
@Component({
  imports: [HomeZoomDirective],
  template: `
    <div appHomeZoom>
      <section [style.height.px]="sectionHeight" style="overflow: clip">
        <div class="container" style="height: 100%">Home</div>
      </section>
    </div>
    <div style="height: 5000px"></div>
  `,
})
class TallHostComponent {
  readonly sectionHeight = window.innerHeight + 300;
}

/** Two frames: one for the scroll listener's frame, one to be safe. */
const nextFrames = (): Promise<void> =>
  new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

/** The scale factor in an inline `scale(...)` transform (the browser normalises the digits). */
const scaleOf = (element: HTMLElement): number =>
  Number(/scale\(([\d.]+)\)/.exec(element.style.transform)?.[1] ?? 1);

const scrollAndSettle = async (top: number): Promise<void> => {
  window.scrollTo({ top, behavior: 'instant' });
  window.dispatchEvent(new Event('scroll'));
  await nextFrames();
};

describe('HomeZoomDirective', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent, TallHostComponent],
    }).compileComponents();
    window.scrollTo({ top: 0, behavior: 'instant' });
  });

  afterEach(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  });

  describe('with a page that fits the viewport', () => {
    let fixture: ComponentFixture<HostComponent>;
    let stage: HTMLElement;
    let section: HTMLElement;
    let container: HTMLElement;
    /** Scroll distance that scrubs progress 0 → 1 (the CSS runway spacer). */
    let runway: number;
    let stageTop: number;

    beforeEach(async () => {
      fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();
      stage = fixture.nativeElement.querySelector('[appHomeZoom]');
      section = stage.querySelector('section') as HTMLElement;
      container = section.querySelector('.container') as HTMLElement;
      await nextFrames();
      runway = stage.offsetHeight - section.offsetHeight;
      stageTop = stage.getBoundingClientRect().top + window.scrollY;
    });

    it('arms the pin and is at rest at the top: a runway, no transform, origin set', () => {
      expect(stage.classList.contains('home-zoom--pinned')).toBeTrue();
      expect(stage.style.getPropertyValue('--home-zoom-pin-top')).toBe('0px');
      expect(runway).toBeGreaterThan(0);
      expect(container.style.transform).toBe('');
      expect(section.style.opacity).toBe('');
      expect(container.style.transformOrigin).toMatch(/^-?\d+(\.\d+)?px -?\d+(\.\d+)?px$/);
    });

    it('holds the page pinned while the scroll scrubs the zoom, then reverses exactly', async () => {
      // Half-way down the runway: pinned to the viewport top, scale = 1 + 0.5² × 0.6 = 1.15,
      // not yet fading.
      await scrollAndSettle(stageTop + runway / 2);
      expect(Math.abs(section.getBoundingClientRect().top)).toBeLessThan(2);
      expect(scaleOf(container)).toBeCloseTo(1.15, 2);
      expect(stage.classList.contains('is-zooming')).toBeTrue();
      expect(Number(section.style.opacity)).toBe(1);
      expect(section.style.visibility).toBe('');

      // Past the runway: maximum scale, faded out, and untouchable while the next content
      // scrolls in over it.
      await scrollAndSettle(stageTop + runway + 50);
      expect(scaleOf(container)).toBeCloseTo(1.6, 3);
      expect(Number(section.style.opacity)).toBe(0);
      expect(section.style.visibility).toBe('hidden');

      // Back to the top: fully reversed.
      await scrollAndSettle(0);
      expect(container.style.transform).toBe('');
      expect(section.style.opacity).toBe('');
      expect(section.style.visibility).toBe('');
      expect(stage.classList.contains('is-zooming')).toBeFalse();
    });
  });

  describe('with a page taller than the viewport', () => {
    it('pins by the bottom edge and starts the zoom only past the overflow', async () => {
      const fixture = TestBed.createComponent(TallHostComponent);
      fixture.detectChanges();
      const stage: HTMLElement = fixture.nativeElement.querySelector('[appHomeZoom]');
      const section = stage.querySelector('section') as HTMLElement;
      const container = section.querySelector('.container') as HTMLElement;
      await nextFrames();
      const runway = stage.offsetHeight - section.offsetHeight;
      const stageTop = stage.getBoundingClientRect().top + window.scrollY;

      // The 300px of the page below the fold must scroll by before the pin and the zoom start.
      expect(stage.style.getPropertyValue('--home-zoom-pin-top')).toBe('-300px');
      await scrollAndSettle(stageTop + 300);
      expect(container.style.transform).toBe('');

      // Half-way down the runway the page hangs pinned by its bottom edge, zooming.
      await scrollAndSettle(stageTop + 300 + runway / 2);
      expect(Math.abs(section.getBoundingClientRect().top + 300)).toBeLessThan(2);
      expect(scaleOf(container)).toBeCloseTo(1.15, 2);
    });
  });
});
