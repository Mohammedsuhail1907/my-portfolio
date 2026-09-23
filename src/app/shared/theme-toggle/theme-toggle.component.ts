import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TooltipModule } from 'primeng/tooltip';
import { ThemeService } from '../../services/theme.service';

/**
 * Floating light/dark switch, fixed to the top-right corner of the viewport. The icon shows the
 * scheme you would switch TO (moon in light mode, sun in dark) and spins over on change;
 * ThemeService animates the page itself, expanding the new scheme out from this button.
 */
@Component({
  selector: 'app-theme-toggle',
  imports: [TooltipModule],
  templateUrl: './theme-toggle.component.html',
  styleUrl: './theme-toggle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeToggleComponent {
  private readonly theme = inject(ThemeService);

  protected readonly isDark = this.theme.isDark;
  protected readonly label = computed(() =>
    this.theme.isDark() ? 'Switch to light theme' : 'Switch to dark theme',
  );

  /** Toggles the theme, revealing the new scheme from the centre of the button. */
  protected toggle(button: HTMLElement): void {
    const rect = button.getBoundingClientRect();
    this.theme.toggle({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
  }
}
