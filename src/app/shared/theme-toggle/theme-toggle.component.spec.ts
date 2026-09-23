import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ThemeService } from '../../services/theme.service';
import { ThemeToggleComponent } from './theme-toggle.component';

describe('ThemeToggleComponent', () => {
  let fixture: ComponentFixture<ThemeToggleComponent>;
  let element: HTMLElement;
  let theme: ThemeService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThemeToggleComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(ThemeToggleComponent);
    fixture.detectChanges();
    element = fixture.nativeElement;
    theme = TestBed.inject(ThemeService);
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('labels the button with the scheme it switches to', () => {
    const button = element.querySelector('button.theme-toggle');
    const expected = theme.isDark() ? 'Switch to light theme' : 'Switch to dark theme';
    expect(button?.getAttribute('aria-label')).toBe(expected);
  });

  it('toggles the theme from the centre of the button on click', () => {
    const toggleSpy = spyOn(theme, 'toggle');
    element.querySelector<HTMLButtonElement>('button.theme-toggle')?.click();
    expect(toggleSpy).toHaveBeenCalledOnceWith({ x: jasmine.any(Number), y: jasmine.any(Number) });
  });
});
