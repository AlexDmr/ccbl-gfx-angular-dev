import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {
  EventTrigger,
  HumanReadableEventAction,
  HumanReadableEventChannelAction,
  HumanReadableEventContext,
  HumanReadableEventTriggerAction,
  VariableDescription
} from 'ccbl-js/lib/ProgramObjectInterface';
import {ProgVersionner} from '../ccbl-gfx9.service';
import {EditableOptionType} from '../editable-option/editable-option.component';

@Component({
  selector: 'lib-ccbl-event-context',
  templateUrl: './ccbl-event-context.component.html',
  styleUrls: ['./ccbl-event-context.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CcblEventContextComponent implements OnInit {
  @Input() context: HumanReadableEventContext;
  @Input('program-versionner') private progVersionner: ProgVersionner;

  constructor() { }

  ngOnInit() {
  }

  get programVersionner() {
    return this.progVersionner;
  }

  get htmlEvent(): string {
    let str: string;
    if (this.context.eventSource) {
      // Event + filter
      str = `event ${this.context.eventSource} is triggered`;
      if (this.context.eventFilter) {
        str += ` and ` + this.context.eventFilter.replace(/event.value/gi, this.context.eventSource);
      }
    } else {
      // eventExpression + [filter]
      str = `(${this.context.eventExpression}) `;
      if (this.context.eventFilter) {
        const L = this.context.eventFilter.split(' ');
        str += `becomes ${L[2]}`;
      } else {
        str += 'changes';
      }
    }
    return str;
  }

  startDragging() {
    this.progVersionner.draggedContext = this.context;
  }

  stopDragging() {
    this.progVersionner.draggedContext = undefined;
  }

  get stateActions(): HumanReadableEventChannelAction[] {
    const L = this.context.actions;
    return L.filter(
      (a: HumanReadableEventAction) => (a as HumanReadableEventChannelAction).channel !== undefined
    ) as HumanReadableEventChannelAction[];
  }

  get eventTriggerActions(): HumanReadableEventTriggerAction[] {
    const L = this.context.actions;
    return L.filter(
      (a: HumanReadableEventAction) => (a as HumanReadableEventTriggerAction).eventer !== undefined
    ) as HumanReadableEventTriggerAction[];
  }

  get eventSourceOptions(): EditableOptionType<string>[] {
    return this.progVersionner.getEvents().map( e => ({
      label: e.name,
      value: e.name
    }) );
  }

  isThereEvents(): boolean {
    return this.progVersionner.getEvents().length > 0;
  }

  get availableChannels(): VariableDescription[] {
    let L = this.progVersionner.getChannels();
    if (this.context.actions) {
      L = L.filter(c => !this.context.actions.find((a: HumanReadableEventChannelAction) => a.channel === c.name));
    }
    return L.sort((v1, v2) => v1.name.toLowerCase() > v2.name.toLowerCase() ? 1 : -1);
  }

  appendAction(vd?: VariableDescription) {
    this.progVersionner.appendEventAction(this.context, {channel: vd ? vd.name : '', affectation: '0'});
  }

  get contextName(): string {
    return this.context.contextName;
  }

  set contextName(name: string) {
    this.progVersionner.updateContext(
      this.context,
      {...this.context, contextName: name}
    );
  }

  get eventFilter(): string {
    return this.context.eventFilter;
  }

  set eventFilter(eventFilter: string) {
    this.progVersionner.updateContext(this.context, {
      ...this.context,
      eventFilter
    });
  }

  updateEvent(newEvent: EventTrigger) {
    this.progVersionner.updateContext(this.context, {...this.context, ...newEvent});
  }

  deleteContext() {
    this.progVersionner.removeContext(this.context);
  }

  updateAction(oldA: HumanReadableEventAction, newA: HumanReadableEventAction) {
    const newC: HumanReadableEventContext = {
      ...this.context,
      actions: this.context.actions.map(a => a !== oldA ? a : newA)
    };
    this.programVersionner.updateContext(this.context, newC);
  }
}
