import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {copyHumanReadableProgram, HumanReadableProgram, VariableDescription} from 'ccbl-js/lib/ProgramObjectInterface';
import {ProgVersionner} from '../ccbl-gfx9.service';
import {MatDialog} from '@angular/material/dialog';
import {DataAppendDependency, DialogAppendDependencyComponent} from '../dialog-append-dependency/dialog-append-dependency.component';

@Component({
  selector: 'lib-ccbl-program-api',
  templateUrl: './ccbl-program-api.component.html',
  styleUrls: ['./ccbl-program-api.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CcblProgramApiComponent implements OnInit {
  @Input() program: HumanReadableProgram;
  @Input() editable = false;
  @Output() update = new EventEmitter<HumanReadableProgram>();
  LVarTypes: string[] = ['channels', 'emitters', 'events'];
  Linout: string[] = ['import', 'export'];
  onTopOfC: number;
  onTopOfL: number;
  newProg: HumanReadableProgram;

  constructor(private matDialog: MatDialog) {
  }

  ngOnInit(): void {
    this.newProg = copyHumanReadableProgram(this.program);
    this.newProg.dependencies = this.newProg.dependencies || {};
    this.newProg.dependencies.import = this.newProg.dependencies.import || {};
    this.newProg.dependencies.import.channels = this.newProg.dependencies.import.channels || [];
    this.newProg.dependencies.import.emitters = this.newProg.dependencies.import.emitters || [];
    this.newProg.dependencies.import.events   = this.newProg.dependencies.import.events   || [];
    this.newProg.dependencies.export = this.newProg.dependencies.export || {};
    this.newProg.dependencies.export.channels = this.newProg.dependencies.export.channels || [];
    this.newProg.dependencies.export.emitters = this.newProg.dependencies.export.emitters || [];
    this.newProg.dependencies.export.events   = this.newProg.dependencies.export.events   || [];
  }

  getVariables(InEx: string, type: string): VariableDescription[] {
    return this.newProg.dependencies[InEx] ? this.newProg.dependencies[InEx][type] : [];
  }

  async appendDependency(vType: 'channels' | 'emitters' | 'events', inOut: 'import' | 'export') {
    const data: DataAppendDependency = {
      program: this.program,
      vType, inOut
    };
    const dialogRef = this.matDialog.open(DialogAppendDependencyComponent, {
      data,
      closeOnNavigation: false
    });
    const vd: VariableDescription = await dialogRef.afterClosed().toPromise();
    if (vd) {
      this.newProg.dependencies[inOut][vType].push(vd);
      this.update.emit(this.newProg);
    }
  }

  removeDependency(name: string, vType: 'channels' | 'emitters' | 'events', inOut: 'import' | 'export') {
    this.newProg.dependencies[inOut][vType] = this.newProg.dependencies[inOut][vType].filter(
      vd => vd.name !== name
    );
    this.update.emit(this.newProg);
  }
}
