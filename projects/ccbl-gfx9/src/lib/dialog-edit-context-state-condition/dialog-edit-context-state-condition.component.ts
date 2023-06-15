import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import {copyHumanReadableStateContext, HumanReadableProgram, HumanReadableStateContext} from 'ccbl-js/lib/ProgramObjectInterface';
import {ProgVersionner} from '../ccbl-gfx9.service';
import {AllenType} from 'ccbl-js/lib/AllenInterface';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DataEditionContextState {
  context: HumanReadableStateContext;
  progV: ProgVersionner;
  from: AllenType;
}

@Component({
  selector: 'lib-dialog-edit-context-state-condition',
  templateUrl: './dialog-edit-context-state-condition.component.html',
  styleUrls: ['./dialog-edit-context-state-condition.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DialogEditContextStateConditionComponent implements OnInit {
  newContext: HumanReadableStateContext;
  private newContextSvg: HumanReadableStateContext;
  progV: ProgVersionner;

  constructor(public dialogRef: MatDialogRef<DialogEditContextStateConditionComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DataEditionContextState) {
    this.newContext    = copyHumanReadableStateContext( this.data.context );
    this.newContextSvg = copyHumanReadableStateContext( this.data.context );
    this.progV = this.data.progV;
  }

  ngOnInit(): void {
  }

  get program(): HumanReadableProgram {
    return this.progV.getCurrent();
  }

  enableState(enable: boolean) {
    if (enable) {
      this.newContext.state = this.newContextSvg.state || 'true';
    } else {
      this.newContextSvg.state = this.newContext.state;
      this.newContext.state = undefined;
    }
  }

  hasEvent(evt: 'eventStart' | 'eventFinish'): boolean {
    return !!this.newContext[evt]?.eventSource || !!this.newContext[evt]?.eventExpression;
  }

  enableEvent(enable: boolean, evt: 'eventStart' | 'eventFinish') {
    if (enable) {
      this.newContext[evt] = this.newContextSvg[evt] || {
        eventSource: '',
        eventExpression: 'true'
      };
    } else {
      this.newContextSvg[evt] = this.newContext[evt];
      this.newContext[evt] = undefined;
    }
  }

  ok() {
    this.dialogRef.close( this.newContext );
  }

  cancel() {
    this.dialogRef.close();
  }

  get canHaveStartEvent(): boolean {
    return this.data.from !== AllenType.Meet && this.data.from !== AllenType.StartWith;
  }

  get canHaveFinishEvent(): boolean {
    return this.data.from !== AllenType.EndWith;
  }

  get canHaveState(): boolean {
    return this.data.from !== AllenType.EndWith;
  }
}
