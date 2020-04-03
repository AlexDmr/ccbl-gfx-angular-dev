import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {copyContextOrProgram, HumanReadableProgram, ProgramReference, VariableDescription} from 'ccbl-js/lib/ProgramObjectInterface';

export interface DataEditProgramRef {
  parentProgram: HumanReadableProgram;
  progRef?: ProgramReference;
}

@Component({
  selector: 'lib-dialog-edit-prog-instance',
  templateUrl: './dialog-edit-prog-instance.component.html',
  styleUrls: ['./dialog-edit-prog-instance.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DialogEditProgInstanceComponent implements OnInit {
  newProgRef: ProgramReference;

  constructor(private dialogRef: MatDialogRef<DialogEditProgInstanceComponent, ProgramReference>,
              @Inject(MAT_DIALOG_DATA) private data: DataEditProgramRef) {
    const sPName = this.subProgramsId[0];
    if (this.data.progRef) {
      this.newProgRef = this.data.progRef
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

  cancel(): void {
    this.dialogRef.close();
  }

  ok(): void {
    this.dialogRef.close( this.newProgRef );
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

  get eventMappings(): [string, string][] {
    const L: VariableDescription[] = this.subProg?.dependencies?.import?.events || [];
    return L.map( ({name, type}) => {
      const mapId = this.newProgRef.mapInputs[name];
      if (mapId !== undefined) {
        return [name, mapId];
      } else {
        if ( this.availableEvents.find(vd => vd.name === name) ) {
          return [name, name];
        } else {
          return [name, undefined];
        }
      }
    }) as [string, string][];
  }

  get emitterMappings(): [string, string][] {
    return [];
  }

  get channelMappings(): [string, string][] {
    return [];
  }

}
