import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Centred placeholder for "nothing here" and "couldn't load" states: a floating icon tile, a
 * one-line message and an optional hint. Spans every column when placed inside a grid.
 */
@Component({
  selector: 'app-empty-state',
  template: `
    <div class="empty-state">
      <span class="icon-tile empty-state__icon float" aria-hidden="true">
        <i [class]="icon()"></i>
      </span>
      <p class="empty-state__message">{{ message() }}</p>
      @if (hint()) {
        <p class="empty-state__hint text-muted">{{ hint() }}</p>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      grid-column: 1 / -1;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-3);
      padding-block: var(--space-10);
      text-align: center;
    }

    .empty-state__icon {
      --tile-size: 3.5rem;

      margin-bottom: var(--space-2);
      border-radius: var(--radius-lg);

      > i {
        font-size: 1.5rem;
      }
    }

    .empty-state__message {
      font-weight: 600;
      color: var(--text-strong);
    }

    .empty-state__hint {
      max-width: 28rem;
      font-size: var(--fs-sm);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  /** PrimeIcons class. */
  readonly icon = input('pi pi-inbox');
  readonly message = input.required<string>();
  readonly hint = input('');
}
