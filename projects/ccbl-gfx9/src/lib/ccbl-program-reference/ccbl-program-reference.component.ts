import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {ProgVersionner} from '../ccbl-gfx9.service';
import {HumanReadableProgram, ProgramReference, VariableDescription, ProgramInput} from 'ccbl-js/lib/ProgramObjectInterface';
import { DialogEditProgInstanceComponent } from '../dialog-edit-prog-instance/dialog-edit-prog-instance.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'lib-ccbl-program-reference',
  templateUrl: './ccbl-program-reference.component.html',
  styleUrls: ['./ccbl-program-reference.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CcblProgramReferenceComponent implements OnInit {
  @Input('program-versionner') private progVersionner: ProgVersionner;
  @Input() data: ProgramReference;
  extendedMode = false;

  constructor(private matDialog: MatDialog) { }

  ngOnInit() {
  }

  get inputChannels(): VariableDescription[] {
    return this.program?.dependencies?.import?.channels || [];
  }

  get inputEmitters(): VariableDescription[] {
    return this.program?.dependencies?.import?.emitters || [];
  }

  get inputEvents(): VariableDescription[] {
    return this.program?.dependencies?.import?.events || [];
  }

  get outputChannels(): VariableDescription[] {
    return this.program?.dependencies?.export?.channels || [];
  }

  get outputEmitters(): VariableDescription[] {
    return this.program?.dependencies?.export?.emitters || [];
  }

  get outputEvents(): VariableDescription[] {
    return this.program?.dependencies?.export?.events || [];
  }

  private get program(): HumanReadableProgram {
    const subPrograms = this.progVersionner.getCurrent().subPrograms;
    return subPrograms ? subPrograms[this.data.programId] : undefined;
  }

  getMapValue(n: string): string {
    const m = this.data.mapInputs[n];
    return m !== undefined ? m.toString() : n;
  }

  shortInputs(): PARAM[] {
    return [
      ...this.inputChannels.map(c => ({class: 'channel', label: c.name, value: this.getMapValue(c.name)})),
      ...this.inputEmitters.map(c => ({class: 'emitter', label: c.name, value: this.getMapValue(c.name)})),
      ...this.inputEvents  .map(c => ({class: 'event'  , label: c.name, value: this.getMapValue(c.name)})),
    ];
  }

  shortOuputs(): PARAM[] {
    return [
      ...this.outputChannels.map(c => ({class: 'channel', label: c.name, value: c.name})),
      ...this.outputEmitters.map(c => ({class: 'emitter', label: c.name, value: c.name})),
      ...this.outputEvents  .map(c => ({class: 'event'  , label: c.name, value: c.name})),
    ];
  }

  async edit() {
    const progRef = await DialogEditProgInstanceComponent.editProgRef(this.matDialog, {
      progRef: this.data,
      parentProgram: this.progVersionner.getCurrent(),
      editMode: true
    } );
    if (progRef) {
      this.progVersionner.updateProrgamReference(this.data, progRef);
    }
  }

  delete() {
    this.progVersionner.removeContext(this.data);
  }
}

export interface PARAM {
  class: string;
  label: string;
  value: string;
}
