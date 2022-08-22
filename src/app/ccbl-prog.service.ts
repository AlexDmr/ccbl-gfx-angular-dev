import { Injectable } from '@angular/core';
import { Channel } from 'ccbl-js/lib/Channel';
import { ChannelInterface } from 'ccbl-js/lib/ChannelInterface';
import { CCBLTestClock } from 'ccbl-js/lib/Clock';
import { CCBLEmitterValue } from 'ccbl-js/lib/EmitterValue';
import { CCBLEnvironmentExecution } from 'ccbl-js/lib/ExecutionEnvironment';
import { CCBLEnvironmentExecutionInterface } from 'ccbl-js/lib/ExecutionEnvironmentInterface';
import { CCBLProgramObject } from 'ccbl-js/lib/ProgramObject';
import { HumanReadableProgram, VariableDescription } from 'ccbl-js/lib/ProgramObjectInterface';
import { ProgVersionner } from 'projects/ccbl-gfx9/src/lib/ccbl-gfx9.service';
import { BehaviorSubject, interval, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CcblProgService {
  private clock: CCBLTestClock = new CCBLTestClock();
  private subClock?: Subscription;

  private ccblProg: CCBLProgramObject = new CCBLProgramObject('progRoot', this.clock);
  private env: CCBLEnvironmentExecutionInterface = new CCBLEnvironmentExecution( this.clock );

  readonly progV = new ProgVersionner({});
  readonly obsProgram = this.progV.asObservable();

  private bsStarted = new BehaviorSubject<boolean>(false);
  readonly obsStarted = this.bsStarted.asObservable();

  constructor() {
  }

  get channels(): VariableDescription[] {
    return this.progV.getCurrent().dependencies?.import?.channels ?? [];
  }

  getChannel(name: string): ChannelInterface<any> | undefined {
    return this.env.get_Channel_FromId(name);
  }

  loadProgram(prog: HumanReadableProgram): void {
    const wasStarted = this.bsStarted.value;
    if (wasStarted) {
      this.stop();
    }

    for (const chan of prog.dependencies?.import?.channels ?? []) {
      const C = this.getChannel( chan.name );
      if (!C) {
        const E = new CCBLEmitterValue<any>( "0" );
        const ccblChannel = new Channel(E);
        console.log("register", chan.name)
        this.env.register_Channel(chan.name, ccblChannel);
      }
    }

    // Load...
    this.progV.updateWith(prog);
    this.ccblProg.loadHumanReadableProgram( this.progV.getCurrent(), this.env, {} );

    // Restart if it was already started
    if (wasStarted) {
      this.start();
    }
  }

  start(): void {
    if (!this.bsStarted.value) {
      this.subClock?.unsubscribe();
      this.subClock = interval(100).subscribe( () => {
        this.clock.goto( Date.now() );
        this.ccblProg?.UpdateChannelsActions();
      });
      this.clock.goto( Date.now() );
      this.ccblProg.activate().UpdateChannelsActions();
      this.bsStarted.next(true);
    }
  }

  stop(): void {
    if (this.bsStarted.value) {
      this.subClock?.unsubscribe();
      this.ccblProg.activate(false);
      this.bsStarted.next(false);
    }
  }

}
