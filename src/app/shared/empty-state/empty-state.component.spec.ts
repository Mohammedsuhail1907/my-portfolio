import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { EmptyStateComponent } from './empty-state.component';

@Component({
  imports: [EmptyStateComponent],
  template: `<app-empty-state icon="pi pi-folder-open" message="Nothing here" hint="Try later" />`,
})
class HostComponent {}

describe('EmptyStateComponent', () => {
  it('renders the icon, message and hint', async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.empty-state__icon i')?.className).toContain('pi-folder-open');
    expect(el.querySelector('.empty-state__message')?.textContent?.trim()).toBe('Nothing here');
    expect(el.querySelector('.empty-state__hint')?.textContent?.trim()).toBe('Try later');
  });
});
