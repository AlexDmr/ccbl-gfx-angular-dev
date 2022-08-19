import { Injectable } from '@angular/core';
import { Channel } from 'ccbl-js/lib/Channel';
import { ChannelInterface } from 'ccbl-js/lib/ChannelInterface';
import { CCBLTestClock } from 'ccbl-js/lib/Clock';
import { CCBLEmitterValue } from 'ccbl-js/lib/EmitterValue';
import { CCBLEvent } from 'ccbl-js/lib/Event';
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

  getChannel(name: string): ChannelInterface<unknown> | undefined {
    return this.env.get_Channel_FromId(name);
  }

  loadProgram(prog: HumanReadableProgram): void {
    const wasStarted = this.bsStarted.value;
    if (wasStarted) {
      this.stop();
    }

    // Delete no more used channels and create new ones
    const channels: VariableDescription[] = prog.dependencies?.import?.channels ?? [];
    const deprecatedChannels: VariableDescription[] = this.progV.getChannels().filter( chan => !channels.find( c => c.name === chan.name ) )
    const newChannels: VariableDescription[] = channels.filter( chan => !this.progV.getChannels().find(c => c.name === chan.name) );
    for (const chan of deprecatedChannels) {
      this.env.unregister_Channel(chan.name);
    }
    for (const chan of newChannels) {
      const E = new CCBLEmitterValue<any>( undefined );
      const ccblChannel = new Channel(E);
      this.env.register_Channel(chan.name, ccblChannel);
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
