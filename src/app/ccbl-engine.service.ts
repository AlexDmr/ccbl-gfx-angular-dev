import { Injectable } from '@angular/core';
import {copyHumanReadableProgram, HumanReadableProgram} from 'ccbl-js/lib/ProgramObjectInterface';
import {Sensor, SensorDataType, SensorVarType} from './data/setup';
import {initCCBL} from 'ccbl-js/lib/main';
import {Observable, Subject, interval, ConnectableObservable, of, Subscription} from 'rxjs';
import {ProgVersionner} from '../../projects/ccbl-gfx9/src/lib/ccbl-gfx9.service';
import {CCBLEnvironmentExecutionInterface} from 'ccbl-js/lib/ExecutionEnvironmentInterface';
import {CCBLEnvironmentExecution} from 'ccbl-js/lib/ExecutionEnvironment';
import {CCBLClock, CCBLTestClock} from 'ccbl-js/lib/Clock';
import {CCBLEmitterValue} from 'ccbl-js/lib/EmitterValue';
import {Channel, commitStateActions} from 'ccbl-js/lib/Channel';
import {CCBLProgramObject} from 'ccbl-js/lib/ProgramObject';
import {CCBLEvent} from 'ccbl-js/lib/Event';
import { delay, multicast, distinctUntilChanged, switchMap, takeWhile, tap } from 'rxjs/operators';

initCCBL();

const localSensorsKey = 'test_ccbl-gfx_sensors';
const localProgramKey = 'test_ccbl-gfx_program';

@Injectable({
  providedIn: 'root'
})
export class CcblEngineService {
  private privProgVersionner: ProgVersionner;
  env: CCBLEnvironmentExecutionInterface;
  clock: CCBLTestClock = new CCBLTestClock();
  mapObs = new Map<string, Observable<any>>();
  sensors: Sensor[] = [];
  ccblProg: CCBLProgramObject;
  obsClock = new Observable( observer => {
    this.clock.on( ms => observer.next(ms) );
  }).pipe(
    distinctUntilChanged(),
    // tap( (ms) => console.log('clock', ms) ),
    tap( (ms) => this.ccblProg?.UpdateChannelsActions() ),
    switchMap( () =>
      of( undefined ).pipe(
        delay(20),
        tap( () => {if (this.clock.nextForeseenUpdate !== undefined) this.clock.goto( Date.now() )} )
      )
    ),
    multicast( () => new Subject() )
  ) as ConnectableObservable<any>;
  private clockSubscription: Subscription;

  constructor() {
    this.env = new CCBLEnvironmentExecution( this.clock );
    try {
      if (localStorage.getItem(localSensorsKey)) {
        const L: Sensor[] = JSON.parse(localStorage.getItem(localSensorsKey));
        L.forEach(s => this.appendDevice(s.label, s.varType, s.type));
      }
      if (localStorage.getItem(localProgramKey)) {
        const prog: HumanReadableProgram = JSON.parse(localStorage.getItem(localProgramKey));
        const CP = copyHumanReadableProgram(prog, false);
        this.setRootProgram( CP );
        // console.log(prog, CP);
      }
    } catch (err) {
      console.error(err);
    }

    this.clockSubscription = this.obsClock.connect();
    /*this.obsClock.subscribe( () => {
      console.log('yo');
    });*/
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
      program: copyHumanReadableProgram( this.progVersionner.getCurrent(), false )
    } ) );
    const obj = JSON.parse( localStorage.getItem(`CCBL_TEST::${name}`) );
    console.log(`CCBL_TEST::${name}`, obj );
  }

  startProgram() {
    if (this.ccblProg) {
      this.clockSubscription.unsubscribe();
      this.ccblProg.dispose();
    }
    this.ccblProg = new CCBLProgramObject('progRoot', this.clock);
    this.ccblProg.loadHumanReadableProgram(this.progVersionner.getCurrent(), this.env, {});
    this.ccblProg.activate();
    this.ccblProg.UpdateChannelsActions(); // commitStateActions();

    const prog = this.ccblProg.toHumanReadableProgram();
    this.progVersionner.updateWith( prog );
    this.clockSubscription = this.obsClock.connect();
  }

  reset() {
    localStorage.removeItem(localSensorsKey);
    this.deleteProgram();
  }

  deleteSensors() {
    localStorage.removeItem(localSensorsKey);
    location.reload();
  }

  deleteProgram() {
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
    switch (sensor.varType) {
      case 'channel':
        const channel = new Channel<any>( emitter );
        this.env.register_Channel(sensor.name, channel);
        break;
      case 'emitter':
        this.env.register_CCBLEmitterValue(sensor.name, emitter);
        break;
      case 'event':
        const eventer = new CCBLEvent({
          eventName: sensor.name,
          env: this.env,
        });
        this.env.registerCCBLEvent( sensor.name, eventer );
        break;
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
      const copy = copyHumanReadableProgram(prog, false);
      localStorage.setItem(localProgramKey, JSON.stringify( copy ) );
      const obj = JSON.parse( localStorage.getItem(localProgramKey) );
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
    const ms = Date.now();
    this.clock.set(ms);
    switch (type) {
      case 'channel': this.env.get_Channel_FromId(varName)?.getValueEmitter().set(value); break;
      case 'emitter': this.env.get_CCBLEmitterValue_FromId(varName)?.set(value);          break;
      case 'event':   this.env.getCCBLEvent(varName)?.trigger( {value, ms} );             break;
    }
    setTimeout( () => this.ccblProg?.UpdateChannelsActions() );
  }

  getValue(id: string): any {
    const emitter = this.env.get_Channel_FromId(id)?.getValueEmitter() || this.env.get_CCBLEmitterValue_FromId(id);
    return emitter?.get();
  }
}
