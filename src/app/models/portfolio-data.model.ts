/**
 * Types for the portfolio's Skills and Projects content, and the shape of the JSON asset that
 * currently supplies it (see `assets/data/portfolio.json` and `PortfolioDataService`).
 */

export type SkillTier = 'Expert' | 'Advanced' | 'Intermediate';

export interface Skill {
  name: string;
  /** 0–100. Shown as a tier (see `skillTier`), never as a raw percentage. */
  level: number;
  /** Key into `TECH_ICONS` for an inline brand mark. Omit when no brand mark exists. */
  icon?: string;
  /** PrimeIcons class shown when `icon` is absent. Defaults to a generic code icon. */
  fallbackIcon?: string;
}

export interface SkillCategory {
  id: string;
  title: string;
  /** PrimeIcons class for the category heading. */
  icon: string;
  skills: Skill[];
}

export interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  technologies: string[];
  category: string;
  role?: string;
  features?: string[];
  impact?: string;
  demoUrl?: string;
  githubUrl?: string;
}

/** Shape of `assets/data/portfolio.json`, the current source read by `PortfolioDataService`. */
export interface PortfolioData {
  skills: {
    /** Names of skills (from `categories`, below) featured as chips in the hero. */
    heroHighlights: string[];
    categories: SkillCategory[];
  };
  projects: {
    categories: string[];
    items: Project[];
  };
}

export function skillTier(level: number): SkillTier {
  if (level >= 90) {
    return 'Expert';
  }
  if (level >= 80) {
    return 'Advanced';
  }
  return 'Intermediate';
}
