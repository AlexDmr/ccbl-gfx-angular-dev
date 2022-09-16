import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import { ProxyCcblProg } from 'projects/ccbl-gfx9/src/lib/ProxyCcblProg';
import { RemoteProxyCcblProgService } from 'projects/ccbl-gfx9/src/lib/remote-proxy-ccbl-prog.service';
import { UserService } from './user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {provide: ProxyCcblProg, useClass: RemoteProxyCcblProgService },
    UserService
  ]
})
export class AppComponent implements OnInit {

  constructor(public US: UserService) {
  }

  ngOnInit() {
    //
  }

}
