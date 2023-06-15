import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';

export interface DeviceLamp {
  name: string;
  color: string;
}

@Component({
  selector: 'app-device-lamp',
  templateUrl: './device-lamp.component.html',
  styleUrls: ['./device-lamp.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeviceLampComponent implements OnInit {
  @Input() lamp?: DeviceLamp;

  constructor() { }

  ngOnInit(): void {
  }

}
