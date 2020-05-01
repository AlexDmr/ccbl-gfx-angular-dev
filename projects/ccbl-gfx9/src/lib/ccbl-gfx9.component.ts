import {BehaviorSubject, Subscription} from 'rxjs';
import {ChangeDetectionStrategy, Component, HostListener, Input, OnChanges, OnInit} from '@angular/core';
import {
  ContextOrProgram,
  HumanReadableProgram,
  HumanReadableStateContext,
  VariableDescription
} from 'ccbl-js/lib/ProgramObjectInterface';
import {CcblGfx9Service, ProgVersionner} from './ccbl-gfx9.service';

@Component({
  selector: 'lib-ccbl-program',
  styleUrls: ['ccbl-gfx9.component.scss'],
  templateUrl: 'ccbl-gfx9.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CcblGfx9Component implements OnInit, OnChanges {
  // tslint:disable-next-line: no-input-rename
  @Input('program-versionner') private progVersionner: ProgVersionner;
  updateObs = new BehaviorSubject<boolean>(true);
  private program: HumanReadableProgram;
  private subscription: Subscription;

  constructor(private ccblGfxService: CcblGfx9Service) {
  }

  ngOnInit() {
  }

  ngOnChanges() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      // console.log("Update program to be displayed");
    }
    this.program = this.progVersionner.getCurrent();
    this.subscription = this.progVersionner.asObservable().subscribe( P => {
      this.program = P;
      console.log('New program version:', P);
      this.updateObs.next( true );
    } );
  }

  get programVersionner() {
    return this.progVersionner;
  }

  getRootContext(): HumanReadableStateContext {
    return {
      contextName: 'Program',
      actions: this.program.actions,
      allen: this.program.allen,
      ccblContext: this.program.ccblContext
    };
  }

  getDuringContexts(): ContextOrProgram[] {
    if (this.program.allen && this.program.allen.During) {
      return this.program.allen.During;
    } else {
      return [];
    }
  }

  appendLocalChannel() {
    this.progVersionner.appendLocalChannel({name: 'ChannelName', type: 'string'});
  }

  appendImportedChannel() {
    this.progVersionner.appendImportedChannel({name: 'Channel name', type: 'string'});
  }

  appendImportedEmitter() {
    this.progVersionner.appendImportedEmitter({name: 'Emitter name', type: 'string'});
  }

  appendImportedEvent() {
    this.progVersionner.appendImportedEvent({name: 'Event name', type: 'string'});
  }

  appendExportedChannel() {
    this.progVersionner.appendExportedChannel({name: 'Channel name', type: 'string'});
  }

  appendExportedEmitter() {
    this.progVersionner.appendExportedEmitter({name: 'Emitter name', type: 'string'});
  }

  appendExportedEvent() {
    this.progVersionner.appendExportedEvent({name: 'Event name', type: 'string'});
  }

  getImportedChannels(): VariableDescription[] {
    if (this.program.dependencies && this.program.dependencies.import && this.program.dependencies.import.channels) {
      return this.program.dependencies.import.channels;
    } else {
      return [];
    }
  }

  getImportedEmitters(): VariableDescription[] {
    if (this.program.dependencies && this.program.dependencies.import && this.program.dependencies.import.emitters) {
      return this.program.dependencies.import.emitters;
    } else {
      return [];
    }
  }

  getImportedEvents(): VariableDescription[] {
    if (this.program.dependencies && this.program.dependencies.import && this.program.dependencies.import.events) {
      return this.program.dependencies.import.events;
    } else {
      return [];
    }
  }

  getExportedChannels(): VariableDescription[] {
    if (this.program.dependencies && this.program.dependencies.export && this.program.dependencies.export.channels) {
      return this.program.dependencies.export.channels;
    } else {
      return [];
    }
  }

  getExportedEmitters(): VariableDescription[] {
    if (this.program.dependencies && this.program.dependencies.export && this.program.dependencies.export.emitters) {
      return this.program.dependencies.export.emitters;
    } else {
      return [];
    }
  }

  getExportedEvents(): VariableDescription[] {
    if (this.program.dependencies && this.program.dependencies.export && this.program.dependencies.export.events) {
      return this.program.dependencies.export.events;
    } else {
      return [];
    }
  }

  getLocalChannels(): VariableDescription[] {
    if (this.program.localChannels) {
      return this.program.localChannels;
    } else {
      return [];
    }
  }

  undo() {
    console.log('undo');
    this.progVersionner.undo();
  }

  redo() {
    console.log('redo');
    this.progVersionner.redo();
  }

  @HostListener('window:keydown'/*'documen
  t:keypress'*/, ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // console.log("keybord event", event);
    if ( (event.key === 'z' || event.key === '') && event.ctrlKey) {
      this.undo();
    } else if ( (event.key === 'y' || event.key === '') && event.ctrlKey) {
      this.redo();
    }
  }
}
