import {Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter} from '@angular/core';
import { People } from '../data/Scene';

@Component({
  selector: 'app-people',
  templateUrl: './people.component.html',
  styleUrls: ['./people.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PeopleComponent implements OnInit {
  @Input() data: People<any>;
  @Input() height = 100;
  @Output() update = new EventEmitter<People<any>>();
  imgPhoning = '/assets/phoning.png';

  constructor() { }

  ngOnInit(): void {
  }

  togglePhoning() {
    this.data.phoning = !this.data.phoning;
    this.update.emit({...this.data} );
  }
}

