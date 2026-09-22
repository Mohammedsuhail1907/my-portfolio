import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { TooltipModule } from 'primeng/tooltip';
import { SITE } from '../../config/site.config';
import { Skill } from '../../models/portfolio-data.model';
import { NavigationService } from '../../services/navigation.service';
import { PortfolioDataService } from '../../services/portfolio-data.service';
import { TechIconComponent } from '../../shared/tech-icon/tech-icon.component';

interface HeroAction {
  label: string;
  /** Id of the home-page section this action scrolls to. */
  sectionId: string;
}

/**
 * Above-the-fold introduction: greeting, name, role, tagline, core technologies, calls to
 * action, social links, location and the portrait. Technology chips come from
 * `PortfolioDataService`; everything else comes from `SITE`. In-page navigation calls
 * `NavigationService.scrollTo` directly (plain buttons — this app has one page and one URL).
 * The entrance uses the global `.enter` classes, which play once on load.
 */
@Component({
  selector: 'app-hero',
  imports: [ButtonModule, ChipModule, TooltipModule, TechIconComponent],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroComponent {
  protected readonly navigation = inject(NavigationService);
  private readonly portfolioData = inject(PortfolioDataService);

  protected readonly site = SITE;
  protected readonly highlights = toSignal(this.portfolioData.getHeroHighlights(), {
    initialValue: [] as Skill[],
  });

  /** Secondary call to action: the Projects section when it is enabled, otherwise Skills. */
  protected readonly secondaryAction: HeroAction = SITE.features.projects
    ? { label: 'View My Work', sectionId: 'projects' }
    : { label: 'See My Skills', sectionId: 'skills' };
}
