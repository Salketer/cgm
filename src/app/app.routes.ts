import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/index/index').then((m) => m.Index),
  },
  {
    path: 'repos',
    loadComponent: () => import('./pages/repos/repos').then((m) => m.Repos),
    title: $localize`Repositories search`,
  },
  {
    path: 'commits/:owner/:repo',
    loadComponent: () =>
      import('./pages/commits/commits').then((m) => m.Commits),
    title: $localize`Repository commits`,
  },
];
