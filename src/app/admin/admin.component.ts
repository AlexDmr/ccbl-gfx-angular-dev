import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { HumanReadableProgram } from 'ccbl-js/lib/ProgramObjectInterface';
import { ProgVersionner } from 'projects/ccbl-gfx9/src/lib/ccbl-gfx9.service';
import { ProxyCcblProg } from 'projects/ccbl-gfx9/src/lib/ProxyCcblProg';
import { RemoteProxyCcblProgService } from 'projects/ccbl-gfx9/src/lib/remote-proxy-ccbl-prog.service';
import { Subscription } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {provide: ProxyCcblProg, useClass: RemoteProxyCcblProgService }
  ]
})
export class AdminComponent implements OnInit, OnDestroy {
  readonly obsProgram: Observable<HumanReadableProgram>;
  readonly progV = new ProgVersionner( {} );
  private sub?: Subscription;

  constructor(private proxyCcbl: ProxyCcblProg) {
    proxyCcbl.connect("ws://localhost:3001");
    this.obsProgram = proxyCcbl.program;
    this.sub = this.obsProgram.subscribe( P => {
      console.log("Program updated with", P)
      this.progV.updateWith(P)
    })
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

}
