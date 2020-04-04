import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef, MatDialog} from '@angular/material/dialog';
import {
  HumanReadableProgram,
  ProgramReference,
  VariableDescription,
  EventTrigger,
  isNameUsedInProg,
  copyProgRef,
} from 'ccbl-js/lib/ProgramObjectInterface';

export interface DataEditProgramRef {
  parentProgram: HumanReadableProgram;
  progRef?: ProgramReference;
  editMode?: boolean;
}

@Component({
  selector: 'lib-dialog-edit-prog-instance',
  templateUrl: './dialog-edit-prog-instance.component.html',
  styleUrls: ['./dialog-edit-prog-instance.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DialogEditProgInstanceComponent implements OnInit {
  newProgRef: ProgramReference;
  originalName: string;

  static async editProgRef(dialog: MatDialog, data: DataEditProgramRef): Promise<ProgramReference> {
    const dialogRef = dialog.open<DialogEditProgInstanceComponent, DataEditProgramRef, ProgramReference>(
      DialogEditProgInstanceComponent, {
      data,
      closeOnNavigation: false
    });
    return dialogRef.afterClosed().toPromise();
  }

  constructor(private dialogRef: MatDialogRef<DialogEditProgInstanceComponent, ProgramReference>,
              @Inject(MAT_DIALOG_DATA) private data: DataEditProgramRef) {
    const sPName = this.subProgramsId[0];
    if (this.data.progRef) {
      this.newProgRef = copyProgRef( this.data.progRef );
      this.originalName = this.data.progRef.as;
    } else {
      this.newProgRef = {
        programId: sPName,
        mapInputs: {},
        as: `new instance of ${sPName}`
      };
    }
    // Map inputs

  }

  ngOnInit(): void {
  }

  get editMode(): boolean {
    return !!this.data.editMode;
  }

  cancel(): void {
    this.dialogRef.close();
  }

  ok(): void {
    this.dialogRef.close( this.newProgRef );
  }

  getEvent(name: string): EventTrigger {
    if (this.newProgRef.mapInputs[name] as EventTrigger) {
      return this.newProgRef.mapInputs[name] as EventTrigger;
    } else {
      const dep = this.data.parentProgram.dependencies;
      const L: VariableDescription[] = [
        ...(dep?.import?.events || []),
        ...(dep?.export?.events || []),
      ];
      const n = L.find(e => e.name === name)?.name || '';
      return {eventSource: n};
    }
  }

  getEmitter(name: string): string {
    const M = this.newProgRef.mapInputs[name];
    if (M) {
      return M as string;
    } else {
      const dep = this.data.parentProgram.dependencies;
      const L: VariableDescription[] = [
        ...(dep?.import?.emitters || []),
        ...(dep?.export?.emitters || []),
        ...(dep?.import?.channels || []),
        ...(dep?.export?.channels || []),
        ...(this.data.parentProgram?.localChannels)
      ];
      const n = L.find(e => e.name === name)?.name || '';
      return n;
    }
  }

  getChannel(name: string): string {
    const M = this.newProgRef.mapInputs[name];
    return M as string;
  }

  get parentProgram(): HumanReadableProgram {
    return this.data.parentProgram;
  }

  get subProgramsId(): string[] {
    return Object.keys( this.data.parentProgram.subPrograms );
  }

  get subProg(): HumanReadableProgram {
    return this.data.parentProgram.subPrograms[ this.newProgRef.programId ];
  }

  get availableEvents(): VariableDescription[] {
    return [
      ...(this.data.parentProgram.dependencies?.import?.events || []),
      ...(this.data.parentProgram.dependencies?.export?.events || [])
    ].sort();
  }

  get availableEmitters(): VariableDescription[] {
    return [
      ...(this.data.parentProgram.dependencies?.import?.emitters || []),
    ].sort();
  }

  get availableChannels(): VariableDescription[] {
    return [
      ...(this.data.parentProgram.dependencies?.import?.channels || []),
      ...(this.data.parentProgram.dependencies?.export?.emitters || []),
      ...(this.data.parentProgram.dependencies?.export?.channels || [])
    ].sort();
  }

  get eventsToMap(): VariableDescription[] {
    return this.subProg?.dependencies?.import?.events || [];
  }

  get emittersToMap(): VariableDescription[] {
    return this.subProg?.dependencies?.import?.emitters || [];
  }

  get channelsToMap(): VariableDescription[] {
    return this.subProg?.dependencies?.import?.channels || [];
  }

  get channels(): VariableDescription[] {
    const P = this.parentProgram;
    return [
      ...(P.dependencies?.import?.channels || []),
      ...(P.dependencies?.export?.channels || []),
      ...(P.localChannels || []),
    ];
  }

  get canValidate(): boolean {
    const SPs = this.data.parentProgram.subPrograms || {};
    const used = isNameUsedInProg( this.newProgRef.as, this.data.parentProgram );
    return (!used || (this.editMode && this.newProgRef.as === this.originalName)) &&
           !this.eventsToMap  .find( e => !this.newProgRef.mapInputs[e.name] ) &&
           !this.emittersToMap.find( e => !this.newProgRef.mapInputs[e.name] ) &&
           !this.channelsToMap.find( e => !this.newProgRef.mapInputs[e.name] )
           ;
  }

}
