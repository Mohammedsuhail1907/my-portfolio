import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SITE } from '../../config/site.config';
import { NavigationService } from '../../services/navigation.service';
import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  let fixture: ComponentFixture<FooterComponent>;
  let element: HTMLElement;
  let navigation: NavigationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    fixture.detectChanges();
    element = fixture.nativeElement;
    navigation = TestBed.inject(NavigationService);
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('keeps the root class NavigationService replays reveals through', () => {
    expect(element.querySelector('footer.site-footer')).not.toBeNull();
  });

  it('renders the brand name and tagline', () => {
    expect(element.querySelector('.site-footer__brand')?.textContent?.trim()).toBe(SITE.name);
    expect(element.querySelector('.site-footer__tagline')?.textContent?.trim()).toBe(SITE.footerTagline);
  });

  it('renders the copyright with the current year', () => {
    const year = new Date().getFullYear().toString();
    const copyright = element.querySelector('.site-footer__copyright')?.textContent ?? '';
    expect(copyright).toContain(year);
    expect(copyright).toContain(SITE.name);
    expect(copyright).toContain('All rights reserved.');
  });

  it('renders a quick-link button for every navigable section that scrolls without changing the URL', () => {
    const items = navigation.items;
    const scrollSpy = spyOn(navigation, 'scrollTo');
    const before = location.href;

    const quick = Array.from(
      element.querySelectorAll<HTMLButtonElement>('nav[aria-labelledby="footer-links-title"] button'),
    );
    expect(quick.map((btn) => btn.textContent?.trim())).toEqual(items.map((i) => i.label));

    quick[0]?.click();
    expect(scrollSpy).toHaveBeenCalledWith(items[0].id);
    expect(location.href).toBe(before);
  });

  it('scrolls to home when "Back to top" is clicked', () => {
    const scrollSpy = spyOn(navigation, 'scrollTo');
    const top = element.querySelector<HTMLButtonElement>('.site-footer__top');
    expect(top?.textContent?.trim()).toBe('Back to top');
    top?.click();
    expect(scrollSpy).toHaveBeenCalledWith('home');
  });

  it('lists the services with an icon each, as plain text rather than links', () => {
    const services = Array.from(element.querySelectorAll<HTMLElement>('.site-footer__list > li'));
    expect(services.map((li) => li.textContent?.trim())).toEqual([
      'Web Development',
      'Web Application Development',
      'Mobile Apps',
    ]);
    expect(services.every((li) => li.querySelector('i.pi') !== null)).toBeTrue();
    expect(services.some((li) => li.querySelector('a, button') !== null)).toBeFalse();
  });

  it('has only the brand, quick links and services groups — no Connect or contact section', () => {
    const headings = Array.from(element.querySelectorAll('h3')).map((h) => h.textContent?.trim());
    expect(headings).toEqual(['Quick Links', 'Services']);
    expect(element.querySelector('a[href]')).toBeNull();
    expect(element.textContent).not.toContain(SITE.email);
    expect(element.textContent).not.toContain(SITE.phone);
  });
});
