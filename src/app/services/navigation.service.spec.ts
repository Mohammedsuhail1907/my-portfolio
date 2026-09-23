import { TestBed } from '@angular/core/testing';
import { NavigationService } from './navigation.service';

describe('NavigationService', () => {
  let service: NavigationService;
  let home: HTMLElement;
  let about: HTMLElement;

  beforeEach(() => {
    service = TestBed.inject(NavigationService);
    // A page tall enough to scroll: Home fills the first viewports, About follows.
    home = document.createElement('section');
    home.id = 'home';
    home.style.height = '300vh';
    about = document.createElement('section');
    about.id = 'about';
    about.style.height = '100vh';
    about.innerHTML = '<div class="container">About</div>';
    document.body.append(home, about);
    window.scrollTo({ top: 0, behavior: 'instant' });
  });

  afterEach(() => {
    home.remove();
    about.remove();
    window.scrollTo({ top: 0, behavior: 'instant' });
  });

  it('stages the destination entrance when leaving Home, and plays it once the scroll settles', () => {
    service.scrollTo('about');
    expect(about.classList.contains('page-enter-pending')).toBeTrue();
    expect(about.classList.contains('page-enter')).toBeFalse();

    window.dispatchEvent(new Event('scrollend'));
    expect(about.classList.contains('page-enter-pending')).toBeFalse();
    expect(about.classList.contains('page-enter')).toBeTrue();
  });

  it('does not stage anything when Home is no longer in view', () => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' });
    service.scrollTo('about');
    expect(about.className).toBe('');
  });

  it('never stages the Home page itself', () => {
    service.scrollTo('home');
    expect(home.className).toBe('');
  });
});
