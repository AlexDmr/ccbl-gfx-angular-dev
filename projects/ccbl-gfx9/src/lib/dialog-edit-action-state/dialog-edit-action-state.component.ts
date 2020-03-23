import {Component, Inject, OnInit} from '@angular/core';
import {
  copyHumanReadableStateActions,
  HumanReadableStateAction,
  HumanReadableStateContext,
  VariableDescription
} from 'ccbl-js/lib/ProgramObjectInterface';
import {ProgVersionner} from '../ccbl-gfx9.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

export interface DataActionState {
  action: HumanReadableStateAction;
  context: HumanReadableStateContext;
  progV: ProgVersionner;
}

@Component({
  selector: 'lib-dialog-edit-action-state',
  templateUrl: './dialog-edit-action-state.component.html',
  styleUrls: ['./dialog-edit-action-state.component.scss']
})
export class DialogEditActionStateComponent implements OnInit {
  newAction: HumanReadableStateAction;
  alreadyUsedChannels: string[];

  constructor(public dialogRef: MatDialogRef<DialogEditActionStateComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DataActionState) {
    this.newAction = copyHumanReadableStateActions(this.data.action, false);
    this.alreadyUsedChannels = this.data.context.actions.map(a => a.channel).filter(c => c !== this.data.action.channel);
    console.log(this.data.progV.getChannels(), this.alreadyUsedChannels);
  }

  ngOnInit(): void {
  }

  get channels(): VariableDescription[] {
    return this.data.progV.getChannels();
  }

  isAvailable(chan: VariableDescription): boolean {
    return this.alreadyUsedChannels.indexOf(chan.name) === -1;
  }

  cancel() {
    this.dialogRef.close();
  }

  ok() {
    this.dialogRef.close( this.newAction );
  }
}
