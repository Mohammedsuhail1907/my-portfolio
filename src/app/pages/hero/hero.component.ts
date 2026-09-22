import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { TooltipModule } from 'primeng/tooltip';
import { SITE } from '../../config/site.config';
import { HERO_HIGHLIGHTS } from '../../data/skills.data';
import { TechIconComponent } from '../../shared/tech-icon/tech-icon.component';

interface HeroAction {
  label: string;
  /** Home-page section id the action scrolls to. */
  fragment: string;
}

/**
 * Above-the-fold introduction: greeting, name, role, tagline, core technologies, calls to
 * action, social links, location and the portrait. All copy comes from SITE and
 * HERO_HIGHLIGHTS; in-page navigation is plain router links (fragment scrolling is global).
 * The entrance uses the global `.enter` classes, which play once on load.
 */
@Component({
  selector: 'app-hero',
  imports: [RouterLink, ButtonModule, ChipModule, TooltipModule, TechIconComponent],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroComponent {
  protected readonly site = SITE;
  protected readonly highlights = HERO_HIGHLIGHTS;

  /** Secondary call to action: the Projects section when it is enabled, otherwise Skills. */
  protected readonly secondaryAction: HeroAction = SITE.features.projects
    ? { label: 'View My Work', fragment: 'projects' }
    : { label: 'See My Skills', fragment: 'skills' };
}
