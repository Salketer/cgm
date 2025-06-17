import { inject, Injectable } from '@angular/core';
import { Octokit } from 'octokit';
import { map, Observable, of } from 'rxjs';
import { fromPromise } from 'rxjs/internal/observable/innerFrom';
import { OctokitClient } from '../../providers/Octokit';
import { ResourceLoader } from '@angular/compiler';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class GithubService {
  private http = inject(HttpClient);
  private octokit = inject(OctokitClient);
  constructor() {}

  getCommits() {
    // This method would typically make an HTTP request to fetch commits
    throw new Error('Method not implemented.');
  }

  searchRepositories(search: {
    term?: string;
    stars?: number | null;
    language?: string | null;
  }) {
    let query = search.term ?? '';
    if (search.stars) {
      query += ` stars:>=${search.stars}`;
    }
    if (search.language) {
      query += ` language:${search.language}`;
    }
    const req = this.octokit.request('GET /search/repositories', {
      q: query,
    });
    return fromPromise(req.then((response) => response.data.items));
  }

  // Retrieves a list of available programming languages from text file
  // The file is expected to be in the format: "language_name:hex_color_code"
  getAvailableLanguages(): Observable<{ name: string; color: string }[]> {
    return this.http
      .get('/github-languages.txt', { responseType: 'text' })
      .pipe(
        map((data) => {
          // Assuming the file contains languages separated by new lines
          return data.split('\n').map((lang) => {
            const langSplit = lang.split(':');
            return { name: langSplit[0].trim(), color: langSplit[1] };
          });
        })
      );
  }
}
