import { Component } from '@angular/core';
import { HeaderComponent } from './pages/header/header.component';
import { HeroComponent } from './pages/hero/hero.component';
import { AboutComponent } from './pages/about/about.component';
import { SkillsComponent } from './pages/skills/skills.component';
import { ContactComponent } from './pages/contact/contact.component';
import { FooterComponent } from './pages/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    HeaderComponent,
    HeroComponent,
    AboutComponent,
    SkillsComponent,
    ContactComponent,
    FooterComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {}

//ProjectsComponent,
//import { ProjectsComponent } from './pages/projects/projects.component';
