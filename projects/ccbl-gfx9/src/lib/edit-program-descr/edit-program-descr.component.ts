import {Component, Inject, OnInit} from '@angular/core';
import {copyHumanReadableProgram, HumanReadableProgram} from 'ccbl-js/lib/ProgramObjectInterface';
import {ProgVersionner} from '../ccbl-gfx9.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

export interface DataEditProgramDescr {
  program: HumanReadableProgram;
  progV: ProgVersionner;
}

@Component({
  selector: 'lib-edit-program-descr',
  templateUrl: './edit-program-descr.component.html',
  styleUrls: ['./edit-program-descr.component.scss']
})
export class EditProgramDescrComponent implements OnInit {
  newProg: HumanReadableProgram;

  constructor(private dialogRef: MatDialogRef<EditProgramDescrComponent, HumanReadableProgram>,
              @Inject(MAT_DIALOG_DATA) public data: DataEditProgramDescr
  ) {
    this.newProg = copyHumanReadableProgram(data.program, false);
  }

  ngOnInit(): void {
  }

  cancel() {
    this.dialogRef.close();
  }

  ok() {
    this.dialogRef.close( this.newProg );
  }

}
