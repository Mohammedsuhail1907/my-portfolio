import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { SERVICE_OFFERINGS } from '../../data/services.data';
import { ServicesComponent } from './services.component';

describe('ServicesComponent', () => {
  let fixture: ComponentFixture<ServicesComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServicesComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(ServicesComponent);
    fixture.detectChanges();
    element = fixture.nativeElement;
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders one card per offering with its title, description and icon', () => {
    const cards = Array.from(element.querySelectorAll('.services-grid__item'));
    expect(cards.length).toBe(SERVICE_OFFERINGS.length);

    cards.forEach((card, i) => {
      expect(card.querySelector('.service-card__title')?.textContent?.trim()).toBe(
        SERVICE_OFFERINGS[i].title,
      );
      expect(card.querySelector('.service-card__desc')?.textContent?.trim()).toBe(
        SERVICE_OFFERINGS[i].description,
      );
      expect(card.querySelector('.service-card__icon i')?.className).toContain(
        SERVICE_OFFERINGS[i].icon,
      );
    });
  });

  it('staggers the cards with cycling entrance directions (left, scale, right)', () => {
    const cards = Array.from(element.querySelectorAll<HTMLElement>('.services-grid__item'));
    cards.forEach((card, i) => {
      expect(card.classList.contains('reveal-item')).toBeTrue();
      expect(card.style.getPropertyValue('--i')).toBe(`${i}`);
      expect(card.classList.contains('reveal-item--left')).toBe(i % 3 === 0);
      expect(card.classList.contains('reveal-item--scale')).toBe(i % 3 === 1);
      expect(card.classList.contains('reveal-item--right')).toBe(i % 3 === 2);
    });
  });
});
