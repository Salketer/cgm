import { inject, Injectable } from '@angular/core';
import { Octokit } from 'octokit';
import { Observable, of } from 'rxjs';
import { fromPromise } from 'rxjs/internal/observable/innerFrom';
import { OctokitClient } from '../../providers/Octokit';

@Injectable({
  providedIn: 'root',
})
export class GithubService {
  octokit = inject(OctokitClient);
  constructor() {}

  getCommits() {
    // This method would typically make an HTTP request to fetch commits
    throw new Error('Method not implemented.');
  }

  searchRepositories(term: string) {
    const req = this.octokit.request('GET /search/repositories', {
      q: term,
    });
    return fromPromise(req.then((response) => response.data.items));
  }
}
