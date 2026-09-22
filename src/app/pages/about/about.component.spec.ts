import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { ABOUT_INTRO, SERVICES, STATS } from '../../data/about.data';
import { AboutComponent } from './about.component';

describe('AboutComponent', () => {
  let fixture: ComponentFixture<AboutComponent>;
  let component: AboutComponent;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutComponent],
      providers: [provideRouter([]), provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(AboutComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the section heading and labels the landmark with it', () => {
    const section = element.querySelector('section#about');
    const heading = element.querySelector('h2#about-title');

    expect(heading?.textContent?.trim()).toBe('About Me');
    expect(section?.getAttribute('aria-labelledby')).toBe('about-title');
  });

  it('renders the intro copy verbatim', () => {
    const lead = element.querySelector('.about__lead');
    const paragraphs = Array.from(element.querySelectorAll('.about__paragraph')).map((p) =>
      p.textContent?.trim(),
    );

    expect(lead?.textContent?.trim()).toBe(ABOUT_INTRO.lead);
    expect(paragraphs).toEqual(ABOUT_INTRO.paragraphs);
  });

  it('renders exactly one tile per stat', () => {
    const tiles = element.querySelectorAll('.about__stats > li');

    expect(tiles.length).toBe(STATS.length);
    expect(tiles[0].textContent).toContain(STATS[0].value);
    expect(tiles[0].textContent).toContain(STATS[0].label);
  });

  it('renders one service card per service, in order', () => {
    const titles = Array.from(element.querySelectorAll('.about__service-title')).map((h) =>
      h.textContent?.trim(),
    );

    expect(element.querySelector('.about__subtitle')?.textContent?.trim()).toBe('What I Do');
    expect(titles).toEqual(SERVICES.map((service) => service.title));
  });
});
