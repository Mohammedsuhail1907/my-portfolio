import { TestBed } from '@angular/core/testing';
import { AmbientBackgroundComponent } from './ambient-background.component';

describe('AmbientBackgroundComponent', () => {
  it('is decorative: hidden from assistive tech, with the grid and three blobs', async () => {
    await TestBed.configureTestingModule({ imports: [AmbientBackgroundComponent] }).compileComponents();
    const fixture = TestBed.createComponent(AmbientBackgroundComponent);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.getAttribute('aria-hidden')).toBe('true');
    expect(el.querySelector('.ambient__grid')).toBeTruthy();
    expect(el.querySelectorAll('.ambient__blob').length).toBe(3);
  });
});
