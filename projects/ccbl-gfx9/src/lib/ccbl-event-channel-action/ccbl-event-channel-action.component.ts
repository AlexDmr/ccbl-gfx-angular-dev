import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
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
  @Output() update = new EventEmitter<HumanReadableEventChannelAction>();
  static async staticEditAction(dialog: MatDialog, data: DataDialogEventAction): Promise<HumanReadableEventChannelAction> {
    const dialogRef = dialog.open(DialogActionEventComponent, {
      data,
      closeOnNavigation: false
    });
    return dialogRef.afterClosed().toPromise();
  }

  constructor(private dialog: MatDialog) { }

  ngOnInit() {
  }

  get channelOptions(): EditableOptionType<string>[] {
    return this.progVersionner.getChannels().map( c => ({
      label: c.name,
      value: c.name
    }) );
  }

  async editAction() {
    const data: DataDialogEventAction = {
      action: this.action,
      progVersionner: this.progVersionner
    };
    const newAction = await CcblEventChannelActionComponent.staticEditAction(this.dialog, data);
    if (newAction) {
      // data.progVersionner.updateEventAction(data.action as HumanReadableEventChannelAction, newAction);
      this.update.emit( newAction );
    }
  }

  deleteAction() {
    this.progVersionner.removeEventAction(this.action);
  }

}
