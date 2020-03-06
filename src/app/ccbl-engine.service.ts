import { Injectable } from '@angular/core';
import {HumanReadableProgram} from 'ccbl-js/lib/ProgramObjectInterface';
import {Sensor, SensorDataType, SensorVarType} from './data/setup';
import {initCCBL} from 'ccbl-js/lib/main';
import {Observable} from 'rxjs';
import {ProgVersionner} from '../../projects/ccbl-gfx9/src/lib/ccbl-gfx9.service';
import {CCBLEnvironmentExecutionInterface} from 'ccbl-js/lib/ExecutionEnvironmentInterface';
import {CCBLEnvironmentExecution} from 'ccbl-js/lib/ExecutionEnvironment';
import {CCBLClock, CCBLTestClock} from 'ccbl-js/lib/Clock';
import {CCBLEmitterValue} from 'ccbl-js/lib/EmitterValue';
import {Channel, commitStateActions} from 'ccbl-js/lib/Channel';
import {CCBLProgramObject} from 'ccbl-js/lib/ProgramObject';

initCCBL();

const localSensorsKey = 'test_ccbl-gfx_sensors';
const localProgramKey = 'test_ccbl-gfx_program';

@Injectable({
  providedIn: 'root'
})
export class CcblEngineService {
  private privProgVersionner: ProgVersionner;
  env: CCBLEnvironmentExecutionInterface;
  clock: CCBLClock = new CCBLTestClock();
  mapObs = new Map<string, Observable<any>>();
  sensors: Sensor[] = [];
  ccblProg: CCBLProgramObject;

  constructor() {
    this.env = new CCBLEnvironmentExecution( this.clock );
    try {
      if (localStorage.getItem(localSensorsKey)) {
        const L: Sensor[] = JSON.parse(localStorage.getItem(localSensorsKey));
        L.forEach(s => this.appendDevice(s.label, s.varType, s.type));
      }
      if (localStorage.getItem(localProgramKey)) {
        const prog: HumanReadableProgram = JSON.parse(localStorage.getItem(localProgramKey));
        this.setRootProgram(prog);
      }
    } catch(err) {
      console.error(err);
    }
  }

  load(name: string) {
    this.unregister( ...this.sensors );
    const {devices, program} = JSON.parse( localStorage.getItem(name) );
    localStorage.setItem(localSensorsKey, JSON.stringify(devices) );
    localStorage.setItem(localProgramKey, JSON.stringify(program) );
    location.reload();
  }

  get savedConfigurations(): string[] {
    const L = Object.entries(localStorage).map( ([k]) => k);
    return L.filter( k => k.indexOf(`CCBL_TEST::`) === 0);
  }

  save(name: string) {
    localStorage.setItem(`CCBL_TEST::${name}`, JSON.stringify( {
      devices: this.sensors,
      program: this.progVersionner.getCurrent()
    } ) );
    console.log(`CCBL_TEST::${name}`, localStorage.getItem(`CCBL_TEST::${name}`) );
  }

  startProgram() {
    if (this.ccblProg) {
      this.ccblProg.dispose();
    }
    this.ccblProg = new CCBLProgramObject('progRoot', this.clock);
    this.ccblProg.loadHumanReadableProgram(this.progVersionner.getCurrent(), this.env, {});
    this.ccblProg.activate();
    this.ccblProg.UpdateChannelsActions(); // commitStateActions();

    const prog = this.ccblProg.toHumanReadableProgram();
    this.progVersionner.updateWith( prog );
  }

  reset() {
    localStorage.removeItem(localSensorsKey);
    localStorage.removeItem(localProgramKey);
    location.reload();
  }

  appendDevice(label: string, deviceType: SensorVarType, deviceData: SensorDataType) {
    const sensor: Sensor = {
      type: deviceData,
      label, name: label,
      userCanControl: deviceType === 'channel',
      varType: deviceType
    };
    // Register
    this.register(sensor);
  }

  unregister(...sensors: Sensor[]) {
    this.sensors = this.sensors.filter( s => sensors.indexOf(s) !== -1 );
  }

  register(sensor: Sensor) {
    const emitter = new CCBLEmitterValue<any>(undefined);
    if (sensor.userCanControl) {
      const channel = new Channel<any>( emitter );
      this.env.register_Channel(sensor.name, channel);
    } else {
      this.env.register_CCBLEmitterValue(sensor.name, emitter);
      emitter.on( v => {
        setTimeout( () => this.ccblProg?.UpdateChannelsActions() );
      } );
    }
    this.sensors.push(sensor);
    localStorage.setItem(localSensorsKey, JSON.stringify(this.sensors));
  }

  setRootProgram(program: HumanReadableProgram): void {
    if (!!this.privProgVersionner) {
      this.privProgVersionner.dispose();
    }
    this.privProgVersionner = new ProgVersionner(program);
    this.privProgVersionner.asObservable().subscribe( prog => {
      localStorage.setItem(localProgramKey, JSON.stringify(prog) );
    });
  }

  get progVersionner(): ProgVersionner {
    return this.privProgVersionner;
  }

  getObsValue(id: string): Observable<any> {
    let obs = this.mapObs.get(id);
    if (!obs) {
      const ccblEmitter = this.env.get_Channel_FromId(id)?.getValueEmitter() || this.env.get_CCBLEmitterValue_FromId(id);
      if (!!ccblEmitter) {
        obs = new Observable(subscriber => {
          ccblEmitter.on( data => subscriber.next(data) );
        });
      } else {
        throw new Error(`No emitter with id ${id}`);
      }
    }
    return obs;
  }

  setValue(type: 'channel' | 'emitter' | 'event', varName: string, value: any) {
    switch (type) {
      case 'channel': return this.env.get_Channel_FromId(varName)?.getValueEmitter().set(value);
      case 'emitter': return this.env.get_CCBLEmitterValue_FromId(varName)?.set(value);
      case 'event': return this.env.getCCBLEvent(varName)?.trigger( {value} );
    }
  }

  getValue(id: string): any {
    const emitter = this.env.get_Channel_FromId(id)?.getValueEmitter() || this.env.get_CCBLEmitterValue_FromId(id);
    return emitter?.get();
  }
}
