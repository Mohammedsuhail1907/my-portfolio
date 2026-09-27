/** A JSON-LD object (https://schema.org). */
export type JsonLd = Record<string, unknown>;

/** What a page's JSON-LD factory receives once the URLs are resolved. */
export interface SeoContext {
  /** Public origin without a trailing slash; '' when unknown (see SITE_URL). */
  siteUrl: string;
  /** Absolute canonical URL of the page; '' when the site URL is unknown. */
  url: string;
  title: string;
  description: string;
}

/**
 * Per-page search / social contract, declared on a route as `data: { seo: PageSeo }` and
 * applied by SeoTitleStrategy → SeoService on every completed navigation (including the
 * build-time prerender, which is how the tags end up in the static HTML).
 */
export interface PageSeo {
  /** Overrides the route's `title` property (which is used when omitted). */
  title?: string;
  /** Meta description, used for search. Defaults to `SITE.seo.description`. */
  description?: string;
  /**
   * Shorter description for link previews (og:description / twitter:description), where
   * scrapers truncate long copy. Falls back to `description`.
   */
  socialDescription?: string;
  /**
   * `<meta name="keywords">`. Defaults to `SITE.seo.keywords`; pass `[]` to omit the tag.
   * Ignored by the major search engines — see the note in site.config.ts.
   */
  keywords?: readonly string[];
  /** Site-relative canonical path ('/', '/about'). Defaults to the route URL without query or fragment. */
  canonicalPath?: string;
  /** Share image: site-relative ('assets/images/x.jpg') or absolute. */
  image?: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
  /** Open Graph object type. Default 'website'. */
  type?: 'website' | 'article' | 'profile';
  /** Default 'summary'. */
  twitterCard?: 'summary' | 'summary_large_image';
  /** e.g. 'noindex, nofollow'. Omitted = indexable. */
  robots?: string;
  /**
   * Structured data. Each object becomes its own `<script type="application/ld+json">`; a
   * factory receives the resolved URLs so `@id` / `url` / `image` can be absolute.
   */
  jsonLd?: JsonLd | JsonLd[] | ((context: SeoContext) => JsonLd | JsonLd[]);
}

/** Key under which a route's `data` carries its PageSeo. */
export const SEO_ROUTE_DATA_KEY = 'seo';
