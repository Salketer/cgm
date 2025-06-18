import { InjectionToken, Provider } from '@angular/core';
import { Octokit } from 'octokit';
export const OctokitClient = new InjectionToken<Octokit>('OctokitClient', {
  providedIn: 'any',
  factory: () =>
    new Octokit({
      auth: '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', // TODO: Auth token should be set later
      userAgent: 'Github Browser/1.0.0',
    }),
});
