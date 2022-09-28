import {ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef, MatDialog} from '@angular/material/dialog';
import {copyHumanReadableProgram, HumanReadableProgram, VariableDescription} from 'ccbl-js/lib/ProgramObjectInterface';
import {Observable} from 'rxjs';
import {ProgVersionner} from '../ccbl-gfx9.service';
import { map } from 'rxjs/operators';
import { DataAppendDependency, DialogAppendDependencyComponent } from '../dialog-append-dependency/dialog-append-dependency.component';

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
  // _localChannelsObs: Observable<VariableDescription[]>;

  constructor(private dialogRef: MatDialogRef<DialogEditSubProgramComponent, HumanReadableProgram>,
              @Inject(MAT_DIALOG_DATA) private data: DataEditSubProgram,
              private matDialog: MatDialog ) {
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
    this.progV.updateWith({
      ...this.progV.getCurrent(),
      dependencies: P.dependencies || {}
    });
  }

  updateTitle(title: string) {
    this.progV.updateWith({...this.progV.getCurrent(), label: title});
  }

  updateDescription(description: string): void {
    this.progV.updateWith({...this.progV.getCurrent(), description});
  }

  updateDescriptionFromRaw(str: string) {
    try {
      const json = JSON.parse(str) as HumanReadableProgram;
      this.progV.updateWith( json );
    } catch (err) {
      console.error(err);
    }
  }

  deleteLocalChannel(chan: VariableDescription): void {
    this.progV.removeVariableDescription(chan);
  }

  async appendLocalChannel(): Promise<VariableDescription> {
    const data: DataAppendDependency = {
      program: this.data.program,
      vType: 'channels',
      inOut: 'local'
    };
    const dialogRef = this.matDialog.open(DialogAppendDependencyComponent, {
      data,
      closeOnNavigation: false
    });
    const vd: VariableDescription = await dialogRef.afterClosed().toPromise();
    if (vd) {
      this.progV.appendLocalChannel(vd);
    }
    return vd;
  }

}
