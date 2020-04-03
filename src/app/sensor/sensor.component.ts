import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {BasicSensor, isBooleanSensor, isColorSensor, isEvent, isScalarSensor, ColorSensor, ScalarSensor, BooleanSensor} from '../data/setup';

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

  get isEvent(): boolean {
    return isEvent(this.data);
  }

  get isBooleanSensor(): boolean {
    return !isEvent(this.data) && isBooleanSensor(this.data);
  }

  get isScalarSensor(): boolean {
    return !isEvent(this.data) && isScalarSensor(this.data);
  }

  get isColorSensor(): boolean {
    return !isEvent(this.data) && isColorSensor(this.data);
  }

  asColorSensor(): ColorSensor {
    return this.data as ColorSensor;
  }

  asScalarSensor(): ScalarSensor {
    return this.data as ScalarSensor;
  }

  asBooleanSensor(): BooleanSensor {
    return this.data as BooleanSensor;
  }
}
