/**
 * Skills content. The numeric `level` values are the original portfolio data; they are shown as
 * proficiency tiers (see `skillTier`) rather than percentages.
 */
export type SkillTier = 'Expert' | 'Advanced' | 'Intermediate';

export interface Skill {
  name: string;
  /** 0–100, carried over from the original data set. */
  level: number;
  /** Key into TECH_ICONS for an inline brand mark (optional). */
  icon?: string;
}

export interface SkillCategory {
  id: string;
  title: string;
  /** PrimeIcons class for the category heading. */
  icon: string;
  skills: Skill[];
}

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    id: 'frontend',
    title: 'Frontend',
    icon: 'pi pi-desktop',
    skills: [
      { name: 'Angular', level: 95, icon: 'angular' },
      { name: 'TypeScript', level: 90, icon: 'typescript' },
      { name: 'JavaScript', level: 95, icon: 'javascript' },
      { name: 'HTML5/CSS3', level: 90, icon: 'html5' },
      { name: 'Bootstrap', level: 85, icon: 'bootstrap' },
    ],
  },
  {
    id: 'backend',
    title: 'Backend',
    icon: 'pi pi-server',
    skills: [
      { name: 'Node.js', level: 88, icon: 'nodedotjs' },
      { name: 'Java', level: 50, icon: 'openjdk' },
    ],
  },
  {
    id: 'database',
    title: 'Database',
    icon: 'pi pi-database',
    skills: [{ name: 'SQL', level: 85 }],
  },
  {
    id: 'tools',
    title: 'Tools',
    icon: 'pi pi-wrench',
    skills: [
      { name: 'Git', level: 92, icon: 'git' },
      { name: 'GitHub', level: 90, icon: 'github' },
      { name: 'Postman', level: 75, icon: 'postman' },
    ],
  },
];

/** Technologies highlighted in the hero (a subset of the skills above). */
export const HERO_HIGHLIGHTS: Skill[] = [
  { name: 'Angular', level: 95, icon: 'angular' },
  { name: 'TypeScript', level: 90, icon: 'typescript' },
  { name: 'Node.js', level: 88, icon: 'nodedotjs' },
  { name: 'Java', level: 50, icon: 'openjdk' },
  { name: 'SQL', level: 85 },
];

export function skillTier(level: number): SkillTier {
  if (level >= 90) {
    return 'Expert';
  }
  if (level >= 80) {
    return 'Advanced';
  }
  return 'Intermediate';
}
