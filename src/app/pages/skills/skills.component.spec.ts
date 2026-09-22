import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SKILL_CATEGORIES } from '../../data/skills.data';
import { SkillsComponent } from './skills.component';

describe('SkillsComponent', () => {
  let fixture: ComponentFixture<SkillsComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkillsComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(SkillsComponent);
    fixture.detectChanges();
    element = fixture.nativeElement;
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the heading and one card per skill category', () => {
    expect(element.querySelector('h2#skills-title')?.textContent?.trim()).toBe('Skills & Technologies');
    const titles = Array.from(element.querySelectorAll('.skill-card__title')).map((h) =>
      h.textContent?.trim(),
    );
    expect(titles).toEqual(SKILL_CATEGORIES.map((c) => c.title));
  });

  it('shows every skill as a proficiency tier, never a percentage', () => {
    const rows = element.querySelectorAll('.skill');
    const total = SKILL_CATEGORIES.reduce((n, c) => n + c.skills.length, 0);
    expect(rows.length).toBe(total);
    expect(element.textContent).not.toContain('%');
    const tiers = Array.from(element.querySelectorAll('.skill__tier')).map((t) =>
      t.textContent?.trim(),
    );
    expect(tiers.every((t) => ['Expert', 'Advanced', 'Intermediate'].includes(t ?? ''))).toBeTrue();
  });
});
