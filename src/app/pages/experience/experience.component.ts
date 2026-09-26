import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { TimelineModule } from 'primeng/timeline';
import { EXPERIENCE, ExperienceEntry } from '../../data/experience.data';
import { RevealDirective } from '../../directives/reveal.directive';
import { SectionHeadingComponent } from '../../shared/section-heading/section-heading.component';

export type TimelineAlign = 'left' | 'alternate';

/** An experience entry plus its position, so the timeline templates can drive the reveal stagger. */
export interface TimelineItem extends ExperienceEntry {
  index: number;
}

/** Mirrors the `lg` breakpoint in src/styles/_mixins.scss. */
const LG_QUERY = '(min-width: 1024px)';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** 'YYYY-MM' → 'Jun 2024'. Input that is not an ISO month is returned unchanged. */
export function formatMonth(isoMonth: string): string {
  const [year, month] = isoMonth.split('-');
  const name = MONTHS[Number(month) - 1];
  return year && name ? `${name} ${year}` : isoMonth;
}

/**
 * Professional experience as a vertical timeline. HomeComponent renders it only when the
 * EXPERIENCE data has entries. From the lg breakpoint up the events alternate sides with the
 * date range in the opposite column; below it the bar sits on the left and the date moves
 * inside the card.
 */
@Component({
  selector: 'app-experience',
  imports: [TimelineModule, CardModule, TagModule, SectionHeadingComponent, RevealDirective],
  templateUrl: './experience.component.html',
  styleUrl: './experience.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExperienceComponent {
  /** Entries to render, newest first. Defaults to the site data; overridable (e.g. in tests). */
  readonly entries = input<ExperienceEntry[]>(EXPERIENCE);

  /** PrimeNG's timeline templates only receive the item, so the index travels with it. */
  protected readonly items = computed<TimelineItem[]>(() =>
    this.entries().map((entry, index) => ({ ...entry, index })),
  );

  /** 'alternate' from the lg breakpoint up, 'left' below it. */
  protected readonly align = signal<TimelineAlign>('left');

  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    // The viewport is only known in the browser, and the DOM may only differ from the
    // pre-rendered HTML (always the 'left' layout) after hydration — so the first render matches
    // the server's, and the alignment flips right after, before the section is on screen.
    afterNextRender(() => {
      if (typeof matchMedia !== 'function') {
        return;
      }
      const query = matchMedia(LG_QUERY);
      const update = (state: { matches: boolean }): void => {
        this.align.set(state.matches ? 'alternate' : 'left');
      };
      update(query);
      query.addEventListener('change', update);
      this.destroyRef.onDestroy(() => query.removeEventListener('change', update));
    });
  }

  /** 'Jun 2024 — Present' for a current role, 'Jan 2023 — May 2024' for a finished one. */
  formatRange(entry: Pick<ExperienceEntry, 'start' | 'end'>): string {
    const end = entry.end ? formatMonth(entry.end) : 'Present';
    return `${formatMonth(entry.start)} \u2014 ${end}`;
  }
}
