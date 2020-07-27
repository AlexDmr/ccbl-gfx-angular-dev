import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ProgVersionner } from 'projects/ccbl-gfx9/src/public-api';
import { HumanReadableProgram } from 'ccbl-js/lib/ProgramObjectInterface';
import { SmtService } from '../smt.service';
import { ActionsPath } from '../smt.definitions';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-test-editor-verif',
  templateUrl: './test-editor-verif.component.html',
  styleUrls: ['./test-editor-verif.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestEditorVerifComponent implements OnInit {
  progV: ProgVersionner;
  LAP = new BehaviorSubject<ActionsPath[]>([]);

  constructor(private smtService: SmtService) {
    const json = localStorage.getItem('TestEditorVerif');
    const P: HumanReadableProgram = json ? JSON.parse(json) : {};
    this.progV = new ProgVersionner( P );
    this.progV.asObservable().subscribe( nP => localStorage.setItem('TestEditorVerif', JSON.stringify(nP)) );
  }

  ngOnInit(): void {
  }

  async validate() {
    this.LAP.next( await this.smtService.evalProgram( this.progV.getCurrent() ) );
  }
}
