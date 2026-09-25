import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { SERVICE_OFFERINGS } from '../../data/services.data';
import { RevealDirective } from '../../directives/reveal.directive';
import { SectionHeadingComponent } from '../../shared/section-heading/section-heading.component';

/**
 * The Services page: the six offerings — each discipline with its maintenance counterpart — as
 * a responsive card grid in the site's card language (glass card, icon tile, hover lift with
 * the icon glow). Cards enter with the shared reveal system, staggered and cycling direction
 * per grid column (left, scale, right), so the grid assembles rather than appearing at once.
 * The hero's secondary call to action ("Explore My Services") scrolls here.
 */
@Component({
  selector: 'app-services',
  imports: [CardModule, RevealDirective, SectionHeadingComponent],
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicesComponent {
  protected readonly services = SERVICE_OFFERINGS;
}
