import { Component, OnInit } from '@angular/core';
import { ProgVersionner } from 'projects/ccbl-gfx9/src/public-api';
import { HumanReadableProgram } from 'ccbl-js/lib/ProgramObjectInterface';
import { CcblValidatorService } from '../ccbl-validator.service';

@Component({
  selector: 'app-test-editor-verif',
  templateUrl: './test-editor-verif.component.html',
  styleUrls: ['./test-editor-verif.component.scss']
})
export class TestEditorVerifComponent implements OnInit {
  progV: ProgVersionner;

  constructor(private validator: CcblValidatorService) {
    const json = localStorage.getItem('TestEditorVerif');
    const P: HumanReadableProgram = json ? JSON.parse(json) : {};
    this.progV = new ProgVersionner( P );
    this.progV.asObservable().subscribe( nP => localStorage.setItem('TestEditorVerif', JSON.stringify(nP)) );
  }

  ngOnInit(): void {
  }

  validate() {
    this.validator.validate( this.progV.getCurrent() );
  }
}
