import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { PROJECTS } from '../../data/projects.data';
import { ProjectsComponent } from './projects.component';

describe('ProjectsComponent', () => {
  let fixture: ComponentFixture<ProjectsComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectsComponent],
      providers: [provideRouter([]), provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectsComponent);
    fixture.detectChanges();
    element = fixture.nativeElement;
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the heading and one card per project', () => {
    expect(element.querySelector('h2#projects-title')?.textContent?.trim()).toBe('My Projects');
    expect(element.querySelectorAll('.projects-grid__item').length).toBe(PROJECTS.length);
  });

  it('filters the grid by category', () => {
    fixture.componentInstance['setFilter']('Mobile');
    fixture.detectChanges();
    const expected = PROJECTS.filter((p) => p.category === 'Mobile').length;
    expect(element.querySelectorAll('.projects-grid__item').length).toBe(expected);
  });

  it('opens the detail dialog for a project', () => {
    fixture.componentInstance['open'](PROJECTS[0]);
    fixture.detectChanges();
    expect(fixture.componentInstance['dialogOpen']()).toBeTrue();
    expect(fixture.componentInstance['selected']()?.title).toBe(PROJECTS[0].title);
  });
});
