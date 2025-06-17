import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-commits',
  imports: [],
  templateUrl: './commits.html',
  styleUrl: './commits.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Commits implements OnInit {
  private route = inject(ActivatedRoute);

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      // Access your route parameter here, for example:
      // const id = params.get('id');
      console.log('Route params:', params);
    });
  }
}
