import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, inject } from '@angular/core';
import { SITE } from '../../config/site.config';
import { EXPERIENCE } from '../../data/experience.data';
import { NavigationService } from '../../services/navigation.service';
import { AboutComponent } from '../about/about.component';
import { ContactComponent } from '../contact/contact.component';
import { ExperienceComponent } from '../experience/experience.component';
import { HeroComponent } from '../hero/hero.component';
import { ProjectsComponent } from '../projects/projects.component';
import { SkillsComponent } from '../skills/skills.component';

/**
 * The single-page home route: composes every section in order and starts the scroll-spy that
 * keeps the header's active link in sync. Optional sections render only when they have content
 * (Experience) or are enabled (Projects) — see app/config/site.config.ts.
 */
@Component({
  selector: 'app-home',
  imports: [
    HeroComponent,
    AboutComponent,
    ExperienceComponent,
    SkillsComponent,
    ProjectsComponent,
    ContactComponent,
  ],
  template: `
    <app-hero />
    <app-about />
    @if (showExperience) {
      <app-experience />
    }
    <app-skills />
    @if (showProjects) {
      <app-projects />
    }
    <app-contact />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  private readonly navigation = inject(NavigationService);

  protected readonly showExperience = EXPERIENCE.length > 0;
  protected readonly showProjects = SITE.features.projects;

  ngAfterViewInit(): void {
    this.navigation.observe(this.navigation.items.map((item) => item.id));
  }

  ngOnDestroy(): void {
    this.navigation.disconnect();
  }
}
