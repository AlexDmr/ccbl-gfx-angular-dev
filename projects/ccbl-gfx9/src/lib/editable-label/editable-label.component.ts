import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';

@Component({
  selector: 'lib-editable-label',
  templateUrl: './editable-label.component.html',
  styleUrls: ['./editable-label.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class EditableLabelComponent implements OnInit {
  @Input() label: string;
  @Output() onupdate = new EventEmitter<string>();
  @ViewChild('newExpr') newExpr: ElementRef;
  pEditing = false;

  constructor() { }

  ngOnInit() {
  }

  update(label: string) {
    this.onupdate.emit(label);
    this.editing = false;
  }

  get editing(): boolean {
    return this.pEditing;
  }

  set editing(b: boolean) {
    this.pEditing = b;
    if (b) {
      requestAnimationFrame( () => this.newExpr.nativeElement.focus() );
    }
  }

}
