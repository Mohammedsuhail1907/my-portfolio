import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SITE } from '../config/site.config';
import { SeoService } from './seo.service';
import { SITE_URL } from './site-url.token';

/** Every head tag the service may write, so each spec starts and ends with a clean head. */
const OWNED_TAGS =
  'meta[name="description"], meta[name="keywords"], meta[name="robots"], meta[property^="og:"], meta[name^="twitter:"], link[rel="canonical"], script[data-seo-jsonld]';

describe('SeoService', () => {
  let doc: Document;

  function setup(siteUrl: string): SeoService {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [{ provide: SITE_URL, useValue: siteUrl }] });
    doc = TestBed.inject(DOCUMENT);
    return TestBed.inject(SeoService);
  }

  const contents = (selector: string): string[] =>
    Array.from(doc.head.querySelectorAll<HTMLMetaElement>(`meta[${selector}]`)).map((m) => m.content);
  const content = (selector: string): string | undefined => contents(selector)[0];
  const canonical = (): string | null =>
    doc.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.getAttribute('href') ?? null;
  const jsonLd = (): string[] =>
    Array.from(doc.head.querySelectorAll('script[data-seo-jsonld]')).map((s) => s.textContent ?? '');

  afterEach(() => {
    doc.head.querySelectorAll(OWNED_TAGS).forEach((el) => el.remove());
  });

  it('writes the title, description, canonical, Open Graph and Twitter tags of a page', () => {
    const service = setup('https://example.com');

    service.apply(
      {
        title: 'About — Example',
        description: 'About the example.',
        image: 'assets/images/share.jpg',
        imageAlt: 'A share image',
        imageWidth: 1200,
        imageHeight: 630,
        type: 'profile',
        twitterCard: 'summary_large_image',
      },
      '/about?tab=1#team',
    );

    expect(doc.title).toBe('About — Example');
    expect(content('name="description"')).toBe('About the example.');
    expect(canonical()).toBe('https://example.com/about');
    expect(content('property="og:url"')).toBe('https://example.com/about');
    expect(content('property="og:type"')).toBe('profile');
    expect(content('property="og:site_name"')).toBe(SITE.name);
    expect(content('property="og:locale"')).toBe(SITE.seo.locale);
    expect(content('property="og:title"')).toBe('About — Example');
    expect(content('property="og:description"')).toBe('About the example.');
    expect(content('property="og:image"')).toBe('https://example.com/assets/images/share.jpg');
    expect(content('property="og:image:alt"')).toBe('A share image');
    expect(content('property="og:image:width"')).toBe('1200');
    expect(content('property="og:image:height"')).toBe('630');
    expect(content('name="twitter:card"')).toBe('summary_large_image');
    expect(content('name="twitter:title"')).toBe('About — Example');
    expect(content('name="twitter:description"')).toBe('About the example.');
    expect(content('name="twitter:image"')).toBe('https://example.com/assets/images/share.jpg');
    expect(content('name="twitter:image:alt"')).toBe('A share image');
    expect(content('name="robots"')).toBeUndefined();
  });

  it('gives the root a trailing-slash canonical and applies the defaults', () => {
    const service = setup('https://example.com');

    const context = service.apply({ title: 'Home' }, '/');

    expect(canonical()).toBe('https://example.com/');
    expect(context).toEqual({
      siteUrl: 'https://example.com',
      url: 'https://example.com/',
      title: 'Home',
      description: SITE.seo.description,
    });
    expect(content('name="description"')).toBe(SITE.seo.description);
    expect(content('property="og:type"')).toBe('website');
    expect(content('name="twitter:card"')).toBe('summary');
    expect(content('property="og:image"')).toBeUndefined();
  });

  it('is idempotent across pages: tags are updated in place and stale ones removed', () => {
    const service = setup('https://example.com');

    service.apply(
      { title: 'First', robots: 'noindex, nofollow', jsonLd: { '@context': 'https://schema.org', '@type': 'Thing' } },
      '/first',
    );
    service.apply({ title: 'Second', canonicalPath: '/second-canonical' }, '/second');

    expect(doc.title).toBe('Second');
    expect(contents('property="og:title"')).toEqual(['Second']);
    expect(contents('name="description"').length).toBe(1);
    expect(doc.head.querySelectorAll('link[rel="canonical"]').length).toBe(1);
    expect(canonical()).toBe('https://example.com/second-canonical');
    expect(content('name="robots"')).toBeUndefined();
    expect(jsonLd()).toEqual([]);
  });

  it('renders JSON-LD from a factory with the resolved URLs, one script per object, escaping "<"', () => {
    const service = setup('https://example.com');

    service.apply(
      {
        title: 'Page',
        jsonLd: ({ url, siteUrl }) => [
          { '@context': 'https://schema.org', '@type': 'WebPage', url, isPartOf: `${siteUrl}/#website` },
          { '@context': 'https://schema.org', '@type': 'Thing', name: '</script><b>' },
        ],
      },
      '/page',
    );

    const scripts = doc.head.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"][data-seo-jsonld]');
    expect(scripts.length).toBe(2);
    expect(JSON.parse(scripts[0].textContent ?? '')).toEqual({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      url: 'https://example.com/page',
      isPartOf: 'https://example.com/#website',
    });
    expect(scripts[1].textContent).not.toContain('<');
    expect(JSON.parse(scripts[1].textContent ?? '')['name']).toBe('</script><b>');
  });

  it('gives the social tags their own shorter description, leaving the search one long', () => {
    const service = setup('https://example.com');

    service.apply(
      { title: 'Page', description: 'The long, informative one for search results.', socialDescription: 'The short one.' },
      '/page',
    );

    expect(content('name="description"')).toBe('The long, informative one for search results.');
    expect(content('property="og:description"')).toBe('The short one.');
    expect(content('name="twitter:description"')).toBe('The short one.');
  });

  it('writes the keywords, defaulting to the site list and dropping the tag for an empty one', () => {
    const service = setup('https://example.com');

    service.apply({ title: 'Page' }, '/page');
    expect(content('name="keywords"')).toBe(SITE.seo.keywords.join(', '));

    service.apply({ title: 'Page', keywords: ['one', 'two'] }, '/page');
    expect(contents('name="keywords"')).toEqual(['one, two']);

    service.apply({ title: 'Page', keywords: [] }, '/page');
    expect(content('name="keywords"')).toBeUndefined();
  });

  it('omits every absolute URL when the site URL is unknown, rather than emitting a relative one', () => {
    const service = setup('');

    service.apply({ title: 'Page', image: 'assets/images/share.jpg', imageAlt: 'Alt' }, '/page');

    expect(doc.title).toBe('Page');
    expect(canonical()).toBeNull();
    expect(content('property="og:url"')).toBeUndefined();
    expect(content('property="og:image"')).toBeUndefined();
    expect(content('property="og:image:alt"')).toBeUndefined();
    expect(content('name="twitter:image"')).toBeUndefined();
    expect(content('property="og:title"')).toBe('Page');
  });
});
