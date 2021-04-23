import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {EventTrigger, HumanReadableEventContext, HumanReadableProgram, VariableDescription} from 'ccbl-js/lib/ProgramObjectInterface';
import {MathNode} from 'mathjs';
import {mathjs} from 'ccbl-js/lib/CCBLExpressionInExecutionEnvironment';

export interface DataDialogTrigger {
  evt: EventTrigger;
  program: HumanReadableProgram;
}

@Component({
  selector: 'lib-dialog-trigger',
  templateUrl: './dialog-trigger.component.html',
  styleUrls: ['./dialog-trigger.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DialogTriggerComponent implements OnInit {
  triggerType: 'event' | 'expression' = 'event';
  expression = '2 > 1';
  expectedExpressionValue?: boolean;
  computedExpression = 'rien pour le moment';
  currentEvent: string  = '';
  currentFilter: string = '';

  constructor(private dialogRef: MatDialogRef<DialogTriggerComponent, EventTrigger>,
              @Inject(MAT_DIALOG_DATA) public data: DataDialogTrigger
              ) { }

  ngOnInit(): void {
    // Init trigger type based on the eventContext
    const evt = this.data.evt;
    if (evt.eventSource === undefined && evt.eventSource !== '' || !!evt.eventExpression ) {
      this.triggerType = 'expression';
      this.setExpression(evt.eventExpression ?? '');
    } else {
      this.triggerType = 'event';
      this.currentEvent  = evt.eventSource;
      this.currentFilter = evt.eventFilter ?? '';
    }
    this.triggerType = this.events.length > 0 ? this.triggerType : 'expression';
  }

  createFilter(c: boolean) {
    if (c) {
      const context = this.data.evt;
      this.currentFilter = context.eventFilter || `${context.eventSource} == true`;
    } else {
      this.currentFilter = '';
    }
  }

  setExpression(expr: string) {
    console.log('setExpression', expr);
    const node: MathNode = mathjs.parse( expr );
    if (node.op === '==' && node.args![0].isParenthesisNode && typeof node.args![1].value === 'boolean') {
      this.expression = node.args![0].toString();
      this.setExpectedValue( node.args![1].value );
    } else {
      this.expression = expr;
      this.setExpectedValue( undefined );
    }
  }

  setExpectedValue(b: boolean | undefined) {
    console.log('setExpectedValue', b);
    switch (b) {
      case undefined:
        this.computedExpression = this.expression;
        break;
      case true:
      case false:
        this.expectedExpressionValue = b;
        this.computedExpression = `(${this.expression}) == ${this.expectedExpressionValue}`;
    }
  }

  get events(): VariableDescription[] {
    return [
      ...(this.data.program?.dependencies?.import?.events || []),
      ...(this.data.program?.dependencies?.export?.events || []),
    ];
  }

  get currentFilterForDisplay(): string {
    return this.currentFilter.replace(/event\.value/gi, this.currentEvent);
  }

  cancel() {
    this.dialogRef.close();
  }

  ok() {
    const newEvent: EventTrigger = {
      ...this.data.evt
    };
    if (this.triggerType === 'event') {
      newEvent.eventSource = this.currentEvent;
      newEvent.eventFilter = this.currentFilter ? mathjs.parse(this.currentFilter).toString().split(' ').map(
        w => w === newEvent.eventSource ? 'event.value' : w
      ). join( ' ' ) : undefined;
    } else {
      newEvent.eventSource = '';
      newEvent.eventExpression = this.expression;
      newEvent.eventFilter = this.expectedExpressionValue === undefined ? undefined : `event == ${this.expectedExpressionValue}`;
    }
    this.dialogRef.close( newEvent );
  }

}
