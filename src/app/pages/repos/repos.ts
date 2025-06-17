import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { signal } from '@angular/core';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  tap,
} from 'rxjs/operators';
import { inject } from '@angular/core';
import { GithubService } from '../../core/services/github';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator } from '@angular/material/paginator';
import { DatePipe } from '@angular/common';
import { BasicLayout } from '../../core/layouts/basic/basic';

@Component({
  selector: 'app-repos',
  imports: [
    MatTableModule,
    MatInputModule,
    ReactiveFormsModule,
    MatPaginator,
    DatePipe,
    BasicLayout,
  ],
  templateUrl: './repos.html',
  styleUrl: './repos.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Repos {
  private githubService = inject(GithubService);

  protected searchControl = new FormControl('');
  protected reposDatasource = this.searchControl.valueChanges.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap((term) => {
      if (!term?.trim()) {
        return [];
      }

      this.loading.set(true);
      this.error.set(null);

      return this.githubService.searchRepositories(term).pipe(
        catchError((err) => {
          this.error.set('Failed to fetch repositories');
          this.loading.set(false);
          return [];
        })
      );
    }),
    tap(() => {
      this.loading.set(false);
    })
  );
  protected reposColumns = ['name', 'owner', 'createdAt'];
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
}
