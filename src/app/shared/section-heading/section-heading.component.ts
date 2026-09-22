import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Consistent section header: optional eyebrow label, h2 title and optional lead paragraph.
 * Pass `titleId` and reference it from the section's `aria-labelledby`.
 */
@Component({
  selector: 'app-section-heading',
  template: `
    <div class="section-heading" [class.section-heading--center]="align() === 'center'">
      @if (eyebrow()) {
        <p class="section-heading__eyebrow">{{ eyebrow() }}</p>
      }
      <h2 class="section-heading__title" [attr.id]="titleId() || null">{{ title() }}</h2>
      @if (lead()) {
        <p class="section-heading__lead">{{ lead() }}</p>
      }
    </div>
  `,
  styles: `
    @use 'mixins' as *;

    .section-heading {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      max-width: 40rem;
    }

    .section-heading--center {
      align-items: center;
      text-align: center;
      margin-inline: auto;
    }

    .section-heading__eyebrow {
      @include eyebrow;
    }

    .section-heading__lead {
      font-size: var(--fs-lead);
      color: var(--text-muted);
      line-height: 1.6;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionHeadingComponent {
  readonly title = input.required<string>();
  readonly eyebrow = input<string>('');
  readonly lead = input<string>('');
  readonly align = input<'start' | 'center'>('start');
  readonly titleId = input<string>('');
}
