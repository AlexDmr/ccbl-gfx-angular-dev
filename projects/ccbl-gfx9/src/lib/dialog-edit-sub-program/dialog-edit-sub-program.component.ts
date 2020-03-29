import {ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {copyHumanReadableProgram, HumanReadableProgram} from 'ccbl-js/lib/ProgramObjectInterface';
import {Observable} from 'rxjs';
import {ProgVersionner} from '../ccbl-gfx9.service';

export interface DataEditSubProgram {
  parentProgram: HumanReadableProgram;
  program: HumanReadableProgram;
}

@Component({
  selector: 'lib-dialog-edit-sub-program',
  templateUrl: './dialog-edit-sub-program.component.html',
  styleUrls: ['./dialog-edit-sub-program.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DialogEditSubProgramComponent implements OnInit, OnDestroy {
  progV: ProgVersionner;
  progObs: Observable<HumanReadableProgram>;

  constructor(private dialogRef: MatDialogRef<DialogEditSubProgramComponent, HumanReadableProgram>,
              @Inject(MAT_DIALOG_DATA) private data: DataEditSubProgram) {
    this.progV = new ProgVersionner( copyHumanReadableProgram(this.data.program) );
    this.progObs = this.progV.asObservable();
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.progV.dispose();
  }

  cancel(): void {
    this.dialogRef.close();
  }

  ok(): void {
    this.dialogRef.close( this.progV.getCurrent() );
  }

  updateAPI(P: HumanReadableProgram) {
    this.progV.updateWith(P);
  }

  updateTitle(title: string) {
    this.progV.updateWith({...this.progV.getCurrent(), name: title});
  }

  updateDescription(description: string): void {
    this.progV.updateWith({...this.progV.getCurrent(), description});
  }
}
