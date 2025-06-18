import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BasicLayout } from '../../core/layouts/basic/basic';
import { DatePipe, AsyncPipe, CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { Avatar } from '../../components/avatar/avatar';
import { GithubService } from '../../core/services/github';
import { debounceTime, filter, map, startWith, switchMap } from 'rxjs';
import { GithubProfile } from '../../components/github-profile/github-profile';

@Component({
  selector: 'app-commits',
  imports: [
    BasicLayout,
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
    GithubProfile,
  ],
  templateUrl: './commits.html',
  styleUrl: './commits.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Commits {
  private readonly route = inject(ActivatedRoute);
  private readonly gitHubService = inject(GithubService);

  protected commitsColumns = ['author', 'url', 'message'];

  protected readonly searchControl = new FormControl<string>('');

  protected readonly repoName$ = this.route.paramMap.pipe(
    filter((params) => params.has('owner') && params.has('repo')),
    map((params) => ({
      // We force the presence of 'owner' and 'repo' parameters since we just tested for their existence
      owner: params.get('owner')!,
      repo: params.get('repo')!,
    }))
  );
  protected readonly commitsDatasource = this.repoName$.pipe(
    switchMap((params) =>
      this.gitHubService.getCommits(params.owner, params.repo)
    ),
    switchMap((commits) => {
      return this.searchControl.valueChanges.pipe(
        startWith(this.searchControl.value),
        debounceTime(75),
        map((searchTerm) => {
          if (!searchTerm) {
            return commits;
          }
          const lowerSearchTerm = searchTerm.toLowerCase();
          return commits.filter((commit) =>
            commit.commit.message.toLowerCase().includes(lowerSearchTerm)
          );
        })
      );
    })
  );

  goBack() {
    window.history.back();
  }
}
