import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { Device } from '../data/Scene';

@Component({
  selector: 'app-device',
  templateUrl: './device.component.html',
  styleUrls: ['./device.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeviceComponent implements OnInit {
  @Input() data: Device;

  constructor() { }

  ngOnInit(): void {
  }

}
