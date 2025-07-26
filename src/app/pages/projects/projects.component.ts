import { Component, signal } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-projects',
  templateUrl: './projects.component.html'
})
export class ProjectsComponent {
  projects = signal([
    { id: 1, title: 'Portfolio Website', description: 'Built with Angular 18, Tailwind & Signals' },
    { id: 2, title: 'Blog Platform', description: 'Markdown-based blog with lazy-loaded routes' },
  ]);
}
