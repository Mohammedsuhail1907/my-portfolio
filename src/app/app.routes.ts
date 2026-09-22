import { Routes } from '@angular/router';
import { SITE } from './config/site.config';

const brand = `${SITE.name} — ${SITE.role}`;

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    title: brand,
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'about',
    title: `About — ${brand}`,
    loadComponent: () => import('./pages/about/about.component').then((m) => m.AboutComponent),
  },
  {
    path: 'skills',
    title: `Skills — ${brand}`,
    loadComponent: () => import('./pages/skills/skills.component').then((m) => m.SkillsComponent),
  },
  {
    path: 'contact',
    title: `Contact — ${brand}`,
    loadComponent: () =>
      import('./pages/contact/contact.component').then((m) => m.ContactComponent),
  },
  { path: '**', redirectTo: 'home' },
];
