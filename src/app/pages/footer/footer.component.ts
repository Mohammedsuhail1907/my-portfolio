import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE } from '../../config/site.config';
import { RevealDirective } from '../../directives/reveal.directive';
import { NavigationService } from '../../services/navigation.service';

/** Services listed in the footer, carried over verbatim from the original template. */
const FOOTER_SERVICES: readonly string[] = [
  'Web Development',
  'Web Application Development',
  'Mobile Apps',
];

@Component({
  selector: 'app-footer',
  imports: [RouterLink, RevealDirective],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  private readonly navigation = inject(NavigationService);

  protected readonly site = SITE;
  /** Navigable home sections (hidden sections are already filtered out by the service). */
  protected readonly links = this.navigation.items;
  protected readonly services = FOOTER_SERVICES;
  protected readonly year = new Date().getFullYear();
}
