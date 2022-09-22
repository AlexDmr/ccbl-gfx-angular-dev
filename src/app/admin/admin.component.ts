import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { HumanReadableProgram } from 'ccbl-js/lib/ProgramObjectInterface';
import { ProgVersionner } from 'projects/ccbl-gfx9/src/lib/ccbl-gfx9.service';
import { ProxyCcblProg } from 'projects/ccbl-gfx9/src/lib/ProxyCcblProg';
import { map, shareReplay } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminComponent implements OnInit, OnDestroy {
  readonly obsPrograms: Observable<{path: string[], program: HumanReadableProgram}[]>;
  readonly obsLprogV: Observable<{label: string, PV: ProgVersionner}[]>;
  // private sub?: Subscription;

  constructor(private proxyCcbl: ProxyCcblProg) {
    this.obsPrograms = proxyCcbl.programs;
    this.obsLprogV = this.obsPrograms.pipe(
      map( LP => LP.map( P => ({label: P.path.join("/"), PV: new ProgVersionner(P.program)}) ) ),
      shareReplay(1)
    );
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    // this.sub?.unsubscribe();
  }

}
