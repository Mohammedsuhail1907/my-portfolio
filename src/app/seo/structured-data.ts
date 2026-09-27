import { SITE } from '../config/site.config';
import { JsonLd, SeoContext } from './seo.model';
import { absoluteUrl } from './site-url.token';

/**
 * Structured data of the Home page: the site, this profile page and its subject, linked in one
 * `@graph` (schema.org WebSite / ProfilePage / Person — the shape Google documents for profile
 * pages). Everything is read from `SITE`, so the copy has one source of truth. Absolute `@id`s
 * are only emitted when the site URL is known.
 */
export function homeStructuredData({ siteUrl, url, title, description }: SeoContext): JsonLd {
  const personId = url ? `${url}#person` : '#person';
  const websiteId = url ? `${siteUrl}/#website` : '#website';
  const image = absoluteUrl(siteUrl, SITE.portrait.src);
  const [addressLocality, addressRegion] = SITE.location.split(',').map((part) => part.trim());

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': personId,
        name: SITE.name,
        jobTitle: SITE.role,
        description,
        email: `mailto:${SITE.email}`,
        telephone: SITE.phone,
        address: {
          '@type': 'PostalAddress',
          addressLocality,
          addressRegion,
          addressCountry: 'IN',
        },
        ...(url ? { url } : {}),
        ...(image ? { image } : {}),
        sameAs: SITE.socials.map((social) => social.url),
        knowsAbout: [...SITE.seo.knowsAbout],
      },
      {
        '@type': 'WebSite',
        '@id': websiteId,
        ...(url ? { url: `${siteUrl}/` } : {}),
        name: `${SITE.name} — Portfolio`,
        inLanguage: 'en',
        publisher: { '@id': personId },
      },
      {
        '@type': 'ProfilePage',
        ...(url ? { '@id': url, url } : {}),
        name: title,
        description,
        inLanguage: 'en',
        isPartOf: { '@id': websiteId },
        mainEntity: { '@id': personId },
      },
    ],
  };
}
