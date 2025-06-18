import { inject, Injectable, signal } from '@angular/core';
import { Octokit } from 'octokit';
import {
  catchError,
  forkJoin,
  map,
  merge,
  Observable,
  of,
  Subject,
  Subscription,
  switchMap,
  tap,
} from 'rxjs';
import { fromPromise } from 'rxjs/internal/observable/innerFrom';
import { OctokitClient } from '../../providers/Octokit';
import { ResourceLoader } from '@angular/compiler';
import { HttpClient } from '@angular/common/http';
import { DataSource } from '@angular/cdk/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

export interface RepositoryModel {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  owner: {
    name?: string | null;
    email?: string | null;
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    gravatar_id: string | null;
    url: string;
    html_url: string;
    followers_url: string;
    following_url: string;
    gists_url: string;
    starred_url: string;
    subscriptions_url: string;
    organizations_url: string;
    repos_url: string;
    events_url: string;
    received_events_url: string;
    type: string;
    site_admin: boolean;
    starred_at?: string;
    user_view_type?: string;
  } | null;
  private: boolean;
  html_url: string;
  description: string | null;
  fork: boolean;
  url: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  homepage: string | null;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  forks_count: number;
  open_issues_count: number;
  master_branch?: string;
}

@Injectable({
  providedIn: 'root',
})
export class GithubService {
  private http = inject(HttpClient);
  private octokit = inject(OctokitClient);
  constructor() {}

  getCommits(owner: string, repo: string) {
    const req = this.octokit.request('GET /repos/{owner}/{repo}/commits', {
      owner,
      repo,
      per_page: 100, // GitHub API allows up to 100 commits per page
    });
    return fromPromise(req.then((response) => response.data));
  }

  getRepository(owner: string, repo: string): Observable<RepositoryModel> {
    const req = this.octokit.request('GET /repos/{owner}/{repo}', {
      owner,
      repo,
    });
    return fromPromise(req.then((response) => response.data));
  }

  searchRepositories(
    search: {
      searchType?: 'repositories' | 'issues';
      term?: string;
      stars?: number | null;
      language?: string | null;
    },
    page: number = 1,
    perPage: number = 10
  ): Observable<GitHubResults<RepositoryModel>> {
    switch (search.searchType) {
      case 'repositories':
      default:
        return this._getRepositoriesFromRepository(search, page, perPage);
      case 'issues':
        return this._getRepositoriesFromIssues(search, page, perPage);
        break;
    }
  }

  private _getRepositoriesFromRepository(
    search: {
      searchType?: 'repositories' | 'issues';
      term?: string;
      stars?: number | null;
      language?: string | null;
    },
    page: number = 1,
    perPage: number = 10
  ): Observable<GitHubResults<RepositoryModel>> {
    let query = search.term ?? '';
    if (search.stars) {
      query += ` stars:>=${search.stars}`;
    }
    if (search.language) {
      query += ` language:${search.language}`;
    }
    const req = this.octokit.request('GET /search/repositories', {
      q: query,
      page: page,
      per_page: perPage,
    });
    return fromPromise(req.then((response) => response.data));
  }

