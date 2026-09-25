import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { REVEAL_REPLAY_EVENT } from './reveal.directive';
import { CountUpDirective } from './count-up.directive';

@Component({
  imports: [CountUpDirective],
  template: `<span class="stat" [appCountUp]="value()" [countUpDuration]="400"></span>`,
})
class HostComponent {
  readonly value = signal('1,250+');
}

describe('CountUpDirective', () => {
  async function render(value: string): Promise<HTMLElement> {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.value.set(value);
    fixture.detectChanges();
    return fixture.nativeElement.querySelector('.stat');
  }

  it('writes the final value immediately, keeping separators and suffix', async () => {
    expect((await render('1,250+')).textContent).toBe('1,250+');
  });

  it('leaves values without a number untouched', async () => {
    expect((await render('∞')).textContent).toBe('∞');
  });

  it('restarts the count when a reveal replay targets an ancestor, and settles on the final value', async () => {
    const element = await render('1,250+');
    const nextFrame = (): Promise<void> =>
      new Promise((resolve) => requestAnimationFrame(() => resolve()));

    // A replay rooted elsewhere leaves the standing value alone.
    window.dispatchEvent(
      new CustomEvent(REVEAL_REPLAY_EVENT, { detail: { root: document.createElement('div') } }),
    );
    await nextFrame();
    expect(element.textContent).toBe('1,250+');

    // A replay rooted at an ancestor counts up from zero again…
    window.dispatchEvent(new CustomEvent(REVEAL_REPLAY_EVENT, { detail: { root: document.body } }));
    await nextFrame();
    await nextFrame();
    expect(element.textContent).not.toBe('1,250+');

    // …and lands back on the exact final value.
    await new Promise((resolve) => setTimeout(resolve, 700));
    expect(element.textContent).toBe('1,250+');
  });
});
