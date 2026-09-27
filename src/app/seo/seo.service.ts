import { DOCUMENT, Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { SITE } from '../config/site.config';
import { JsonLd, PageSeo, SeoContext } from './seo.model';
import { SITE_URL, absoluteUrl } from './site-url.token';

/** Marks the JSON-LD scripts this service owns, so it can replace them on the next page. */
const JSON_LD_ATTR = 'data-seo-jsonld';

/**
 * Writes a page's whole <head> contract: <title>, description, robots, canonical, Open Graph,
 * Twitter card and JSON-LD. It only needs `Title`, `Meta` and the document, so it works
 * identically in the browser and in the build-time prerender, where the same calls land in the
 * static HTML.
 *
 * Idempotent: every tag is updated in place (or removed when its value is gone), so applying a
 * page twice, or navigating between pages, never leaves duplicates behind.
 *
 * Absolute URLs (canonical, og:url, og:image, twitter:image) are built from SITE_URL and are
 * simply omitted when it is unknown — a relative canonical would do more harm than none.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  private readonly siteUrl = inject(SITE_URL);

  /**
   * @param seo the page's contract (route `data.seo`, merged with the route title by SeoTitleStrategy)
   * @param routeUrl the router URL ('/', '/about?x=1#y'); query and fragment are dropped
   */
  apply(seo: PageSeo, routeUrl: string): SeoContext {
    const title = seo.title || this.title.getTitle();
    const description = seo.description ?? SITE.seo.description;
    // Link scrapers truncate long copy, so the social tags may carry their own shorter line.
    const socialDescription = seo.socialDescription ?? description;
    const keywords = (seo.keywords ?? SITE.seo.keywords).join(', ');
    const path = seo.canonicalPath ?? routeUrl.split(/[?#]/)[0];
    const url = absoluteUrl(this.siteUrl, path || '/');
    const image = seo.image ? absoluteUrl(this.siteUrl, seo.image) : '';
    const imageAlt = image ? seo.imageAlt : undefined;

    this.title.setTitle(title);
    this.setMeta('name', 'description', description);
    this.setMeta('name', 'keywords', keywords);
    this.setMeta('name', 'robots', seo.robots);
    this.setCanonical(url);

    this.setMeta('property', 'og:type', seo.type ?? 'website');
    this.setMeta('property', 'og:site_name', SITE.name);
    this.setMeta('property', 'og:locale', SITE.seo.locale);
    this.setMeta('property', 'og:title', title);
    this.setMeta('property', 'og:description', socialDescription);
    this.setMeta('property', 'og:url', url);
    this.setMeta('property', 'og:image', image);
    this.setMeta('property', 'og:image:alt', imageAlt);
    this.setMeta('property', 'og:image:width', image && seo.imageWidth ? String(seo.imageWidth) : undefined);
    this.setMeta('property', 'og:image:height', image && seo.imageHeight ? String(seo.imageHeight) : undefined);

    this.setMeta('name', 'twitter:card', seo.twitterCard ?? 'summary');
    this.setMeta('name', 'twitter:title', title);
    this.setMeta('name', 'twitter:description', socialDescription);
    this.setMeta('name', 'twitter:image', image);
    this.setMeta('name', 'twitter:image:alt', imageAlt);

    const context: SeoContext = { siteUrl: this.siteUrl, url, title, description };
    this.setJsonLd(typeof seo.jsonLd === 'function' ? seo.jsonLd(context) : seo.jsonLd);
    return context;
  }

  /** Updates the tag in place, adds it when missing, removes it when `content` is empty. */
  private setMeta(attr: 'name' | 'property', key: string, content: string | undefined): void {
    const selector = `${attr}="${key}"`;
    if (!content) {
      this.meta.removeTag(selector);
      return;
    }
    this.meta.updateTag({ [attr]: key, content }, selector);
  }

  private setCanonical(url: string): void {
    const head = this.document.head;
    let link = head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!url) {
      link?.parentNode?.removeChild(link);
      return;
    }
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  private setJsonLd(data: JsonLd | JsonLd[] | undefined): void {
    const head = this.document.head;
    for (const stale of Array.from(head.querySelectorAll(`script[${JSON_LD_ATTR}]`))) {
      stale.parentNode?.removeChild(stale);
    }
    const items = data === undefined ? [] : Array.isArray(data) ? data : [data];
    for (const item of items) {
      const script = this.document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.setAttribute(JSON_LD_ATTR, '');
      // '<' is escaped so no value can ever close the script element or open a comment.
      script.textContent = JSON.stringify(item).replace(/</g, '\\u003c');
      head.appendChild(script);
    }
  }
}
