import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'repos',
    loadComponent: () => import('./pages/repos/repos').then((m) => m.Repos),
    title: $localize`Repositories search`,
  },
  {
    path: 'commits/:repo',
    loadComponent: () =>
      import('./pages/commits/commits').then((m) => m.Commits),
    title: $localize`Repository commits`,
  },
];
