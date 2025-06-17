import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Github {
  constructor() {}

  getCommits() {
    // This method would typically make an HTTP request to fetch commits
    throw new Error('Method not implemented.');
  }

  searchRepositories() {
    // This method would typically make an HTTP request to search repositories
    throw new Error('Method not implemented.');
  }
}
