import { Injectable } from '@angular/core';
import { ActionUpdate, ContextUpdate } from 'ccbl-js/lib/ccbl-exec-data';
import { CCBLProgramObjectInterface, HumanReadableEventAction, HumanReadableEventContext, HumanReadableProgram, HumanReadableStateAction, HumanReadableStateContext } from 'ccbl-js/lib/ProgramObjectInterface';
import { Observable } from 'rxjs';
import { of } from 'rxjs/internal/observable/of';
import { ProxyCcblProg } from './ProxyCcblProg';

@Injectable()
export class EmptyProxyCcblProgService implements ProxyCcblProg {

  constructor() { }

  readonly program: Observable<HumanReadableProgram> = of({});

  connect(url: string): this {
    throw "cannot connect to a server using a EmptyProxyCcblProgService, use a RemoteProxyCcblProgService instead";
  }

  setProgram(p: CCBLProgramObjectInterface): this {
    throw "cannot set a program with EmptyProxyCcblProgService, use a DirectProxyCcblProgService instead";
  }

  getActionProxy (A: HumanReadableStateAction  | HumanReadableEventAction ): undefined | Observable<ActionUpdate > {
    throw "cannot getActionProxy with EmptyProxyCcblProgService"
  }
  getContextProxy(A: HumanReadableStateContext | HumanReadableEventContext): undefined | Observable<ContextUpdate> {
    throw "cannot getContextProxy with EmptyProxyCcblProgService"
  }

}
