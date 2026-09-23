import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SITE } from '../../config/site.config';
import { EXPERIENCE } from '../../data/experience.data';
import { AboutComponent } from '../about/about.component';
import { ContactComponent } from '../contact/contact.component';
import { ExperienceComponent } from '../experience/experience.component';
import { HeroComponent } from '../hero/hero.component';
import { ProjectsComponent } from '../projects/projects.component';
import { SkillsComponent } from '../skills/skills.component';

/**
 * The single page of this app: composes every section in order. The Home page (hero) carries
 * the scroll-driven zoom (see HeroComponent / HomeZoomDirective); every other section scrolls
 * normally. Optional sections render only when they have content (Experience) or are enabled
 * (Projects) — see app/config/site.config.ts.
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
export class HomeComponent {
  protected readonly showExperience = EXPERIENCE.length > 0;
  protected readonly showProjects = SITE.features.projects;
}
