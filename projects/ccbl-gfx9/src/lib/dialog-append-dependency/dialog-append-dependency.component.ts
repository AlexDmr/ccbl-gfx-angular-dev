import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import {MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef} from '@angular/material/legacy-dialog';
import {HumanReadableProgram, isNameUsedInProg, VariableDescription} from 'ccbl-js/lib/ProgramObjectInterface';

export interface DataAppendDependency {
  program: HumanReadableProgram,
  vType: 'channels' | 'emitters'| 'events';
  inOut: 'import' | 'export' | 'local';
  vd?: VariableDescription;
}

@Component({
  selector: 'lib-dialog-append-dependency',
  templateUrl: './dialog-append-dependency.component.html',
  styleUrls: ['./dialog-append-dependency.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DialogAppendDependencyComponent implements OnInit {
  vd: VariableDescription;
  pTitle: string;
  error: string = '';
  constructor(private dialogRef: MatDialogRef<DialogAppendDependencyComponent, VariableDescription>,
              @Inject(MAT_DIALOG_DATA) public data: DataAppendDependency) {
    let vt: string;
    let inOut: string;
    switch (this.data.vType) {
      case 'channels': vt = 'a channel'; break;
      case 'events':   vt = 'an event'; break;
      case 'emitters': vt = 'an emitter'; break;
    }
    switch (this.data.inOut) {
      case 'import': inOut = 'to be imported'; break;
      case 'export': inOut = 'to be exported'; break;
      case 'local':  inOut = 'locally'; break;
    }
    this.pTitle = `Append ${vt} ${inOut}`;

    this.vd = this.data.vd || {
      name: 'name',
      type: 'unknown'
    };
    this.checkIsNameUsed();
  }

  ngOnInit(): void {
  }

  cancel() {
    this.dialogRef.close();
  }

  ok() {
    this.dialogRef.close( this.vd );
  }

  get title(): string {
    return this.pTitle;
  }

  get name(): string {
    return this.vd.name;
  }

  set name(n: string) {
    this.vd.name = n;
    this.checkIsNameUsed();
  }

  checkIsNameUsed(): boolean {
    const d = isNameUsedInProg(this.vd.name, this.data.program);
    if (!!d) {
      this.error = `${this.vd.name} already exists in ${d.varRange} ${d.location}`;
    } else {
      this.error = '';
    }
    return !!d;
  }
}
