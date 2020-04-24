import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { SceneLocation, People, Device } from '../data/Scene';

@Component({
  selector: 'app-appartment',
  templateUrl: './appartment.component.html',
  styleUrls: ['./appartment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppartmentComponent implements OnInit {
  @Input() location: SceneLocation;
  @Input() peoples: People<any>[];

  constructor() { }

  ngOnInit(): void {
  }

  trackByName(i: number, ref: People<any>) {
    return ref.name;
  }
}
