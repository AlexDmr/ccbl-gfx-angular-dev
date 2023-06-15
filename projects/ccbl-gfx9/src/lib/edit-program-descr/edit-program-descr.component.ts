import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import {copyHumanReadableProgram, HumanReadableProgram, VariableDescription} from 'ccbl-js/lib/ProgramObjectInterface';
import {ProgVersionner} from '../ccbl-gfx9.service';
import {MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef} from '@angular/material/legacy-dialog';
import {DataAppendDependency, DialogAppendDependencyComponent} from '../dialog-append-dependency/dialog-append-dependency.component';
import {BehaviorSubject} from 'rxjs';
import {
  DataEditSubProgram,
  DialogEditSubProgramComponent
} from '../dialog-edit-sub-program/dialog-edit-sub-program.component';

export interface DataEditProgramDescr {
  program: HumanReadableProgram;
  // progV: ProgVersionner;
}

@Component({
  selector: 'lib-edit-program-descr',
  templateUrl: './edit-program-descr.component.html',
  styleUrls: ['./edit-program-descr.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditProgramDescrComponent implements OnInit {
  newProgSubj = new BehaviorSubject<HumanReadableProgram | undefined>(undefined);

  constructor(private dialogRef: MatDialogRef<EditProgramDescrComponent, HumanReadableProgram>,
              @Inject(MAT_DIALOG_DATA) private data: DataEditProgramDescr,
              private matDialog: MatDialog
  ) {
    this.newProgSubj.next(copyHumanReadableProgram(data.program));
  }

  ngOnInit(): void {
  }

  updateAPI(newProg: HumanReadableProgram) {
    this.newProgSubj.next(newProg);
  }

  cancel() {
    this.dialogRef.close();
  }

  ok() {
    this.dialogRef.close( this.newProgSubj.getValue() );
  }

  get program(): HumanReadableProgram {
    return this.data.program;
  }
  /*get progV(): ProgVersionner {
    return this.data.progV;
  }*/

  get localChannels(): VariableDescription[] {
    return this.newProgSubj.getValue()?.localChannels || [];
  }

  async appendLocalChannel() {
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
      this.newProgSubj.next( {
        ...this.newProgSubj.getValue(),
        localChannels: [...this.localChannels, vd]
      });
    }
  }

  deleteLocalChannel(vd: VariableDescription) {
    this.newProgSubj.next( {
      ...this.newProgSubj.getValue(),
      localChannels: this.localChannels.filter(VD => VD !== vd)
    });
  }

  get subPrograms(): {name: string, prog: HumanReadableProgram}[] {
    const obj = this.newProgSubj.getValue()?.subPrograms || {};
    return Object.keys(obj).map(name => ({name, prog: obj[name]})) || [];
  }

  async editSubProgram(name?: string) {
    throw "Must reimplement editSubProgram !!!";
    /*
    const data: DataEditSubProgram = {
      parentProgram: this.program,
      program: (name && this.program.subPrograms) ? {...this.program.subPrograms[name], name} : {name}
    };
    const dialogRef = this.matDialog.open<DialogEditSubProgramComponent, DataEditSubProgram, HumanReadableProgram>(
      DialogEditSubProgramComponent, {
      data,
      closeOnNavigation: false,
      width: '100%',
      height: '100%',
      maxWidth: '100%'
    });
    const SP = await dialogRef.afterClosed().toPromise();
    if (SP) {
      if (name !== undefined && SP.name !== name) {
        // Remove old name
        delete this.program.subPrograms![name];
      }
      const subPrograms: {[key: string]: HumanReadableProgram} = this.program.subPrograms || {};
      subPrograms[SP.name!] = SP;
      this.newProgSubj.next({...this.program, subPrograms} );
    }
    */
  }

  deleteSubProgram(p: HumanReadableProgram) {
    const subPrograms: {[key: string]: HumanReadableProgram} = {};
    Object.keys(this.program.subPrograms ?? {}) .filter( n => this.program.subPrograms?.[n] !== p )
                                                .forEach( n => subPrograms[n] = this.program.subPrograms![n]! );
    this.newProgSubj.next({...this.program, subPrograms} );
  }
}
