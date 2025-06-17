import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GithubService {
  constructor() {}

  getCommits() {
    // This method would typically make an HTTP request to fetch commits
    throw new Error('Method not implemented.');
  }

  searchRepositories(term: string): Observable<any[]> {
    // This method would typically make an HTTP request to search repositories
    throw new Error('Method not implemented.');
  }
}
