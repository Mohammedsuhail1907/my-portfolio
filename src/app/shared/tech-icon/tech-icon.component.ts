import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TECH_ICONS } from '../../data/tech-icons';

/**
 * Renders an inline SVG brand mark from TECH_ICONS, or a PrimeIcons glyph as a fallback.
 * Decorative by default (aria-hidden); pass a `label` to expose it to assistive tech.
 */
@Component({
  selector: 'app-tech-icon',
  template: `
    @if (icon(); as icon) {
      <svg
        class="tech-icon"
        viewBox="0 0 24 24"
        [attr.width]="size()"
        [attr.height]="size()"
        [attr.aria-hidden]="label() ? null : 'true'"
        [attr.role]="label() ? 'img' : null"
        [attr.aria-label]="label() || null"
        [style.--tech-brand]="icon.hex"
      >
        <path [attr.d]="icon.path" fill="currentColor" />
      </svg>
    } @else {
      <i
        class="tech-icon tech-icon--pi"
        [class]="fallback()"
        [style.font-size.px]="size()"
        [attr.aria-hidden]="label() ? null : 'true'"
        [attr.role]="label() ? 'img' : null"
        [attr.aria-label]="label() || null"
      ></i>
    }
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      line-height: 1;
    }

    .tech-icon {
      display: block;
      color: inherit;
      transition: color var(--dur-base) var(--ease-out);
    }

    :host-context(.tech-brand-on-hover:hover) .tech-icon,
    :host(.tech-icon--brand) .tech-icon {
      color: var(--tech-brand, currentColor);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TechIconComponent {
  /** Key into TECH_ICONS (e.g. 'angular'). */
  readonly name = input<string | undefined>(undefined);
  /** PrimeIcons class used when `name` has no SVG (e.g. 'pi pi-database'). */
  readonly fallback = input('pi pi-code');
  readonly size = input(18);
  readonly label = input<string>('');

  protected readonly icon = computed(() => {
    const key = this.name();
    return key ? TECH_ICONS[key] : undefined;
  });
}
