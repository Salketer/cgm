import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-basic',
  imports: [],
  templateUrl: './basic.html',
  styleUrl: './basic.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BasicLayout {}
