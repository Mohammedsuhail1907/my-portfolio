import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeZoomDirective } from './home-zoom.directive';

@Component({
  imports: [HomeZoomDirective],
  template: `
    <section
      appHomeZoom
      style="position: relative; height: 1000px; overflow: clip; --home-zoom-max: 1.6; --home-zoom-distance: 0.75"
    >
      <div class="container" style="height: 100%">Home</div>
    </section>
    <div style="height: 3000px"></div>
  `,
})
class HostComponent {}

/** Two frames: one for the scroll listener's frame, one to be safe. */
const nextFrames = (): Promise<void> =>
  new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

/** The scale factor in an inline `scale(...)` transform (the browser normalises the digits). */
const scaleOf = (element: HTMLElement): number =>
  Number(/scale\(([\d.]+)\)/.exec(element.style.transform)?.[1] ?? 1);

describe('HomeZoomDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let section: HTMLElement;
  let container: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    section = fixture.nativeElement.querySelector('section');
    container = section.querySelector('.container') as HTMLElement;
    window.scrollTo({ top: 0, behavior: 'instant' });
    await nextFrames();
  });

  afterEach(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  });

  it('is at rest at the top: no transform, origin at the viewport centre', () => {
    expect(container.style.transform).toBe('');
    expect(section.style.opacity).toBe('');
    expect(container.style.transformOrigin).toMatch(/^\d+(\.\d+)?px \d+(\.\d+)?px$/);
  });

  it('scales with scroll progress (accelerating) and reverses when scrolling back', async () => {
    const sectionTop = section.getBoundingClientRect().top + window.scrollY;

    // Half-way through the zoom distance (0.75 × 1000px): scale = 1 + 0.5² × 0.6 = 1.15.
    window.scrollTo({ top: sectionTop + 375, behavior: 'instant' });
    window.dispatchEvent(new Event('scroll'));
    await nextFrames();
    expect(scaleOf(container)).toBeCloseTo(1.15, 3);
    expect(section.classList.contains('is-zooming')).toBeTrue();
    expect(Number(section.style.opacity)).toBe(1);

    // Past the zoom distance: maximum scale, faded out.
    window.scrollTo({ top: sectionTop + 900, behavior: 'instant' });
    window.dispatchEvent(new Event('scroll'));
    await nextFrames();
    expect(scaleOf(container)).toBeCloseTo(1.6, 3);
    expect(Number(section.style.opacity)).toBe(0);

    // Back to the top: fully reversed.
    window.scrollTo({ top: 0, behavior: 'instant' });
    window.dispatchEvent(new Event('scroll'));
    await nextFrames();
    expect(container.style.transform).toBe('');
    expect(section.style.opacity).toBe('');
    expect(section.classList.contains('is-zooming')).toBeFalse();
  });
});
