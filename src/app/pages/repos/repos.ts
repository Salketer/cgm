import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
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
  GitHubDataSource,
  GitHubRepositoriesDataSource,
  GithubService,
  RepositoryModel,
} from '../../core/services/github';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator } from '@angular/material/paginator';
import { CommonModule, DatePipe } from '@angular/common';
import { BasicLayout } from '../../core/layouts/basic/basic';
import { Avatar } from '../../components/avatar/avatar';
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

@Component({
  selector: 'app-repos',
  imports: [
    MatTableModule,
    MatInputModule,
    ReactiveFormsModule,
    MatPaginator,
    DatePipe,
    BasicLayout,
    Avatar,
    MatIconModule,
    MatSelectModule,
    CommonModule,
    MatCardModule,
    MatProgressSpinner,
  ],
  templateUrl: './repos.html',
  styleUrl: './repos.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Repos {
  private githubService = inject(GithubService);

  private router = inject(Router);

  languageFilterCtrl = new FormControl<string | null>('');

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

  protected readonly searchFormGroup = new FormGroup({
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
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  goToCommits(owner: string, repo: string): void {
    this.router.navigate(['/commits', owner, repo]);
  }

  constructor() {
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
        this.reposDatasource.setSearch(searchValue);
      });
  }
}
