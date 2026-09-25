/** A service offering on the Services page (pages/services). */
export interface ServiceOffering {
  title: string;
  description: string;
  /** PrimeIcons class. */
  icon: string;
}

/**
 * The six service offerings, in display order: each discipline (web site, web application,
 * mobile application) paired with its long-term maintenance counterpart, so the section reads
 * as "I build complete digital products — and keep them running".
 */
export const SERVICE_OFFERINGS: ServiceOffering[] = [
  {
    title: 'Web Site Development',
    icon: 'pi pi-globe',
    description:
      'Build modern, responsive, fast, and visually engaging websites that provide an excellent experience across devices.',
  },
  {
    title: 'Web Site Maintenance',
    icon: 'pi pi-wrench',
    description:
      'Keep websites secure, updated, optimized, and reliable through continuous maintenance, improvements, and technical support.',
  },
  {
    title: 'Web Application Development',
    icon: 'pi pi-code',
    description:
      'Develop scalable, user-friendly web applications using modern technologies, clean architecture, and efficient development practices.',
  },
  {
    title: 'Web Application Maintenance',
    icon: 'pi pi-cog',
    description:
      'Provide ongoing application support including bug fixing, performance optimization, feature enhancements, and technical improvements.',
  },
  {
    title: 'Mobile Application Development',
    icon: 'pi pi-mobile',
    description:
      'Create intuitive, responsive, and user-friendly mobile applications designed for smooth performance and modern mobile experiences.',
  },
  {
    title: 'Mobile Application Maintenance',
    icon: 'pi pi-sync',
    description:
      'Maintain and improve mobile applications through bug fixes, performance optimization, compatibility updates, and new feature enhancements.',
  },
];
