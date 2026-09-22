import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { ExperienceEntry } from '../../data/experience.data';
import { ExperienceComponent, formatMonth } from './experience.component';

/** Test-only entries: EXPERIENCE itself is empty by design. */
const ENTRIES: ExperienceEntry[] = [
  {
    company: 'Test Company',
    role: 'Test Role',
    start: '2024-06',
    end: null,
    location: 'Test City',
    summary: 'Test summary.',
    highlights: ['First highlight', 'Second highlight'],
    technologies: ['Angular', 'TypeScript'],
    url: 'https://example.com/',
  },
  {
    company: 'Earlier Company',
    role: 'Earlier Role',
    start: '2023-01',
    end: '2024-05',
    highlights: [],
    technologies: [],
  },
];

describe('ExperienceComponent', () => {
  let component: ExperienceComponent;
  let fixture: ComponentFixture<ExperienceComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExperienceComponent],
      providers: [provideRouter([]), provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(ExperienceComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('entries', ENTRIES);
    fixture.detectChanges();
    element = fixture.nativeElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the section heading that labels the landmark', () => {
    const section = element.querySelector('section#experience');
    const heading = element.querySelector('h2#experience-title');
    expect(section?.getAttribute('aria-labelledby')).toBe('experience-title');
    expect(heading?.textContent?.trim()).toBe('Professional Experience');
  });

  it('renders one card per entry with role, company link, highlights and technologies', () => {
    const roles = Array.from(element.querySelectorAll('h3')).map((h3) => h3.textContent?.trim());
    expect(roles).toEqual(['Test Role', 'Earlier Role']);

    const link = element.querySelector<HTMLAnchorElement>('a.experience__company-link');
    expect(link?.getAttribute('href')).toBe('https://example.com/');
    expect(link?.getAttribute('target')).toBe('_blank');
    expect(link?.getAttribute('rel')).toBe('noopener noreferrer');
    expect(link?.textContent).toContain('Test Company');

    expect(element.querySelector('.experience__location')?.textContent?.trim()).toBe('Test City');
    expect(element.querySelector('.experience__summary')?.textContent?.trim()).toBe('Test summary.');
    expect(element.querySelectorAll('.experience__highlights li').length).toBe(2);
    expect(element.querySelectorAll('.p-tag').length).toBe(2);
  });

  it('shows the formatted date range inside each card', () => {
    const dates = Array.from(element.querySelectorAll('.experience__date--inline')).map((p) =>
      p.textContent?.trim(),
    );
    expect(dates).toEqual(['Jun 2024 \u2014 Present', 'Jan 2023 \u2014 May 2024']);
  });

  it('formats a current role as "Jun 2024 — Present"', () => {
    expect(component.formatRange(ENTRIES[0])).toBe('Jun 2024 \u2014 Present');
  });

  it('formats a finished role with both months', () => {
    expect(component.formatRange(ENTRIES[1])).toBe('Jan 2023 \u2014 May 2024');
  });

  it('formatMonth returns unrecognised input unchanged', () => {
    expect(formatMonth('2024-12')).toBe('Dec 2024');
    expect(formatMonth('2024-13')).toBe('2024-13');
    expect(formatMonth('n/a')).toBe('n/a');
  });
});
