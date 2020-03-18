import {Component, Input, OnInit} from '@angular/core';
import {HumanReadableEventChannelAction} from 'ccbl-js/lib/ProgramObjectInterface';
import {ProgVersionner} from '../ccbl-gfx9.service';
import {EditableOptionType} from '../editable-option/editable-option.component';
import {MatDialog} from '@angular/material/dialog';
import {DataDialogEventAction, DialogActionEventComponent} from '../dialog-action-event/dialog-action-event.component';

@Component({
  selector: 'lib-ccbl-event-channel-action',
  templateUrl: './ccbl-event-channel-action.component.html',
  styleUrls: ['./ccbl-event-channel-action.component.scss']
})
export class CcblEventChannelActionComponent implements OnInit {
  @Input() action: HumanReadableEventChannelAction;
  @Input('program-versionner') progVersionner: ProgVersionner;

  constructor(private dialog: MatDialog) { }

  ngOnInit() {
  }

  updateExpression(expr: string) {
    this.progVersionner.updateEventAction(this.action, {
      ...this.action,
      affectation: expr
    } as HumanReadableEventChannelAction);
  }

  get channelOptions(): EditableOptionType<string>[] {
    return this.progVersionner.getChannels().map( c => ({
      label: c.name,
      value: c.name
    }) );
  }

  updateChannel(channel: string) {
    this.progVersionner.updateEventAction(this.action, {
      ...this.action,
      channel
    });
  }

  async editAction() {
    const data: DataDialogEventAction = {
      action: this.action,
      progVersionner: this.progVersionner
    };
    const dialogRef = this.dialog.open(DialogActionEventComponent, {data});
    const newAction: HumanReadableEventChannelAction = await dialogRef.afterClosed().toPromise();
    if (newAction) {
      this.progVersionner.updateEventAction(this.action, newAction);
    }
  }

  deleteAction() {
    this.progVersionner.removeEventAction(this.action);
  }

}
