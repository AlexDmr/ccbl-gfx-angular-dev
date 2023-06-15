import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import {
  copyHumanReadableStateActions, HumanReadableProgram,
  HumanReadableStateAction,
  HumanReadableStateContext,
  VariableDescription
} from 'ccbl-js/lib/ProgramObjectInterface';
import {MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef} from '@angular/material/legacy-dialog';

export interface DataActionState {
  action: HumanReadableStateAction;
  context: HumanReadableStateContext;
  program: HumanReadableProgram;
  // progV: ProgVersionner;
}

@Component({
  selector: 'lib-dialog-edit-action-state',
  templateUrl: './dialog-edit-action-state.component.html',
  styleUrls: ['./dialog-edit-action-state.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DialogEditActionStateComponent implements OnInit {
  newAction: HumanReadableStateAction;
  alreadyUsedChannels: string[];

  constructor(public dialogRef: MatDialogRef<DialogEditActionStateComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DataActionState) {
    this.newAction = copyHumanReadableStateActions(this.data.action);
    const actions: HumanReadableStateAction[] = this.data.context.actions || [];
    this.alreadyUsedChannels = actions.map(a => a.channel).filter(c => c !== this.data.action.channel);
  }

  ngOnInit(): void {
  }

  get program(): HumanReadableProgram {
    return this.data.program;
  }

  get channels(): VariableDescription[] {
    const P = this.data.program;
    return [
      ...(P.dependencies?.import?.channels || []),
      ...(P.dependencies?.export?.emitters || []),
      ...(P.dependencies?.export?.channels || []),
      ...(P.localChannels || []),
    ];
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
