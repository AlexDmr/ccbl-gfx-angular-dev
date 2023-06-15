import {Component, Inject, OnInit} from '@angular/core';
import {Sensor, SensorDataType, SensorVarType} from '../data/setup';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-device',
  templateUrl: './dialog-device.component.html',
  styleUrls: ['./dialog-device.component.scss']
})
export class DialogDeviceComponent implements OnInit {
  dataType: 'boolean' | 'number' | 'color' = 'boolean';
  dataTypes: SensorDataType[] = ['boolean', 'number', 'color'];
  name = '';
  deviceType: SensorVarType;

  constructor( private dialogRef: MatDialogRef<DialogDeviceComponent>
             , @Inject(MAT_DIALOG_DATA) private data: Sensor
  ) {
    this.dataType   = data.type;
    this.name       = data.name;
    this.deviceType = data.varType
  }

  ngOnInit(): void {
  }

  ok() {
    const device: Sensor = {
      label: this.name,
      name: this.name,
      type: this.dataType,
      varType: this.deviceType,
      userCanControl: true // this.isActuator
    };
    this.dialogRef.close( device );
  }

  cancel() {
    this.dialogRef.close();
  }

  get isDeviceTypeValide(): boolean {
    return !!this.deviceType;
  }

  get canSubmit(): boolean {
    return !!this.deviceType && !!this.dataType && !!this.name;
  }
}
