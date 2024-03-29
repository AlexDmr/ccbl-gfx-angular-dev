import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {ProgVersionner} from '../ccbl-gfx9.service';
import {ContextOrProgram, HumanReadableEventContext, HumanReadableStateContext, ProgramReference} from 'ccbl-js/lib/ProgramObjectInterface';
import {AllenType} from 'ccbl-js/lib/AllenInterface';

@Component({
  selector: 'lib-ccbl-context-or-program[program-versionner][data]',
  templateUrl: './ccbl-context-or-program.component.html',
  styleUrls: ['./ccbl-context-or-program.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CcblContextOrProgramComponent implements OnInit {
  @Input() data!: ContextOrProgram;
  @Input('program-versionner') progVersionner!: ProgVersionner;
  @Input() isProgramRoot = false;
  @Input() from?: AllenType;

  constructor() { }

  ngOnInit() {
  }

  get programVersionner(): ProgVersionner {
    return this.progVersionner;
  }

  isProgramReference(): boolean {
    return !!(this.data as ProgramReference).programId;
  }

  isStateContext(): boolean {
    const stateContext = this.data as HumanReadableStateContext;
    return stateContext.contextName !== undefined && !this.isEventContext() && !this.isProgramReference();
  }

  isEventContext(): boolean {
    const eventContext = this.data as HumanReadableEventContext;
    return !!eventContext.eventSource || !!eventContext.eventExpression;
  }

  asStateContext(): HumanReadableStateContext {
    return this.data as HumanReadableStateContext;
  }

  asEventContext(): HumanReadableEventContext {
    return this.data as HumanReadableEventContext;
  }

  asProgramReference(): ProgramReference {
    return this.data as ProgramReference;
  }

}
