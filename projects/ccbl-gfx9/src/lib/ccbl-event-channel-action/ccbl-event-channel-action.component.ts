import {Component, Input, OnInit} from '@angular/core';
import {HumanReadableEventChannelAction} from 'ccbl-js/lib/ProgramObjectInterface';
import {ProgVersionner} from '../ccbl-gfx9.service';
import {EditableOptionType} from '../editable-option/editable-option.component';

@Component({
  selector: 'lib-ccbl-event-channel-action',
  templateUrl: './ccbl-event-channel-action.component.html',
  styleUrls: ['./ccbl-event-channel-action.component.scss']
})
export class CcblEventChannelActionComponent implements OnInit {
  @Input() action: HumanReadableEventChannelAction;
  @Input('program-versionner') progVersionner: ProgVersionner;

  constructor() { }

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

  deleteAction() {
    this.progVersionner.removeEventAction(this.action);
  }

}
