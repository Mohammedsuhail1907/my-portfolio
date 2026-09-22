import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { SkillCategory } from '../../models/portfolio-data.model';
import { PortfolioDataService } from '../../services/portfolio-data.service';
import { SkillsComponent } from './skills.component';

const FAKE_CATEGORIES: SkillCategory[] = [
  {
    id: 'frontend',
    title: 'Frontend',
    icon: 'pi pi-desktop',
    skills: [{ name: 'Angular', level: 95, icon: 'angular' }],
  },
  {
    id: 'backend',
    title: 'Backend',
    icon: 'pi pi-server',
    skills: [
      { name: 'C#', level: 75 },
      { name: '.NET', level: 75, icon: 'dotnet' },
    ],
  },
];

const FAKE_PORTFOLIO_DATA: Partial<PortfolioDataService> = {
  getSkillCategories: () => of(FAKE_CATEGORIES),
};

describe('SkillsComponent', () => {
  let fixture: ComponentFixture<SkillsComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkillsComponent],
      providers: [{ provide: PortfolioDataService, useValue: FAKE_PORTFOLIO_DATA }],
    }).compileComponents();

    fixture = TestBed.createComponent(SkillsComponent);
    fixture.detectChanges();
    element = fixture.nativeElement;
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the heading and one card per skill category returned by the data service', () => {
    expect(element.querySelector('h2#skills-title')?.textContent?.trim()).toBe('Skills & Technologies');
    const titles = Array.from(element.querySelectorAll('.skill-card__title')).map((h) =>
      h.textContent?.trim(),
    );
    expect(titles).toEqual(FAKE_CATEGORIES.map((c) => c.title));
  });

  it('shows every skill as a proficiency tier, never a percentage', () => {
    const rows = element.querySelectorAll('.skill');
    const total = FAKE_CATEGORIES.reduce((n, c) => n + c.skills.length, 0);
    expect(rows.length).toBe(total);
    expect(element.textContent).not.toContain('%');
    const tiers = Array.from(element.querySelectorAll('.skill__tier')).map((t) =>
      t.textContent?.trim(),
    );
    expect(tiers.every((t) => ['Expert', 'Advanced', 'Intermediate'].includes(t ?? ''))).toBeTrue();
  });

  it('renders a skill with no brand icon (e.g. C#) using its generic fallback', () => {
    const csharpRow = Array.from(element.querySelectorAll('.skill')).find((row) =>
      row.querySelector('.skill__name')?.textContent?.trim() === 'C#',
    );
    expect(csharpRow?.querySelector('.tech-icon--pi')).toBeTruthy();
  });
});
