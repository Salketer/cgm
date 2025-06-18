import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-avatar',
  imports: [],
  templateUrl: './avatar.html',
  styleUrl: './avatar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Avatar {
  /**
   * The absolute URL of the avatar image.
   * If not provided, a default avatar will be used.
   *  */
  @Input() url?: string;
}