  private _getRepositoriesFromIssues(
    search: {
      searchType?: 'repositories' | 'issues';
      term?: string;
      stars?: number | null;
      language?: string | null;
    },
    page: number = 1,
    perPage: number = 10
  ): Observable<GitHubResults<RepositoryModel>> {
    let query = search.term ?? '';

    const req = this.octokit.request('GET /search/issues', {
      // is:issue will become mandatory in september 2025
      q: query + ' is:issue',
      page: page,
      per_page: perPage,
    });
    return fromPromise(req).pipe(
      switchMap((response) => {
        return forkJoin(
          response.data.items.map((item) =>
            // For each issue, we need to fetch the repository details
            // because the search/issues endpoint does not return the repository details.
            fromPromise(
              this.octokit
                .request(`GET ${item.repository_url}`)
                .then((repoResponse) => repoResponse.data)
            )
          )
        ).pipe(
          map((items) => ({
            total_count: response.data.total_count,
            incomplete_results: response.data.incomplete_results,
            items: items as RepositoryModel[],
          }))
        );
      })
    );
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

export abstract class GitHubDataSource<
  T extends Record<string, any> = RepositoryModel,
  P extends MatPaginator = MatPaginator
> extends DataSource<T> {
  /**
   * Instance of the paginator component used by the table to control what page of the data is
   * displayed. Page changes emitted by the paginator will trigger an update to the
   * table's rendered data.
   */
  get paginator(): P | null {
    return this._paginator;
  }

  set paginator(paginator: P | null) {
    this._paginator = paginator;
    this._updateChangeSubscription();
  }

  private _paginator: P | null = null;

  // Emits whenever the page index changes, allowing the data source to update its data.
  // This is necessary because the paginator only emits after user-generated changes, and we need
  // to know when to re-render the data if the search criteria reduce the number of items available
  // to display.
  private _internalPageChanges = new Subject<void>();

  readonly loading = signal<boolean>(false);
  readonly error = signal<boolean>(false);
  /**
   * Updates the paginator to reflect the length of the filtered data, and makes sure that the page
   * index does not exceed the paginator's last page. Values are changed in a resolved promise to
   * guard against making property changes within a round of change detection.
   */
  private _updatePaginator(filteredDataLength: number): void {
    Promise.resolve().then(() => {
      const paginator = this.paginator;
      console.log('paginator', paginator);
      console.log('filteredDataLength', filteredDataLength);
      if (!paginator) {
        return;
      }

      // The GitHub API can only read the first 1000 results, so we limit the paginator length to 1000.
      paginator.length = Math.min(filteredDataLength, 1000);

      // If the page index is set beyond the page, reduce it to the last page.
      if (paginator.pageIndex > 0) {
        const lastPageIndex =
          Math.ceil(paginator.length / paginator.pageSize) - 1 || 0;
        const newPageIndex = Math.min(paginator.pageIndex, lastPageIndex);

        if (newPageIndex !== paginator.pageIndex) {
          paginator.pageIndex = newPageIndex;

          // Since the paginator only emits after user-generated changes,
          // we need our own stream so we know to should re-render the data.
          this._internalPageChanges.next();
        }
      }
    });
  }

  private search: {
    term?: string;
    stars?: number | null;
    language?: string | null;
  } = {};

  setSearch(search: {
    term?: string;
    stars?: number | null;
    language?: string | null;
  }) {
    this.search = search;
    this._updateChangeSubscription();
  }

  private _data$$ = new Subject<T[]>();

  connect() {
    return this._data$$.asObservable();
  }

  disconnect() {
    this._renderChangesSubscription?.unsubscribe();
  }

  private _renderChangesSubscription: Subscription | null = null;
  private _updateChangeSubscription() {
    const pageChange: Observable<PageEvent | null | void> = this._paginator
      ? (merge(
          this._paginator.page,
          this._internalPageChanges,
          this._paginator.initialized
        ) as Observable<PageEvent | void>)
      : of(null);
    // Watched for paged data changes and send the result to the table to render.
    this._renderChangesSubscription?.unsubscribe();
    this._renderChangesSubscription = pageChange
      .pipe(
        tap(() => {
          this.loading.set(true);
          this.error.set(false);
        }),
        switchMap((pageChange) => {
          const page = pageChange ? pageChange.pageIndex + 1 : 1;
          const perPage = this._paginator ? this._paginator.pageSize : 10;
          return this._getData(this.search, page, perPage);
        }),
        tap((data) => {
          console.log('data', data);
          // Update the paginator with the new length of the data.
          this._updatePaginator(data.total_count);
        }),
        map((data) => data.items),
        tap(() => {
          this.loading.set(false);
        }),
        catchError((error) => {
          console.debug('Error fetching data:', error);
          this.loading.set(false);
          this.error.set(true);
          return of([]); // Return an empty array on error
        })
      )
      .subscribe((data) => this._data$$.next(data));
  }

  protected abstract _getData(
    search: {
      term?: string;
      stars?: number | null;
      language?: string | null;
    },
    page: number,
    perPage: number
  ): Observable<GitHubResults<T>>;
}

export class GitHubRepositoriesDataSource extends GitHubDataSource<RepositoryModel> {
  private githubService = inject(GithubService);
  protected _getData(
    search: {
      term?: string;
      stars?: number | null;
      language?: string | null;
    },
    page: number = 1,
    perPage: number = 10
  ): Observable<GitHubResults<RepositoryModel>> {
    return this.githubService.searchRepositories(search, page, perPage);
  }
}

export interface GitHubResults<T> {
  total_count: number;
  incomplete_results?: boolean;
  items: T[];
}
