import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SITE } from '../../config/site.config';
import { RevealDirective } from '../../directives/reveal.directive';
import { NavigationService } from '../../services/navigation.service';

/** Services listed in the footer, carried over verbatim from the original template. */
const FOOTER_SERVICES: readonly string[] = [
  'Web Development',
  'Web Application Development',
  'Mobile Apps',
];

/**
 * Site footer. The "Quick Links" scroll within the page via `NavigationService.scrollTo` (plain
 * buttons, no URL change); the "Connect" links are real external hyperlinks and stay as `<a>`.
 */
@Component({
  selector: 'app-footer',
  imports: [RevealDirective],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  protected readonly navigation = inject(NavigationService);

  protected readonly site = SITE;
  /** Navigable home sections (hidden sections are already filtered out by the service). */
  protected readonly links = this.navigation.items;
  protected readonly services = FOOTER_SERVICES;
  protected readonly year = new Date().getFullYear();
}
