import { EXPERIENCE } from '../data/experience.data';

export interface SocialLink {
  id: 'linkedin' | 'github' | 'facebook' | 'instagram';
  label: string;
  url: string;
  /** PrimeIcons class. */
  icon: string;
}

export interface SectionDef {
  /** Element id of the section and the URL fragment used to navigate to it. */
  id: string;
  label: string;
}

/**
 * Site-wide content and configuration. Everything that used to be hard-coded across
 * components (name, contact details, social links, EmailJS keys, feature flags) lives here.
 */
export const SITE = {
  name: 'Mohammed Suhail',
  role: 'Full Stack Developer',
  greeting: "Hello, I'm",
  tagline:
    'I turn ideas into fast, elegant web and mobile experiences — built on clean code, thoughtful design, and technology that simply works.',
  footerTagline: 'Crafting fast, elegant digital experiences — built to last.',
  email: 'Mohammedsuhail1907@gmail.com',
  phone: '+91 9003887006',
  phoneHref: 'tel:+919003887006',
  location: 'Chennai, Tamil Nadu',
  /**
   * Public origin of the deployed site, no trailing slash (e.g. 'https://example.com'). It is
   * the base of every absolute URL baked into the pre-rendered HTML — canonical, og:url,
   * og:image, JSON-LD — and of the generated sitemap.xml / robots.txt. Leave empty to resolve it
   * at build time from the environment instead (`SITE_URL`, or Vercel's
   * `VERCEL_PROJECT_PRODUCTION_URL` — see app/seo/site-url.server.ts).
   */
  siteUrl: '',
  /** Search / social defaults (see app/seo); a route overrides them through its `seo` data. */
  seo: {
    description:
      'Mohammed Suhail is a full stack developer in Chennai, Tamil Nadu, building responsive, scalable web applications with Angular, TypeScript and .NET.',
    /** Open Graph locale. */
    locale: 'en_IN',
    /** Topics listed on the Person in the structured data (`knowsAbout`). */
    knowsAbout: ['Angular', 'TypeScript', 'JavaScript', 'C#', '.NET', 'SQL'],
  },
  portrait: {
    src: 'assets/images/portrait.jpg',
    width: 800,
    height: 1421,
    alt: 'Portrait of Mohammed Suhail, full stack developer',
  },
  socials: [
    {
      id: 'linkedin',
      label: 'LinkedIn',
      url: 'https://www.linkedin.com/in/mohammed-suhail-b3b17b24a/',
      icon: 'pi pi-linkedin',
    },
    { id: 'github', label: 'GitHub', url: 'https://github.com/Mohammedsuhail1907', icon: 'pi pi-github' },
    { id: 'facebook', label: 'Facebook', url: 'https://www.facebook.com/share/1LCjB5Ufi6/', icon: 'pi pi-facebook' },
    { id: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/sh_a1907', icon: 'pi pi-instagram' },
  ] satisfies SocialLink[],
  /** EmailJS public credentials used by the contact form (safe to ship; they are public keys). */
  emailjs: {
    serviceId: 'service_0gx117g',
    templateId: 'template_f57gqeh',
    publicKey: 'BQIBYDNChOJl8S1dX',
  },
  features: {
    /** Set to true once app/data/projects.data.ts contains real projects. */
    projects: false,
  },
} as const;

const ALL_SECTIONS: (SectionDef & { enabled: () => boolean })[] = [
  { id: 'home', label: 'Home', enabled: () => true },
  { id: 'about', label: 'About', enabled: () => true },
  { id: 'experience', label: 'Experience', enabled: () => EXPERIENCE.length > 0 },
  { id: 'skills', label: 'Skills', enabled: () => true },
  { id: 'services', label: 'Services', enabled: () => true },
  { id: 'projects', label: 'Projects', enabled: () => SITE.features.projects },
  { id: 'contact', label: 'Contact', enabled: () => true },
];

/** Sections rendered on the home page, in order. Disabled sections are omitted from navigation. */
export function homeSections(): SectionDef[] {
  return ALL_SECTIONS.filter((s) => s.enabled()).map(({ id, label }) => ({ id, label }));
}

export function isSectionEnabled(id: string): boolean {
  return ALL_SECTIONS.some((s) => s.id === id && s.enabled());
}
