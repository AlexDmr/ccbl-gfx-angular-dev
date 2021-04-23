import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {ColorSensor} from '../data/setup';
import {CcblEngineService} from '../ccbl-engine.service';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-sensor-color',
  templateUrl: './sensor-color.component.html',
  styleUrls: ['./sensor-color.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SensorColorComponent implements OnInit {
  @Input() data?: ColorSensor;
  obs?: Observable<string>;
  obsColorCode?: Observable<string>;

  constructor(private ccblEngine: CcblEngineService) { }

  ngOnInit() {
    if (this.data) {
      this.obs = this.ccblEngine.getObsValue(this.data.name);
      this.obsColorCode = this.obs.pipe(
        map( colorToCode )
      );
    }
  }

}

const mapColorCode = new Map<string, string>();
mapColorCode.set('off', 'black');
function colorToCode(color: string): string {
  return mapColorCode.has(color) ? mapColorCode.get(color)! : color;
}
