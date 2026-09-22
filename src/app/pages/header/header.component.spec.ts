import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { SITE } from '../../config/site.config';
import { NavigationService } from '../../services/navigation.service';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let element: HTMLElement;
  let navigation: NavigationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();
    element = fixture.nativeElement;
    navigation = TestBed.inject(NavigationService);
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the brand and one button per navigable section', () => {
    const items = navigation.items;
    expect(element.querySelector('.site-header__brand')?.textContent?.trim()).toBe(SITE.name);

    const links = Array.from(element.querySelectorAll<HTMLButtonElement>('.site-header__link'));
    expect(links.map((btn) => btn.textContent?.trim())).toEqual(items.map((i) => i.label));
    // Plain buttons, not links — nothing here is a real hyperlink.
    expect(links.every((btn) => btn.tagName === 'BUTTON')).toBeTrue();
  });

  it('scrolls to the clicked section without changing the URL', () => {
    const scrollSpy = spyOn(navigation, 'scrollTo');
    const before = location.href;
    const items = navigation.items;

    const links = Array.from(element.querySelectorAll<HTMLButtonElement>('.site-header__link'));
    links[1]?.click();

    expect(scrollSpy).toHaveBeenCalledWith(items[1].id);
    expect(location.href).toBe(before);
  });

  it('scrolls to home when the brand is clicked', () => {
    const scrollSpy = spyOn(navigation, 'scrollTo');
    element.querySelector<HTMLButtonElement>('.site-header__brand')?.click();
    expect(scrollSpy).toHaveBeenCalledWith('home');
  });

  it('exposes accessible theme and menu controls', () => {
    const theme = element.querySelector('button[aria-label^="Switch to"]');
    const menu = element.querySelector('button[aria-controls="site-drawer"]');
    expect(theme).toBeTruthy();
    expect(menu?.getAttribute('aria-expanded')).toBe('false');
  });
});
