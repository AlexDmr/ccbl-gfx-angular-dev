import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {ScalarSensor} from '../data/setup';
import {CcblEngineService} from '../ccbl-engine.service';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-sensor-scalar',
  templateUrl: './sensor-scalar.component.html',
  styleUrls: ['./sensor-scalar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SensorScalarComponent implements OnInit {
  @Input() data: ScalarSensor;
  obs: Observable<number>;

  constructor(private ccblEngine: CcblEngineService) { }

  ngOnInit() {
    this.obs = this.ccblEngine.getObsValue(this.data.name);
  }

  update(s: number) {
    this.ccblEngine.setValue(this.data.varType, this.data.name, s);
  }

}
