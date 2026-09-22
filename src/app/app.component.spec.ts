import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([]), provideNoopAnimations(), MessageService],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the skip link, header, main landmark and footer', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('a.skip-link')?.getAttribute('href')).toBe('#main-content');
    expect(el.querySelector('app-header')).toBeTruthy();
    expect(el.querySelector('main#main-content')).toBeTruthy();
    expect(el.querySelector('app-footer')).toBeTruthy();
  });
});
