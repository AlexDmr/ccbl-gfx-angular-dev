import {Component, Input, OnInit} from '@angular/core';
import {BasicSensor} from '../data/setup';
import {CcblEngineService} from '../ccbl-engine.service';

@Component({
  selector: 'app-eventer',
  templateUrl: './eventer.component.html',
  styleUrls: ['./eventer.component.scss']
})
export class EventerComponent implements OnInit {
  @Input() data?: BasicSensor;
  value: any = undefined;

  constructor(private ccblEngine: CcblEngineService) {
  }

  ngOnInit(): void {
    this.value = !!this.data ? this.ccblEngine.getValue( this.data.name ) : undefined;
    console.log('EventerComponent', this.data);
  }

  emit() {
    this.ccblEngine.setValue(this.data!.varType, this.data!.name, this.value);
  }

  get isBoolean(): boolean {
    return this.data!.type === 'boolean';
  }

  get isScalar(): boolean {
    return this.data!.type === 'number';
  }
}
