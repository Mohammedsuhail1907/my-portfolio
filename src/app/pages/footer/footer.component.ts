import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SITE } from '../../config/site.config';
import { RevealDirective } from '../../directives/reveal.directive';
import { NavigationService } from '../../services/navigation.service';

/** A service listed in the footer: the label (carried over verbatim) with a PrimeIcons glyph. */
interface FooterService {
  label: string;
  icon: string;
}

const FOOTER_SERVICES: readonly FooterService[] = [
  { label: 'Web Development', icon: 'pi pi-globe' },
  { label: 'Web Application Development', icon: 'pi pi-code' },
  { label: 'Mobile Apps', icon: 'pi pi-mobile' },
];

/**
 * Site footer: brand block, the section links, the services and a compact copyright bar.
 * Contact details and social profiles live in the Contact section (and the hero), not here.
 *
 * Below the lg breakpoint the groups are compact glass cards; from lg up they open out into
 * columns. The "Quick Links" scroll within the page via `NavigationService.scrollTo` (plain
 * buttons, no URL change).
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
