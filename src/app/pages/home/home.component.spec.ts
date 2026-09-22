import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [provideRouter([]), provideNoopAnimations(), MessageService],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the always-on sections in order', () => {
    const sections = Array.from(
      fixture.nativeElement.querySelectorAll('app-hero, app-about, app-skills, app-contact'),
    ).map((el) => (el as HTMLElement).tagName.toLowerCase());
    expect(sections).toEqual(['app-hero', 'app-about', 'app-skills', 'app-contact']);
  });
});
