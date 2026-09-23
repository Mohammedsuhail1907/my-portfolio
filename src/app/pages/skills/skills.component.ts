import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { SkillTier, skillTier } from '../../models/portfolio-data.model';
import { TECH_ICONS } from '../../data/tech-icons';
import { RevealDirective } from '../../directives/reveal.directive';
import { PortfolioDataService } from '../../services/portfolio-data.service';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';
import { toLoadState } from '../../shared/load-state';
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

/** Rows per placeholder card while loading — roughly the real categories' sizes. */
const SKELETON_ROWS = [5, 2, 1, 3];

export function tierSeverity(tier: SkillTier): TierSeverity {
  return TIER_SEVERITY[tier];
}

/**
 * True for brand marks so dark (e.g. Angular, GitHub) that they would vanish against a dark card
 * when the row's hover swaps the icon to its brand colour.
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
  fallbackIcon: string;
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
 * (never a percentage or bar), followed by a legend that explains the three tiers. Skeleton cards
 * hold the layout while the data loads; a failed load shows an empty state.
 *
 * Content comes from `PortfolioDataService` (currently backed by `assets/data/portfolio.json`),
 * so it can be swapped for a real API later without touching this component.
 */
@Component({
  selector: 'app-skills',
  imports: [
    CardModule,
    SkeletonModule,
    TagModule,
    SectionHeadingComponent,
    EmptyStateComponent,
    TechIconComponent,
    RevealDirective,
  ],
  templateUrl: './skills.component.html',
  styleUrl: './skills.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkillsComponent {
  private readonly portfolioData = inject(PortfolioDataService);

  private readonly state = toSignal(toLoadState(this.portfolioData.getSkillCategories()), {
    requireSync: true,
  });

  protected readonly status = computed(() => this.state().status);

  protected readonly categories = computed<SkillCategoryView[]>(() => {
    const state = this.state();
    if (state.status !== 'ready') {
      return [];
    }
    return state.value.map((category) => ({
      id: category.id,
      title: category.title,
      icon: category.icon,
      skills: category.skills.map((skill) => {
        const tier = skillTier(skill.level);
        return {
          name: skill.name,
          icon: skill.icon,
          fallbackIcon: skill.fallbackIcon ?? 'pi pi-code',
          tier,
          severity: tierSeverity(tier),
          darkBrand: hasDarkBrand(skill.icon),
        };
      }),
    }));
  });

  protected readonly tiers: TierLegendItem[] = TIERS.map((tier) => ({
    tier,
    severity: tierSeverity(tier),
  }));

  /** One inner array per placeholder card, sized by SKELETON_ROWS. */
  protected readonly skeletonCards = SKELETON_ROWS.map((rows) =>
    Array.from({ length: rows }, (_, index) => index),
  );
}
