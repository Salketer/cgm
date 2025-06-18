import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BasicLayout } from '../../core/layouts/basic/basic';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-index',
  imports: [MatInputModule, MatIcon, BasicLayout, FormsModule],
  templateUrl: './index.html',
  styleUrl: './index.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Index {
  private router = inject(Router);
  protected searchTerm = '';

  searchRepositories() {
    this.router.navigate(['/repos'], {
      queryParams: { term: this.searchTerm, searchType: 'repositories' },
    });
  }
}
