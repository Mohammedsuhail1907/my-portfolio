import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hero',
  standalone: true,
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss']
})
export class HeroComponent {

  constructor(private router:Router){}

  scrollToSection(sectionId: string) {
    if (this.router.url !== '/home') {
      this.router.navigate(['/home']).then(() => {
        setTimeout(() => this.scrollSmooth(sectionId), 100);
      });
    } else {
      this.scrollSmooth(sectionId);
    }

  }

  private scrollSmooth(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
