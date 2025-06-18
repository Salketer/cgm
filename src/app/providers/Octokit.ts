import { InjectionToken, Provider } from '@angular/core';
import { Octokit } from 'octokit';
export const OctokitClient = new InjectionToken<Octokit>('OctokitClient', {
  providedIn: 'any',
  factory: () =>
    new Octokit({
      auth: undefined, // TODO: Auth token should be set here
      userAgent: 'Github Browser/1.0.0',
    }),
});
