import { Injectable } from '@angular/core';
import { ActionUpdate, ContextUpdate } from 'ccbl-js/lib/ccbl-exec-data';
import { CCBLProgramObjectInterface, HumanReadableEventAction, HumanReadableEventContext, HumanReadableStateAction, HumanReadableStateContext } from 'ccbl-js/lib/ProgramObjectInterface';
import { Observable } from 'rxjs';
import { ProxyCcblProg } from './ProxyCcblProg';

@Injectable()
export class EmptyProxyCcblProgService implements ProxyCcblProg {

  constructor() { }

  setProgram(p: CCBLProgramObjectInterface): this {
    return this;
  }

  getActionProxy (A: HumanReadableStateAction  | HumanReadableEventAction ): undefined | Observable<ActionUpdate > {
    return undefined;
  }
  getContextProxy(A: HumanReadableStateContext | HumanReadableEventContext): undefined | Observable<ContextUpdate> {
    return undefined;
  }

}
