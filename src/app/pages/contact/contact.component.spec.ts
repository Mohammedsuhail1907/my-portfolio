import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { SITE } from '../../config/site.config';
import { ContactComponent } from './contact.component';

describe('ContactComponent', () => {
  let fixture: ComponentFixture<ContactComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactComponent],
      providers: [provideRouter([]), provideNoopAnimations(), MessageService],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactComponent);
    fixture.detectChanges();
    element = fixture.nativeElement;
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the heading and real mailto / tel links', () => {
    expect(element.querySelector('h2#contact-title')?.textContent?.trim()).toBe('Get In Touch');
    expect(element.querySelector(`a[href="mailto:${SITE.email}"]`)).toBeTruthy();
    expect(element.querySelector(`a[href="${SITE.phoneHref}"]`)).toBeTruthy();
  });

  it('renders a labelled control for each of the four fields', () => {
    for (const id of ['name', 'email', 'subject', 'message']) {
      expect(element.querySelector(`label[for="${id}"]`)).toBeTruthy();
      expect(element.querySelector(`#${id}[formControlName="${id}"]`)).toBeTruthy();
    }
  });

  it('shows validation messages instead of sending when submitted empty', () => {
    const form = element.querySelector<HTMLFormElement>('form');
    form?.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(element.querySelector('#name-error')?.textContent).toContain('Name is required.');
    expect(element.querySelector('#email-error')?.textContent).toContain('Email is required.');
    expect(element.querySelector('#name')?.getAttribute('aria-invalid')).toBe('true');
    expect(element.querySelector('#name')?.getAttribute('aria-describedby')).toBe('name-error');
  });
});
