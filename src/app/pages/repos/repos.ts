import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { signal } from '@angular/core';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  tap,
  throttleTime,
} from 'rxjs/operators';
import { inject } from '@angular/core';
import { GithubService } from '../../core/services/github';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator } from '@angular/material/paginator';
import { DatePipe } from '@angular/common';
import { BasicLayout } from '../../core/layouts/basic/basic';
import { Avatar } from '../../components/avatar/avatar';
import { Router } from '@angular/router';

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
  ],
  templateUrl: './repos.html',
  styleUrl: './repos.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Repos {
  private githubService = inject(GithubService);

  private router = inject(Router);

  protected searchControl = new FormControl('');
  protected reposDatasource = this.searchControl.valueChanges.pipe(
    debounceTime(200),
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
      new MatTableDataSource<any>([]);
    })
  );
  protected reposColumns = ['name', 'owner', 'createdAt'];
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  goToCommits(owner: string, repo: string): void {
    this.router.navigate(['/commits', owner, repo]);
  }
}
