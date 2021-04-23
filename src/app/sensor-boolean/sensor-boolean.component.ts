import {Component, Input, OnInit} from '@angular/core';
import {BooleanSensor} from '../data/setup';
import {CcblEngineService} from '../ccbl-engine.service';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-sensor-boolean',
  templateUrl: './sensor-boolean.component.html',
  styleUrls: ['./sensor-boolean.component.scss']
})
export class SensorBooleanComponent implements OnInit {
  @Input() data?: BooleanSensor;
  obs?: Observable<boolean>;

  constructor(private ccblEngine: CcblEngineService) { }

  ngOnInit() {
    if (this.data) {
      this.obs = this.ccblEngine.getObsValue(this.data.name);
    }
  }

  select(s: boolean) {
    if (this.data) {
      this.ccblEngine.setValue(this.data.varType, this.data.name, s);
    }
  }

}
