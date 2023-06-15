import {Component, EventEmitter, Input, OnInit, Output, ChangeDetectionStrategy} from '@angular/core';
import {EventTrigger, HumanReadableProgram} from 'ccbl-js/lib/ProgramObjectInterface';
// import {ProgVersionner} from '../ccbl-gfx9.service';
import {DataDialogTrigger, DialogTriggerComponent} from '../dialog-trigger/dialog-trigger.component';
import { firstValueFrom } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'lib-ccbl-event-expression[evt][program]',
  templateUrl: './ccbl-event-expression.component.html',
  styleUrls: ['./ccbl-event-expression.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CcblEventExpressionComponent implements OnInit {
  @Input() evt!: EventTrigger;
  @Input() program!: HumanReadableProgram;
  @Output() update = new EventEmitter<EventTrigger>();
  static async staticEditEvent(dialog: MatDialog, data: DataDialogTrigger): Promise<EventTrigger> {
    const dialogRef = dialog.open(DialogTriggerComponent, {
      data,
      closeOnNavigation: false
    } );
    return firstValueFrom( dialogRef.afterClosed() );
  }

  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {
  }

  async editEvent() {
    const data: DataDialogTrigger = {
      evt: this.evt,
      program: this.program
    };
    const newEvent: EventTrigger = await CcblEventExpressionComponent.staticEditEvent(this.dialog, data);
    if (newEvent) {
      this.update.emit(newEvent);
    }
  }

  get labelEventExpressionChange(): string {
    if (this.evt?.eventFilter) {
      const L = this.evt.eventFilter.split(' ');
      return `becomes ${L[L.length - 1]}`;
    } else {
      return 'changes';
    }
  }

  get isBasedOnEvent(): boolean {
    return !!this.evt.eventSource;
  }

  get isBasedOnExpression(): boolean {
    return !this.evt.eventSource && !! this.evt.eventExpression;
  }

  get filterForEvent(): string | undefined {
    return this.evt.eventFilter?.replace(/event\.value/gi, this.evt.eventSource);
  }
}
