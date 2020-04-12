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
import { DataEnvGenerator, EnvGeneratorComponent, SensorImplem } from './env-generator/env-generator.component';

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

  get savedConfigurations(): string[] {
    return this.ccblEngineService.savedConfigurations;
  }

  load(name: string) {
    this.ccblEngineService.load(name);
  }

  save(name: string) {
    this.ccblEngineService.save(name);
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
    prog.dependencies.import.events = this.events.map(s => ({
      name: s.name,
      type: s.type
    }) );
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

  get inputs(): Sensor[] {
    return [...this.events, ...this.sensors];
  }

  get events(): Sensor[] {
    return this.ccblEngineService.sensors.filter(d => d.varType === 'event');
  }

  get sensors(): Sensor[] {
    return this.ccblEngineService.sensors.filter(d => d.varType === 'emitter');
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

  deleteProgram() {
    this.ccblEngineService.deleteProgram();
  }

  async genEnvFromProg() {
    const prog = this.progVersionner.getCurrent();
    const events:   VariableDescription[] = prog.dependencies?.import?.events   || [];
    const emitters: VariableDescription[] = prog.dependencies?.import?.emitters || [];
    const channels: VariableDescription[] = prog.dependencies?.import?.channels || [];
    const data: DataEnvGenerator = {
      program: prog,
      events, emitters, channels
    };
    const dialogRef = this.dialog.open<EnvGeneratorComponent, DataEnvGenerator, SensorImplem[]>(
      EnvGeneratorComponent,
      {data, width: "100%", height: "100%", maxWidth: "100%"}
      );
    const sensors = await dialogRef.afterClosed().toPromise();
    this.ccblEngineService.sensors = sensors.map(s => s.sensor );
  }
}
