import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  constructor(private router: Router){

  }
  currentYear = new Date().getFullYear();


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