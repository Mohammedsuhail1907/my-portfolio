import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { 
    path: 'home', 
    loadComponent: () => import('./pages/hero/hero.component').then(m => m.HeroComponent)
  },
  { path: 'about', loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent) },
  { path: 'projects', loadComponent: () => import('./pages/projects/projects.component').then(m => m.ProjectsComponent) },
  { path: 'skills', loadComponent: () => import('./pages/skills/skills.component').then(m => m.SkillsComponent) },
  { path: 'contact', loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent) },
];