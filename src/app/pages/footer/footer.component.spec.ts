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

  it('renders the copyright with the current year', () => {
    const year = new Date().getFullYear().toString();
    const copyright = element.querySelector('.site-footer__copyright')?.textContent ?? '';
    expect(copyright).toContain(year);
    expect(copyright).toContain(SITE.name);
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
    element.querySelector<HTMLButtonElement>('.site-footer__top')?.click();
    expect(scrollSpy).toHaveBeenCalledWith('home');
  });

  it('marks external links as noopener', () => {
    const external = Array.from(element.querySelectorAll<HTMLAnchorElement>('a[target="_blank"]'));
    expect(external.length).toBe(SITE.socials.length);
    expect(external.every((a) => a.getAttribute('rel') === 'noopener noreferrer')).toBeTrue();
  });
});
