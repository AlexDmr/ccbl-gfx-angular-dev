import { Component, OnInit, Inject } from '@angular/core';
import { HumanReadableProgram, VariableDescription } from 'ccbl-js/lib/ProgramObjectInterface';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Sensor, SensorVarType } from '../data/setup';
import { DialogDeviceComponent } from '../dialog-device/dialog-device.component';

export interface DataEnvGenerator {
  program: HumanReadableProgram;
  events: VariableDescription[];
  emitters: VariableDescription[];
  channels: VariableDescription[];
}

export interface SensorImplem extends VariableDescription {
  sensor: Sensor;
  varType: SensorVarType;
}

@Component({
  selector: 'app-env-generator',
  templateUrl: './env-generator.component.html',
  styleUrls: ['./env-generator.component.scss']
})
export class EnvGeneratorComponent implements OnInit {
  pInputs: SensorImplem[];

  constructor( private dialogRef: MatDialogRef<EnvGeneratorComponent, SensorImplem[]>
             , @Inject(MAT_DIALOG_DATA) private data: DataEnvGenerator
             , private dialog: MatDialog
             ) {
    const D = this.data;
    this.pInputs = [
      ...D.channels.map( vd => ({...vd, sensor: undefined, varType: 'channel'} as SensorImplem) ),
      ...D.emitters.map( vd => ({...vd, sensor: undefined, varType: 'emitter'} as SensorImplem) ),
      ...D.events  .map( vd => ({...vd, sensor: undefined, varType: 'event'  } as SensorImplem) )
    ];
  }

  ngOnInit(): void {
  }

  ok() {
    this.dialogRef.close( this.pInputs );
  }

  cancel() {
    this.dialogRef.close();
  }

  get canValidate(): boolean {
    return !this.pInputs.find(s => !s.sensor);
  }

  get inputs(): SensorImplem[] {
    return this.pInputs;
  }

  async setSensor(si: SensorImplem) {
    const dialogRef = this.dialog.open(DialogDeviceComponent);
    si.sensor = await dialogRef.afterClosed().toPromise();
  }
}

