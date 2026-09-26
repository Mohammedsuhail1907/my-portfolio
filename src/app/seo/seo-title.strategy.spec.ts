import { Component, DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, TitleStrategy, provideRouter } from '@angular/router';
import { SITE } from '../config/site.config';
import { SeoTitleStrategy } from './seo-title.strategy';
import { SITE_URL } from './site-url.token';

@Component({ template: '' })
class StubPageComponent {}

const OWNED_TAGS =
  'meta[name="description"], meta[name="robots"], meta[property^="og:"], meta[name^="twitter:"], link[rel="canonical"], script[data-seo-jsonld]';

describe('SeoTitleStrategy', () => {
  let router: Router;
  let doc: Document;

  const content = (selector: string): string | undefined =>
    doc.head.querySelector<HTMLMetaElement>(`meta[${selector}]`)?.content;
  const canonical = (): string | null =>
    doc.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.getAttribute('href') ?? null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: 'about',
            title: 'About',
            component: StubPageComponent,
            data: { seo: { description: 'About this site.', robots: 'noindex' } },
          },
          {
            path: 'section',
            data: { seo: { description: 'Section default.' } },
            children: [{ path: 'child', title: 'Child', component: StubPageComponent }],
          },
          { path: 'plain', title: 'Plain', component: StubPageComponent },
        ]),
        { provide: TitleStrategy, useClass: SeoTitleStrategy },
        { provide: SITE_URL, useValue: 'https://example.com' },
      ],
    });
    router = TestBed.inject(Router);
    doc = TestBed.inject(DOCUMENT);
  });

  afterEach(() => {
    doc.head.querySelectorAll(OWNED_TAGS).forEach((el) => el.remove());
  });

  it('applies the route title and its `seo` data when a navigation completes', async () => {
    await router.navigateByUrl('/about');

    expect(doc.title).toBe('About');
    expect(content('name="description"')).toBe('About this site.');
    expect(content('name="robots"')).toBe('noindex');
    expect(canonical()).toBe('https://example.com/about');
    expect(content('property="og:url"')).toBe('https://example.com/about');
    expect(content('property="og:title"')).toBe('About');
  });

  it('falls back to the site defaults for a route without `seo` data', async () => {
    await router.navigateByUrl('/plain');

    expect(doc.title).toBe('Plain');
    expect(content('name="description"')).toBe(SITE.seo.description);
    expect(content('name="robots"')).toBeUndefined();
    expect(canonical()).toBe('https://example.com/plain');
  });

  it('inherits `seo` data from a parent route', async () => {
    await router.navigateByUrl('/section/child');

    expect(doc.title).toBe('Child');
    expect(content('name="description"')).toBe('Section default.');
    expect(canonical()).toBe('https://example.com/section/child');
  });
});
