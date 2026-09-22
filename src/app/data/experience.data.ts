/**
 * Professional experience shown in the Experience timeline.
 *
 * The section (and its navigation link) render only when this array has entries — nothing is
 * invented on your behalf. Add roles in reverse-chronological order, for example:
 *
 * {
 *   company: 'Company name',
 *   role: 'Full Stack Developer',
 *   start: '2024-06',           // YYYY-MM
 *   end: null,                  // null = present
 *   location: 'Chennai, India',
 *   summary: 'One sentence on the team or product.',
 *   highlights: ['Built X that did Y', 'Reduced Z by N%'],
 *   technologies: ['Angular', '.NET', 'SQL'],
 * }
 */
export interface ExperienceEntry {
  company: string;
  role: string;
  /** ISO month, e.g. '2024-06'. */
  start: string;
  /** ISO month, or null for the current role. */
  end: string | null;
  location?: string;
  summary?: string;
  highlights: string[];
  technologies: string[];
  url?: string;
}

export const EXPERIENCE: ExperienceEntry[] = [];
