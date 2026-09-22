import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { Project } from '../../models/portfolio-data.model';
import { PortfolioDataService } from '../../services/portfolio-data.service';
import { ProjectsComponent } from './projects.component';

const FAKE_CATEGORIES = ['All', 'Web App', 'Mobile'];
const FAKE_PROJECTS: Project[] = [
  {
    id: 1,
    title: 'Fake Web Project',
    description: 'A fake project used only to test filtering and the detail dialog.',
    image: 'https://example.com/web.jpg',
    technologies: ['Angular', '.NET'],
    category: 'Web App',
  },
  {
    id: 2,
    title: 'Fake Mobile Project',
    description: 'A second fake project in a different category.',
    image: 'https://example.com/mobile.jpg',
    technologies: ['C#'],
    category: 'Mobile',
  },
];

const FAKE_PORTFOLIO_DATA: Partial<PortfolioDataService> = {
  getProjectCategories: () => of(FAKE_CATEGORIES),
  getProjects: () => of(FAKE_PROJECTS),
};

describe('ProjectsComponent', () => {
  let fixture: ComponentFixture<ProjectsComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectsComponent],
      providers: [
        provideNoopAnimations(),
        { provide: PortfolioDataService, useValue: FAKE_PORTFOLIO_DATA },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectsComponent);
    fixture.detectChanges();
    element = fixture.nativeElement;
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the heading and one card per project returned by the data service', () => {
    expect(element.querySelector('h2#projects-title')?.textContent?.trim()).toBe('My Projects');
    expect(element.querySelectorAll('.projects-grid__item').length).toBe(FAKE_PROJECTS.length);
  });

  it('filters the grid by category', () => {
    fixture.componentInstance['setFilter']('Mobile');
    fixture.detectChanges();
    const expected = FAKE_PROJECTS.filter((p) => p.category === 'Mobile').length;
    expect(element.querySelectorAll('.projects-grid__item').length).toBe(expected);
  });

  it('opens the detail dialog for a project', () => {
    fixture.componentInstance['open'](FAKE_PROJECTS[0]);
    fixture.detectChanges();
    expect(fixture.componentInstance['dialogOpen']()).toBeTrue();
    expect(fixture.componentInstance['selected']()?.title).toBe(FAKE_PROJECTS[0].title);
  });
});
