import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {HumanReadableEventTriggerAction, HumanReadableProgram} from 'ccbl-js/lib/ProgramObjectInterface';
// import {ProgVersionner} from '../ccbl-gfx9.service';

@Component({
  selector: 'lib-ccbl-event-trigger-action[action][program]',
  templateUrl: './ccbl-event-trigger-action.component.html',
  styleUrls: ['./ccbl-event-trigger-action.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CcblEventTriggerActionComponent implements OnInit {
  @Input() action!: HumanReadableEventTriggerAction;
  @Input() program!: HumanReadableProgram;

  constructor() { }

  ngOnInit() {
  }

  updateExpression(expr: string) {
    // this.progVersionner.
  }

}
