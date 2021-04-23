import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild, ViewEncapsulation
} from '@angular/core';

export interface EditableOptionType<T> {
  label: string;
  value: T;
}

@Component({
  selector: 'lib-editable-option',
  templateUrl: './editable-option.component.html',
  styleUrls: ['./editable-option.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class EditableOptionComponent implements OnInit {
  @Input () value: any;
  @Input () editable = true;
  @Input () options: EditableOptionType<any>[] = [];
  @Output() onupdate = new EventEmitter<string>();
  @ViewChild('select') selectTag!: ElementRef;
  pEdition = false;

  constructor() { }

  ngOnInit() {
  }

  get edition(): boolean {
    return this.pEdition;
  }

  set edition(edition: boolean) {
    if (this.editable) {
      this.pEdition = edition;
      if (edition) {
        requestAnimationFrame(() => this.selectTag.nativeElement.focus());
      }
    }
  }

  updateValue(value: any) {
    this.onupdate.emit(value);
    this.value = value;
  }

}
