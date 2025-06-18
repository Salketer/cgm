import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { signal } from '@angular/core';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  startWith,
} from 'rxjs/operators';
import { inject } from '@angular/core';
import {
  GitHubRepositoriesDataSource,
  GithubService,
} from '../../core/services/github';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator } from '@angular/material/paginator';
import { CommonModule, DatePipe } from '@angular/common';
import { BasicLayout } from '../../core/layouts/basic/basic';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { combineLatest } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import {
  MatProgressSpinner,
  MatSpinner,
} from '@angular/material/progress-spinner';
import { GithubProfile } from '../../components/github-profile/github-profile';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

@Component({
  selector: 'app-repos',
  imports: [
    MatTableModule,
    MatInputModule,
    ReactiveFormsModule,
    MatPaginator,
    DatePipe,
    BasicLayout,
    MatIconModule,
    MatSelectModule,
    CommonModule,
    MatCardModule,
    MatProgressSpinner,
    GithubProfile,
    MatButtonToggleModule,
  ],
  templateUrl: './repos.html',
  styleUrl: './repos.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Repos {
  private githubService = inject(GithubService);
  private router = inject(Router);

  /**
   * Used to filter the available languages.
   */
  languageFilterCtrl = new FormControl<string | null>('');

  /**
   * Provides a filtered list of languages based on input.
   */
  protected readonly filteredLanguages = combineLatest({
    filterValue: this.languageFilterCtrl.valueChanges.pipe(startWith('')),
    availableLanguages: this.githubService.getAvailableLanguages(),
  }).pipe(
    debounceTime(200),
    distinctUntilChanged(),
    map(({ filterValue, availableLanguages }) => {
      if (!filterValue || filterValue.trim() === '') {
        return availableLanguages;
      }
      const searchLower = filterValue.toLowerCase();
      return availableLanguages.filter((language) =>
        language.name.toLowerCase().includes(searchLower)
      );
    })
  );

  protected readonly searchTypeControl = new FormControl<
    'repositories' | 'users'
  >('repositories', { nonNullable: true });

  protected readonly searchFormGroup = new FormGroup({
    searchType: this.searchTypeControl,
    term: new FormControl('', { nonNullable: true }),
    stars: new FormControl(null, Validators.min(0)),
    language: new FormControl(''),
  });

  protected searchControl = new FormControl('');

  protected reposDatasource = new GitHubRepositoriesDataSource();

  @ViewChild('paginator', { static: true })
  set paginator(v: MatPaginator | null) {
    this.reposDatasource.paginator = v;
  }

  protected reposColumns = ['name', 'owner', 'createdAt'];

  goToCommits(owner: string, repo: string): void {
    this.router.navigate(['/commits', owner, repo]);
  }

  constructor() {
    this.searchTypeControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((searchType) => {
        // Only the repositories search type can make use of the stars and language filters.
      });
    // Reset the search term when the search type changes

    this.searchFormGroup.valueChanges
      .pipe(
        // Make sure the form is valid before proceeding
        filter(() => this.searchFormGroup.valid),
        // Debounce to avoid too many requests
        debounceTime(200),
        distinctUntilChanged(),
        takeUntilDestroyed()
      )
      .subscribe((searchValue) => {
        // We are only chaging the query params instead of calling the search directly.
        // The router state change will tigger it, this allows for history navigation to work properly.
        this.router.navigate([], {
          queryParams: searchValue,
        });
      });

    this.router.routerState.root.queryParams
      .pipe(
        // ensure we get the initial query params
        startWith(this.router.routerState.snapshot.root.queryParams),
        takeUntilDestroyed()
      )
      .subscribe((queryParams) => {
        // Make sure the search form is updated with the current query params
        // This is useful when the user navigates back to this page with query params already set
        if (queryParams['searchType'] === 'repositories') {
          this.searchFormGroup.get('stars')?.enable({ emitEvent: false });
          this.searchFormGroup.get('language')?.enable({ emitEvent: false });
        } else {
          this.searchFormGroup.get('stars')?.disable({ emitEvent: false });
          this.searchFormGroup.get('language')?.disable({ emitEvent: false });
        }
        this.searchFormGroup.patchValue(queryParams, { emitEvent: false });
        this.reposDatasource.setSearch(queryParams);
      });
  }
}
