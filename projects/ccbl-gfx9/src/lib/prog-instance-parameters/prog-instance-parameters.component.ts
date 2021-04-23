import { Component, OnInit, Input, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { HumanReadableProgram, ProgramReference, VariableDescription, EventTrigger, copyContextOrProgram, ProgramInput } from 'ccbl-js/lib/ProgramObjectInterface';
import { getUID, getDisplay, updateDisplay } from '../ccbl-gfx9.service';

@Component({
  selector: 'lib-prog-instance-parameters',
  templateUrl: './prog-instance-parameters.component.html',
  styleUrls: ['./prog-instance-parameters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProgInstanceParametersComponent implements OnInit {
  @Input() parentProgram: HumanReadableProgram | undefined;
  @Input() set initialProgRef(pg: ProgramReference) {
    this.progRef = copyContextOrProgram(pg) as ProgramReference;
  };
  progRef: ProgramReference | undefined;
  @Output() update = new EventEmitter<ProgramReference>();

  constructor() { }

  ngOnInit(): void {
  }

  updateParameter(name: string, value: ProgramInput) {
    this.progRef!.mapInputs![name] = value;
    this.update.emit(this.progRef);
  }

  get subProg(): HumanReadableProgram {
    return this.parentProgram!.subPrograms![ this.progRef!.programId ];
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
      ...(P?.dependencies?.import?.channels || []),
      ...(P?.dependencies?.export?.channels || []),
      ...(P?.localChannels || []),
    ];
  }


  getEvent(name: string): EventTrigger {
    if (this.progRef!.mapInputs![name] as EventTrigger) {
      return this.progRef!.mapInputs![name] as EventTrigger;
    } else {
      const dep = this.parentProgram!.dependencies;
      const L: VariableDescription[] = [
        ...(dep?.import?.events || []),
        ...(dep?.export?.events || []),
      ];
      const n = L.find(e => e.name === name)?.name || '';
      return {eventSource: n};
    }
  }

  getChannel(name: string): string {
    const M = this.progRef!.mapInputs![name];
    if (M) {
      return M as string;
    } else {
      const dep = this.parentProgram!.dependencies;
      const L: VariableDescription[] = [
        ...(dep?.import?.channels || []),
        ...(dep?.export?.channels || []),
        ...(this.parentProgram?.localChannels || [])
      ];
      return L.find(e => e.name === name)?.name || '';
    }
  }

  getEmitter(name: string): string {
    const M = this.progRef!.mapInputs![name];
    if (M) {
      return M as string;
    } else {
      const dep = this.parentProgram!.dependencies;
      const L: VariableDescription[] = [
        ...(dep?.import?.emitters || []),
        ...(dep?.export?.emitters || []),
        ...(dep?.import?.channels || []),
        ...(dep?.export?.channels || []),
        ...(this.parentProgram?.localChannels || [])
      ];
      const n = L.find(e => e.name === name)?.name || '';
      return n;
    }
  }
}

