import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {EventTrigger, HumanReadableEventChannelAction} from 'ccbl-js/lib/ProgramObjectInterface';
import {ProgVersionner} from '../ccbl-gfx9.service';
import {DataDialogTrigger, DialogTriggerComponent} from '../dialog-trigger/dialog-trigger.component';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'lib-ccbl-event-expression',
  templateUrl: './ccbl-event-expression.component.html',
  styleUrls: ['./ccbl-event-expression.component.scss']
})
export class CcblEventExpressionComponent implements OnInit {
  @Input() evt: EventTrigger;
  @Input('program-versionner') progV: ProgVersionner;
  @Output() update = new EventEmitter<EventTrigger>();
  static async staticEditEvent(dialog: MatDialog, data: DataDialogTrigger): Promise<EventTrigger> {
    const dialogRef = dialog.open(DialogTriggerComponent, {
      data,
      closeOnNavigation: false
    } );
    return dialogRef.afterClosed().toPromise();
  }

  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {
  }

  async editEvent() {
    const data: DataDialogTrigger = {
      evt: this.evt,
      progVersionner: this.progV
    };
    const newEvent: EventTrigger = await CcblEventExpressionComponent.staticEditEvent(this.dialog, data);
    if (newEvent) {
      this.update.emit(newEvent);
    }
  }

  get labelEventExpressionChange(): string {
    if (this.evt.eventFilter) {
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

  get filterForEvent(): string {
    return this.evt.eventFilter.replace(/event\.value/gi, this.evt.eventSource);
  }
}
