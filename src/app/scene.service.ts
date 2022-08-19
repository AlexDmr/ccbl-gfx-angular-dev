import { Injectable } from '@angular/core';
import {CCBLEnvironmentExecutionInterface} from 'ccbl-js/lib/ExecutionEnvironmentInterface';
import {CCBLTestClock} from 'ccbl-js/lib/Clock';
import {CCBLProgramObject} from 'ccbl-js/lib/ProgramObject';
import {BehaviorSubject, combineLatest, ConnectableObservable, merge, Observable, of, Subject, Subscription} from 'rxjs';
import {delay, distinctUntilChanged, multicast, switchMap, tap} from 'rxjs/operators';
import {CCBLEnvironmentExecution} from 'ccbl-js/lib/ExecutionEnvironment';
import {CCBLProgramObjectInterface, HumanReadableProgram, VariableDescription} from 'ccbl-js/lib/ProgramObjectInterface';
import {CCBLEvent} from 'ccbl-js/lib/Event';
import {CCBLEmitterValue} from 'ccbl-js/lib/EmitterValue';
import {Channel} from 'ccbl-js/lib/Channel';
import {CB_CCBLEmitter} from 'ccbl-js/lib/Emitter';
import {Device, People} from './data/Scene';

export interface SimEnvConfig {
  inputs:  {[key: string]: Observable<any>};
  outputs: {[key: string]: CB_CCBLEmitter<any>};
}

@Injectable({
  providedIn: 'root'
})
export class SceneService {
  env?: CCBLEnvironmentExecutionInterface;
  clock: CCBLTestClock = new CCBLTestClock();
  ccblProg?: CCBLProgramObject;
  obsClock = new Observable( observer => {
    this.clock.on( ms => observer.next(ms) );
  }).pipe(
    distinctUntilChanged(),
    // tap( (ms) => console.log('clock =', ms) ),
    tap( (ms) => this.ccblProg?.UpdateChannelsActions() ),
    switchMap( () =>
      of( undefined ).pipe(
        delay(20),
        // tap( () => console.log('Clock update to now') ),
        tap( () => {if (this.clock.nextForeseenUpdate !== undefined) this.clock.goto( Date.now() )} )
      )
    ),
    multicast( () => new Subject() )
  ) as ConnectableObservable<any>;
  private simEnvConfig: SimEnvConfig = {inputs: {}, outputs: {}};
  private peoples: BehaviorSubject<People<any>>[] = [];
  private devices: BehaviorSubject<Device>     [] = [];
  private clockSubscription: Subscription;

  constructor() {
    this.clockSubscription = this.obsClock.connect();
  }

  init(peoples: People<any>[], devices: Device[], cbSimEnv: () => SimEnvConfig) {
    this.peoples = peoples.map( P => new BehaviorSubject<People<any>>(P) );
    this.devices = devices.map( D => new BehaviorSubject<Device>     (D));
    this.simEnvConfig = cbSimEnv();
    const updateClock = () => this.clock.goto( Date.now() );
    merge(...this.peoples, ...this.devices).pipe(delay(10)).subscribe(
      () => {
        this.clock.goto( Date.now() );
        this.ccblProg?.UpdateChannelsActions()
      }
    );
  }

  get peoplesObs(): Observable<People<any>[]> {
    return combineLatest(this.peoples);
  }

  getPeopleObs(name: string): Observable<People<any>> | undefined {
    return this.peoples.find( P => P.getValue().name === name );
  }

  getDeviceObs(name: string): Observable<Device> | undefined {
    return this.devices.find( D => D.getValue().name === name );
  }

  updatePeople(name: string, update: Partial<People<any>>) {
    const subjP = this.peoples.find( P => P.getValue().name === name );
    subjP?.next( {...subjP.getValue(), ...update} )
  }

  updateDevice(name: string, update: Partial<Device>) {
    const subjD = this.devices.find( D => D.getValue().name === name );
    subjD?.next( {...subjD.getValue(), ...update} )
  }

  start(P: HumanReadableProgram): CCBLProgramObjectInterface {
    this.reset();
    const env = this.env = new CCBLEnvironmentExecution( this.clock );

    // Register environment
    const LEm: VariableDescription[] = P.dependencies?.import?.emitters || [];
    const LEv: VariableDescription[] = P.dependencies?.import?.events   || [];
    const LC:  VariableDescription[] = P.dependencies?.import?.channels || [];
    LEv.forEach( vd => {
      const obs = this.simEnvConfig.inputs[vd.name];
      if (!obs) {
        throw new Error(`Eventer ${vd.name} cannot be found in observable Map`);
      } else {
        const ccblEvt = new CCBLEvent({
          eventName: vd.name,
          env: env,
        });
        env.registerCCBLEvent( vd.name, ccblEvt );
        obs.subscribe( e => {
          this.clock.goto( Date.now() );
          ccblEvt.trigger({value: e})
        });
      }
    });
    LEm.forEach( vd => {
      const obs = this.simEnvConfig.inputs[vd.name];
      if (!obs) {
        throw new Error(`Emitter ${vd.name} cannot be found in observable Map`);
      } else {
        const ccblEmiter = new CCBLEmitterValue<any>( undefined );
        env.register_CCBLEmitterValue(vd.name, ccblEmiter);
        obs.subscribe( v => {
          console.log(`Emitter ${vd.name} set to`, v);
          ccblEmiter.set(v);
          setTimeout( () => this.clock.set( Date.now() ), 1);
        } );
      }
    });
    LC.forEach( vd => {
      const cb = this.simEnvConfig.outputs[vd.name];
      if (!cb) {
        throw new Error(`Channel ${vd.name} cannot be found in observable Map`);
      } else {
        const E = new CCBLEmitterValue<any>( undefined );
        const ccblChannel = new Channel(E);
        env.register_Channel(vd.name, ccblChannel);
        E.on( cb );
      }
    });

    // Load program P
    this.ccblProg = new CCBLProgramObject('progRoot', this.clock);
    this.ccblProg.loadHumanReadableProgram(P, this.env, {});

    // Start it
    this.clock.goto( Date.now() );
    this.ccblProg.activate();
    this.ccblProg.UpdateChannelsActions(); // commitStateActions();
    console.log(this.clock, this.clock.nextForeseenUpdate);

    // Subscribe to clock changes
    this.clockSubscription = this.obsClock.connect();

    return this.ccblProg;
  }

  reset() {
    this.clockSubscription?.unsubscribe();
    if (this.ccblProg) {
      if (this.env) {
        const P = this.ccblProg.toHumanReadableProgram();
        const LEm: VariableDescription[] = P.dependencies?.import?.emitters ?? [];
        const LEv: VariableDescription[] = P.dependencies?.import?.events   ?? [];
        const LC:  VariableDescription[] = P.dependencies?.import?.channels ?? [];
        LEm.forEach( e => this.env!.unregister_CCBLEmitterValue(e.name) );
        LEv.forEach( e => this.env!.unregisterCCBLEvent        (e.name) );
        LC .forEach( c => this.env!.unregister_Channel         (c.name) );
      }
      this.ccblProg.dispose();
    }
  }
}
