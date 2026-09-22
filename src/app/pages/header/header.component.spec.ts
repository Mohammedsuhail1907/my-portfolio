import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { SITE } from '../../config/site.config';
import { NavigationService } from '../../services/navigation.service';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [provideRouter([]), provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();
    element = fixture.nativeElement;
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the brand and one real link per navigable section', () => {
    const items = TestBed.inject(NavigationService).items;
    expect(element.querySelector('.site-header__brand')?.textContent?.trim()).toBe(SITE.name);

    const links = Array.from(element.querySelectorAll<HTMLAnchorElement>('.site-header__link'));
    expect(links.map((a) => a.textContent?.trim())).toEqual(items.map((i) => i.label));
    expect(links.map((a) => a.getAttribute('href'))).toEqual(items.map((i) => `/home#${i.id}`));
  });

  it('exposes accessible theme and menu controls', () => {
    const theme = element.querySelector('button[aria-label^="Switch to"]');
    const menu = element.querySelector('button[aria-controls="site-drawer"]');
    expect(theme).toBeTruthy();
    expect(menu?.getAttribute('aria-expanded')).toBe('false');
  });
});
