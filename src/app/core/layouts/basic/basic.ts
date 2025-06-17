import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatNavList } from '@angular/material/list';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbar } from '@angular/material/toolbar';
import { Footer } from '../../../components/footer/footer';

@Component({
  selector: 'app-basic-layout',
  imports: [Footer],
  templateUrl: './basic.html',
  styleUrl: './basic.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BasicLayout {}
