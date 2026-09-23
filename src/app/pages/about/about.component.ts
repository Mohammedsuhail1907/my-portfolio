import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ABOUT_INTRO, SERVICES, STATS } from '../../data/about.data';
import { CountUpDirective } from '../../directives/count-up.directive';
import { RevealDirective } from '../../directives/reveal.directive';
import { SectionHeadingComponent } from '../../shared/section-heading/section-heading.component';

/**
 * About section: intro copy with two stat tiles (counting up as they scroll into view) on the
 * left, the "What I Do" service cards on the right. All copy comes from app/data/about.data.ts.
 */
@Component({
  selector: 'app-about',
  imports: [CardModule, SectionHeadingComponent, RevealDirective, CountUpDirective],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutComponent {
  protected readonly intro = ABOUT_INTRO;
  protected readonly stats = STATS;
  protected readonly services = SERVICES;
}
