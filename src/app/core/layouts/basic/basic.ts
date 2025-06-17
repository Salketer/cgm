import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-basic',
  imports: [],
  templateUrl: './basic.html',
  styleUrl: './basic.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BasicLayout {}
