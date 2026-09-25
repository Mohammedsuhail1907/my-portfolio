import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { REVEAL_REPLAY_EVENT, RevealDirective } from './reveal.directive';

@Component({
  imports: [RevealDirective],
  template: `
    <div class="wrap">
      <p class="target" appReveal>copy</p>
    </div>
    <div class="outside"></div>
  `,
})
class HostComponent {}

/**
 * Deterministic IntersectionObserver stand-in: tests drive the callbacks directly. The
 * directive creates the "show" observer first and the "re-arm" observer second.
 */
class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];
  readonly observed = new Set<Element>();
  readonly reobserved: Element[] = [];

  constructor(
    private readonly callback: IntersectionObserverCallback,
    readonly options?: IntersectionObserverInit,
  ) {
    FakeIntersectionObserver.instances.push(this);
  }

  observe(element: Element): void {
    if (!this.observed.has(element)) {
      this.reobserved.push(element);
    }
    this.observed.add(element);
  }

  unobserve(element: Element): void {
    this.observed.delete(element);
  }

  disconnect(): void {
    this.observed.clear();
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  /** Delivers a (possibly batched) sequence of intersection states, oldest first. */
  fire(states: boolean[]): void {
    const entries = states.map(
      (isIntersecting) => ({ isIntersecting }) as IntersectionObserverEntry,
    );
    this.callback(entries, this as unknown as IntersectionObserver);
  }
}

describe('RevealDirective', () => {
  const realIO = window.IntersectionObserver;
  let fixture: ComponentFixture<HostComponent>;
  let target: HTMLElement;

  const show = (): FakeIntersectionObserver => FakeIntersectionObserver.instances[0];
  const rearm = (): FakeIntersectionObserver => FakeIntersectionObserver.instances[1];
  const isVisible = (): boolean => target.classList.contains('is-visible');
  const replayOn = (root: Element): void => {
    window.dispatchEvent(new CustomEvent(REVEAL_REPLAY_EVENT, { detail: { root } }));
  };

  beforeEach(async () => {
    FakeIntersectionObserver.instances = [];
    (window as { IntersectionObserver: unknown }).IntersectionObserver = FakeIntersectionObserver;
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    target = fixture.nativeElement.querySelector('.target');
  });

  afterEach(() => {
    (window as { IntersectionObserver: unknown }).IntersectionObserver = realIO;
  });

  it('shows on intersection and re-arms only once fully out of the padded viewport', () => {
    expect(FakeIntersectionObserver.instances.length).toBe(2);
    expect(isVisible()).toBeFalse();

    show().fire([true]);
    fixture.detectChanges();
    expect(isVisible()).toBeTrue();

    // Still (partially) inside the padded viewport: no re-arm, no flicker.
    rearm().fire([true]);
    fixture.detectChanges();
    expect(isVisible()).toBeTrue();

    rearm().fire([false]);
    fixture.detectChanges();
    expect(isVisible()).toBeFalse();

    show().fire([true]);
    fixture.detectChanges();
    expect(isVisible()).toBeTrue();
  });

  it('reads only the LAST entry of a batched delivery (janky-frame out/in must not hide)', () => {
    show().fire([true]);
    fixture.detectChanges();

    // The host left and re-entered within one delivery: it ends on screen, so it stays shown.
    rearm().fire([false, true]);
    fixture.detectChanges();
    expect(isVisible()).toBeTrue();

    // And the mirror case: a show batch ending off screen must not reveal.
    rearm().fire([false]);
    show().fire([true, false]);
    fixture.detectChanges();
    expect(isVisible()).toBeFalse();
  });

  it('replays for a replay event whose root contains the host, and only then', () => {
    show().fire([true]);
    fixture.detectChanges();
    expect(isVisible()).toBeTrue();

    replayOn(fixture.nativeElement.querySelector('.outside'));
    fixture.detectChanges();
    expect(isVisible()).toBeTrue();

    replayOn(fixture.nativeElement.querySelector('.wrap'));
    fixture.detectChanges();
    expect(isVisible()).toBeFalse();
    // The show observer was re-pointed at the host so the current intersection re-delivers.
    expect(show().reobserved).toContain(target);

    show().fire([true]);
    fixture.detectChanges();
    expect(isVisible()).toBeTrue();
  });

  it('cleans up on destroy: observers disconnected, replay listener removed', () => {
    show().fire([true]);
    fixture.detectChanges();
    const wrap = fixture.nativeElement.querySelector('.wrap');

    fixture.destroy();
    expect(show().observed.size).toBe(0);
    expect(rearm().observed.size).toBe(0);
    // A replay after destroy must be a no-op (listener removed, no signal writes).
    expect(() => replayOn(wrap)).not.toThrow();
  });

  it('shows immediately and creates no observers under prefers-reduced-motion', async () => {
    TestBed.resetTestingModule();
    FakeIntersectionObserver.instances = [];
    spyOn(window, 'matchMedia').and.returnValue({ matches: true } as MediaQueryList);

    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    const reducedFixture = TestBed.createComponent(HostComponent);
    reducedFixture.detectChanges();
    const reducedTarget: HTMLElement = reducedFixture.nativeElement.querySelector('.target');

    expect(reducedTarget.classList.contains('is-visible')).toBeTrue();
    expect(FakeIntersectionObserver.instances.length).toBe(0);
  });
});
