import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CountUpDirective } from './count-up.directive';

@Component({
  imports: [CountUpDirective],
  template: `<span class="stat" [appCountUp]="value()"></span>`,
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
});
