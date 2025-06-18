import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { Avatar } from '../avatar/avatar';

@Component({
  selector: 'app-github-profile',
  imports: [Avatar],
  templateUrl: './github-profile.html',
  styleUrl: './github-profile.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GithubProfile {
  @Input() profile?: {
    login: string;
    avatar_url: string;
  };
}
