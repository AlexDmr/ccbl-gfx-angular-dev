import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
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

  constructor() { }

  ngOnInit(): void {
  }

}

