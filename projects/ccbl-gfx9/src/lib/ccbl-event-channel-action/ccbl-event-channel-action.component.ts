import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {HumanReadableEventChannelAction, HumanReadableProgram} from 'ccbl-js/lib/ProgramObjectInterface';
import {ProgVersionner} from '../ccbl-gfx9.service';
import {EditableOptionType} from '../editable-option/editable-option.component';
import {MatLegacyDialog as MatDialog} from '@angular/material/legacy-dialog';
import {DataDialogEventAction, DialogActionEventComponent} from '../dialog-action-event/dialog-action-event.component';
import { BehaviorSubject, firstValueFrom, map } from 'rxjs';
import { ProxyCcblProg } from '../ProxyCcblProg';

@Component({
  selector: 'lib-ccbl-event-channel-action[action][program-versionner]',
  templateUrl: './ccbl-event-channel-action.component.html',
  styleUrls: ['./ccbl-event-channel-action.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CcblEventChannelActionComponent implements OnInit {
  active = new BehaviorSubject<boolean>(false);
  private _action: HumanReadableEventChannelAction = {channel: "", affectation: ""};
  @Input()// action!: HumanReadableEventChannelAction;
  get action(): HumanReadableEventChannelAction {
    return this._action;
  }
  set action(a: HumanReadableEventChannelAction) {
    this._action = a;
    this.proxyCcbl.getActionProxy(a)?.pipe(
      map( update => update.active )
    ).subscribe( this.active );
  }

  @Input('program-versionner') progVersionner!: ProgVersionner;
  @Output() update = new EventEmitter<HumanReadableEventChannelAction>();
  static async staticEditAction(dialog: MatDialog, data: DataDialogEventAction): Promise<HumanReadableEventChannelAction> {
    const dialogRef = dialog.open(DialogActionEventComponent, {
      data,
      closeOnNavigation: false
    });
    return firstValueFrom( dialogRef.afterClosed() );
  }

  constructor(private dialog: MatDialog, private proxyCcbl: ProxyCcblProg) { }

  ngOnInit() {
  }

  get program(): HumanReadableProgram {
    return this.progVersionner.getCurrent();
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
