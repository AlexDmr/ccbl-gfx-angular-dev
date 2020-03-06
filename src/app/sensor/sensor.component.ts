import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {BasicSensor, isBooleanSensor, isColorSensor, isScalarSensor} from '../data/setup';

@Component({
  selector: 'app-sensor',
  templateUrl: './sensor.component.html',
  styleUrls: ['./sensor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SensorComponent implements OnInit {
  @Input() data: BasicSensor;

  constructor() { }

  ngOnInit() {
  }

  get isBooleanSensor(): boolean {
    return isBooleanSensor(this.data);
  }

  get isScalarSensor(): boolean {
    return isScalarSensor(this.data);
  }

  get isColorSensor(): boolean {
    return isColorSensor(this.data);
  }

}
