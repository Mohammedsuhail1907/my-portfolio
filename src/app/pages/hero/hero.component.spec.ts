import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SITE } from '../../config/site.config';
import { HERO_HIGHLIGHTS } from '../../data/skills.data';
import { HeroComponent } from './hero.component';

describe('HeroComponent', () => {
  let fixture: ComponentFixture<HeroComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroComponent);
    fixture.detectChanges();
    element = fixture.nativeElement;
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the name as the page h1 and the role and tagline verbatim', () => {
    expect(element.querySelector('h1#hero-title')?.textContent?.trim()).toBe(SITE.name);
    expect(element.querySelector('.hero__role')?.textContent?.trim()).toBe(SITE.role);
    expect(element.querySelector('.hero__tagline')?.textContent?.trim()).toBe(SITE.tagline);
  });

  it('links the primary call to action to the contact section', () => {
    const cta = Array.from(element.querySelectorAll<HTMLAnchorElement>('a[pButton]')).find(
      (a) => a.textContent?.includes('Get In Touch'),
    );
    expect(cta?.getAttribute('href')).toBe('/home#contact');
  });

  it('renders one chip per highlighted technology and every social link', () => {
    expect(element.querySelectorAll('.hero__tech li').length).toBe(HERO_HIGHLIGHTS.length);
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
