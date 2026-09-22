import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SITE } from '../../config/site.config';
import { NavigationService } from '../../services/navigation.service';
import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  let fixture: ComponentFixture<FooterComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    fixture.detectChanges();
    element = fixture.nativeElement;
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the copyright with the current year', () => {
    const year = new Date().getFullYear().toString();
    const copyright = element.querySelector('.site-footer__copyright')?.textContent ?? '';
    expect(copyright).toContain(year);
    expect(copyright).toContain(SITE.name);
  });

  it('renders quick links for every navigable section and a back-to-top link', () => {
    const items = TestBed.inject(NavigationService).items;
    const quick = Array.from(
      element.querySelectorAll<HTMLAnchorElement>('nav[aria-labelledby="footer-links-title"] a'),
    );
    expect(quick.map((a) => a.getAttribute('href'))).toEqual(items.map((i) => `/home#${i.id}`));
    expect(element.querySelector('.site-footer__top')?.getAttribute('href')).toBe('/home#home');
  });

  it('marks external links as noopener', () => {
    const external = Array.from(element.querySelectorAll<HTMLAnchorElement>('a[target="_blank"]'));
    expect(external.length).toBe(SITE.socials.length);
    expect(external.every((a) => a.getAttribute('rel') === 'noopener noreferrer')).toBeTrue();
  });
});
