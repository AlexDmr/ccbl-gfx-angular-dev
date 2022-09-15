import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import { UserService } from './user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {

  constructor(public US: UserService) {
  }

  ngOnInit() {
    //
  }

}
