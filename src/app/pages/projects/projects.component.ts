import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TagModule } from 'primeng/tag';
import { Project } from '../../models/portfolio-data.model';
import { RevealDirective } from '../../directives/reveal.directive';
import { PortfolioDataService } from '../../services/portfolio-data.service';
import { SectionHeadingComponent } from '../../shared/section-heading/section-heading.component';

/**
 * Projects section: a category filter, a responsive card grid and a detail dialog.
 *
 * Content comes from `PortfolioDataService` (currently backed by `assets/data/portfolio.json`,
 * still holding clearly-marked **placeholder** sample data — see that file). Optional fields
 * (`role`, `features`, `impact`, `demoUrl`, `githubUrl`) render only when present. HomeComponent
 * mounts this section only when `SITE.features.projects` is enabled.
 */
@Component({
  selector: 'app-projects',
  imports: [
    FormsModule,
    ButtonModule,
    CardModule,
    DialogModule,
    SelectButtonModule,
    TagModule,
    SectionHeadingComponent,
    RevealDirective,
  ],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsComponent {
  private readonly portfolioData = inject(PortfolioDataService);

  protected readonly categories = toSignal(this.portfolioData.getProjectCategories(), {
    initialValue: [] as string[],
  });
  protected readonly projects = toSignal(this.portfolioData.getProjects(), {
    initialValue: [] as Project[],
  });

  protected readonly activeFilter = signal<string>('All');
  protected readonly filtered = computed(() => {
    const category = this.activeFilter();
    const projects = this.projects();
    return category === 'All' ? projects : projects.filter((project) => project.category === category);
  });

  protected readonly selected = signal<Project | null>(null);
  protected readonly dialogOpen = signal(false);

  /** The card button that opened the dialog; focus returns to it when the dialog closes. */
  private trigger: HTMLElement | null = null;

  protected setFilter(category: string): void {
    this.activeFilter.set(category);
  }

  protected open(project: Project, event?: Event): void {
    const target = event?.target instanceof HTMLElement ? event.target : null;
    this.trigger = target?.closest<HTMLElement>('button, a') ?? target;
    this.selected.set(project);
    this.dialogOpen.set(true);
  }

  protected close(): void {
    this.dialogOpen.set(false);
  }

  protected onDialogHide(): void {
    const trigger = this.trigger;
    this.trigger = null;
    trigger?.focus();
  }
}
