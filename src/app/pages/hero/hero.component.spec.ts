import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { SITE } from '../../config/site.config';
import { Skill } from '../../models/portfolio-data.model';
import { NavigationService } from '../../services/navigation.service';
import { PortfolioDataService } from '../../services/portfolio-data.service';
import { HeroComponent } from './hero.component';

const FAKE_HIGHLIGHTS: Skill[] = [
  { name: 'Angular', level: 95, icon: 'angular' },
  { name: 'C#', level: 75 },
];

const FAKE_PORTFOLIO_DATA: Partial<PortfolioDataService> = {
  getHeroHighlights: () => of(FAKE_HIGHLIGHTS),
};

describe('HeroComponent', () => {
  let fixture: ComponentFixture<HeroComponent>;
  let element: HTMLElement;
  let navigation: NavigationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroComponent],
      providers: [{ provide: PortfolioDataService, useValue: FAKE_PORTFOLIO_DATA }],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroComponent);
    fixture.detectChanges();
    element = fixture.nativeElement;
    navigation = TestBed.inject(NavigationService);
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the name as the page h1 and the role and tagline verbatim', () => {
    expect(element.querySelector('h1#hero-title')?.textContent?.trim()).toBe(SITE.name);
    expect(element.querySelector('.hero__role')?.textContent?.trim()).toBe(SITE.role);
    expect(element.querySelector('.hero__tagline')?.textContent?.trim()).toBe(SITE.tagline);
  });

  it('scrolls to the contact section on click, without touching the URL', () => {
    const scrollSpy = spyOn(navigation, 'scrollTo');
    const before = location.href;

    const cta = Array.from(element.querySelectorAll<HTMLButtonElement>('button[pButton]')).find(
      (b) => b.textContent?.includes('Get In Touch'),
    );
    cta?.click();

    expect(scrollSpy).toHaveBeenCalledWith('contact');
    expect(location.href).toBe(before);
  });

  it('renders one chip per highlighted technology (from the data service) and every social link', () => {
    expect(element.querySelectorAll('.hero__tech li').length).toBe(FAKE_HIGHLIGHTS.length);
    const socials = Array.from(element.querySelectorAll<HTMLAnchorElement>('.hero__socials a'));
    expect(socials.map((a) => a.getAttribute('href'))).toEqual(SITE.socials.map((s) => s.url));
    expect(socials.every((a) => a.getAttribute('rel') === 'noopener noreferrer')).toBeTrue();
  });

  it('gives the portrait intrinsic dimensions and a descriptive alt', () => {
    const img = element.querySelector<HTMLImageElement>('.hero__portrait img');
    expect(img?.getAttribute('alt')).toBe(SITE.portrait.alt);
    expect(img?.getAttribute('width')).toBe('800');
    expect(img?.getAttribute('height')).toBe('1421');
  });
});
