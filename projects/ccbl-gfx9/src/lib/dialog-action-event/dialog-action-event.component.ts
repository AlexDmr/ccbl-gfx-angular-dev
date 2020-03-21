import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ProgVersionner} from '../ccbl-gfx9.service';
import {HumanReadableEventAction, HumanReadableEventChannelAction, VariableDescription} from 'ccbl-js/lib/ProgramObjectInterface';

export interface DataDialogEventAction {
  action: HumanReadableEventAction;
  progVersionner: ProgVersionner;
}

@Component({
  selector: 'lib-dialog-action-event',
  templateUrl: './dialog-action-event.component.html',
  styleUrls: ['./dialog-action-event.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DialogActionEventComponent implements OnInit {
  newAction: HumanReadableEventChannelAction = {
    channel: '',
    affectation: ''
  };

  constructor( private dialogRef: MatDialogRef<DialogActionEventComponent>,
               @Inject(MAT_DIALOG_DATA) public data: DataDialogEventAction
  ) { }

  ngOnInit(): void {
    const act = this.data.action as HumanReadableEventChannelAction;
    this.newAction.channel     = act.channel;
    this.newAction.affectation = act.affectation !== '' ? act.affectation : `"undefined"`;
  }

  get channels(): VariableDescription[] {
    return this.progVersionner.getChannels();
  }

  get action(): HumanReadableEventAction {
    return this.data?.action;
  }

  get progVersionner(): ProgVersionner {
    return this.data?.progVersionner;
  }

  ok() {
    this.dialogRef.close( this.newAction );
  }

  cancel() {
    this.dialogRef.close();
  }
}
