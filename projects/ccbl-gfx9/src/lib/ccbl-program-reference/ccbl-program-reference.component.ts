import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {ProgVersionner} from '../ccbl-gfx9.service';
import {HumanReadableProgram, ProgramReference, VariableDescription} from 'ccbl-js/lib/ProgramObjectInterface';
import {EditableOptionType} from '../editable-option/editable-option.component';

@Component({
  selector: 'lib-ccbl-program-reference',
  templateUrl: './ccbl-program-reference.component.html',
  styleUrls: ['./ccbl-program-reference.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CcblProgramReferenceComponent implements OnInit {
  @Input('program-versionner') private progVersionner: ProgVersionner;
  @Input() data: ProgramReference;

  constructor() { }

  ngOnInit() {
  }

  get inputChannels(): VariableDescription[] {
    return this.getInput('channels');
  }

  get inputEmitters(): VariableDescription[] {
    return this.getInput('emitters');
  }

  get inputEvents(): VariableDescription[] {
    return this.getInput('events');
  }

  get outputChannels(): VariableDescription[] {
    return this.getOutput('channels');
  }

  get outputEmitters(): VariableDescription[] {
    return this.getOutput('emitters');
  }

  get outputEvents(): VariableDescription[] {
    return this.getOutput('events');
  }

  get possibleEmitters(): EditableOptionType<string>[] {
    return [...this.inputEmitters, ...this.inputChannels].map( vd => ({
        label: vd.name,
        value: vd.name
      })
    ).sort( (a, b) => a.label > b.label ? 1 : -1 );
  }

  get possibleChannels(): EditableOptionType<string>[] {
    return [...this.inputChannels].map( vd => ({
        label: vd.name,
        value: vd.name
      })
    ).sort( (a, b) => a.label > b.label ? 1 : -1 );
  }

  get possibleEvents(): EditableOptionType<string>[] {
    return [...this.inputEvents].map( vd => ({
        label: vd.name,
        value: vd.name
      })
    ).sort( (a, b) => a.label > b.label ? 1 : -1 );
  }

  getValueOfInput(name: string): string {
    const map = this.data.mapInputs[name];
    return map ? map : name;
  }

  updateInput(type: varType, id: string, value: string) {
    const newProgRef = {...this.data};
    newProgRef.mapInputs = newProgRef.mapInputs ? {...newProgRef.mapInputs} : {};
    newProgRef.mapInputs[id] = value;
    this.progVersionner.updateProrgamReference(this.data, newProgRef);
  }

  private get program(): HumanReadableProgram {
    const subPrograms = this.progVersionner.getCurrent().subPrograms;
    return subPrograms ? subPrograms[this.data.programId] : undefined;
  }

  private getInput(from: varType): VariableDescription[] {
    const dep = this.program.dependencies;
    if (dep && dep.import && dep.import[from]) {
      return dep.import[from];
    } else {
      return [];
    }
  }

  private getOutput(from: varType): VariableDescription[] {
    const dep = this.program.dependencies;
    if (dep && dep.export && dep.export[from]) {
      return dep.export[from];
    } else {
      return [];
    }
  }
}

export type varType = 'channels' | 'emitters' | 'events';
