import { Component, signal } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-about',
  templateUrl: './about.component.html'
})
export class AboutComponent {
  bio = signal('Passionate Angular developer focused on modern architecture and UI/UX.');
}
