import {ChangeDetectionStrategy, Component, Inject, Input, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {copyHumanReadableStateContext, HumanReadableStateContext} from 'ccbl-js/lib/ProgramObjectInterface';
import {ProgVersionner} from '../ccbl-gfx9.service';

export interface DataEditionContextState {
  context: HumanReadableStateContext;
  progV: ProgVersionner;
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

}
