import {Component, OnInit} from '@angular/core';
import {CcblGfx9Service, ProgVersionner} from '../../projects/ccbl-gfx9/src/lib/ccbl-gfx9.service';
import {CcblEngineService} from './ccbl-engine.service';
import {Sensor, SensorVarType} from './data/setup';
import {MatDialog} from '@angular/material/dialog';
import {DialogDeviceComponent} from './dialog-device/dialog-device.component';
import {
  Affectation,
  AllenRelationships,
  HumanReadableProgram,
  HumanReadableStateAction,
  ImportExportConfig,
  VariableDescription
} from 'ccbl-js/lib/ProgramObjectInterface';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(private ccblGfxService: CcblGfx9Service, private ccblEngineService: CcblEngineService, private dialog: MatDialog) {
  }

  ngOnInit() {
    //
  }

  startProgram() {
    this.ccblEngineService.startProgram();
  }

  initProgram() {
    const prog: HumanReadableProgram = {
      localChannels: [],
      dependencies: {
        import: {},
        export: {}
      },
      actions: [],
      subPrograms: {}
    };

    // Import devices
    prog.dependencies.import.emitters = this.sensors.map(s => ({
      name: s.name,
      type: s.type
    }) );
    prog.dependencies.import.channels = this.actuators.map(d => ({
      name: d.name,
      type: d.type
    }) );

    // init channels values to current ones
    prog.actions = this.actuators.map(d => ({
      channel: d.name,
      affectation: {
        type: 'expression',
        value: `${this.ccblEngineService.getValue( d.name )}`
      }
    }) );

    this.ccblEngineService.setRootProgram( prog );
  }

  get sensors(): Sensor[] {
    return this.ccblEngineService.sensors.filter(d => d.varType !== 'channel');
  }

  get actuators(): Sensor[] {
    return this.ccblEngineService.sensors.filter(d => d.varType === 'channel');
  }

  async openDialogDevice() {
    const dialogRef = this.dialog.open(DialogDeviceComponent, {
      width: '50%'
    });
    const device: Sensor = await dialogRef.afterClosed().toPromise();
    // console.log(device);
    if (!!device) {
      this.appendDevice(device.name, device.varType, device.type);
    }
  }

  appendDevice(label: string, deviceType: SensorVarType, deviceData: 'number' | 'color' | 'boolean') {
    this.ccblEngineService.appendDevice(label, deviceType, deviceData);
  }

  get progVersionner(): ProgVersionner {
    return this.ccblEngineService.progVersionner;
  }

  reset() {
    this.ccblEngineService.reset();
  }

}
