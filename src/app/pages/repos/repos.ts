import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-repos',
  imports: [],
  templateUrl: './repos.html',
  styleUrl: './repos.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Repos {}
