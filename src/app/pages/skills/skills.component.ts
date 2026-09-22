import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { SKILL_CATEGORIES, skillTier, type SkillTier } from '../../data/skills.data';
import { TECH_ICONS } from '../../data/tech-icons';
import { RevealDirective } from '../../directives/reveal.directive';
import { SectionHeadingComponent } from '../../shared/section-heading/section-heading.component';
import { TechIconComponent } from '../../shared/tech-icon/tech-icon.component';

/** PrimeNG tag severity used to colour each proficiency tier. */
export type TierSeverity = 'info' | 'success' | 'warn';

const TIER_SEVERITY: Record<SkillTier, TierSeverity> = {
  Expert: 'info',
  Advanced: 'success',
  Intermediate: 'warn',
};

/** Tiers in descending order, as shown in the legend. */
const TIERS: SkillTier[] = ['Expert', 'Advanced', 'Intermediate'];

export function tierSeverity(tier: SkillTier): TierSeverity {
  return TIER_SEVERITY[tier];
}

/**
 * True for brand marks so dark (e.g. Angular, GitHub, OpenJDK) that they would vanish against a
 * dark card when the row's hover swaps the icon to its brand colour.
 */
function hasDarkBrand(iconKey: string | undefined): boolean {
  const hex = iconKey ? TECH_ICONS[iconKey]?.hex : undefined;
  if (!hex || !/^#[0-9a-f]{6}$/i.test(hex)) {
    return false;
  }
  const rgb = Number.parseInt(hex.slice(1), 16);
  const luminance =
    (0.2126 * ((rgb >> 16) & 255) + 0.7152 * ((rgb >> 8) & 255) + 0.0722 * (rgb & 255)) / 255;
  return luminance < 0.2;
}

interface SkillRow {
  name: string;
  icon?: string;
  tier: SkillTier;
  severity: TierSeverity;
  darkBrand: boolean;
}

interface SkillCategoryView {
  id: string;
  title: string;
  icon: string;
  skills: SkillRow[];
}

interface TierLegendItem {
  tier: SkillTier;
  severity: TierSeverity;
}

/**
 * Skills section: one card per category with each skill shown as a proficiency tier
 * (never a percentage or bar), followed by a legend that explains the three tiers.
 */
@Component({
  selector: 'app-skills',
  imports: [CardModule, TagModule, SectionHeadingComponent, TechIconComponent, RevealDirective],
  templateUrl: './skills.component.html',
  styleUrl: './skills.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkillsComponent {
  protected readonly categories: SkillCategoryView[] = SKILL_CATEGORIES.map((category) => ({
    id: category.id,
    title: category.title,
    icon: category.icon,
    skills: category.skills.map((skill) => {
      const tier = skillTier(skill.level);
      return {
        name: skill.name,
        icon: skill.icon,
        tier,
        severity: tierSeverity(tier),
        darkBrand: hasDarkBrand(skill.icon),
      };
    }),
  }));

  protected readonly tiers: TierLegendItem[] = TIERS.map((tier) => ({
    tier,
    severity: tierSeverity(tier),
  }));
}
