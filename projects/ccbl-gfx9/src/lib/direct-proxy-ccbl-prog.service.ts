import { Injectable } from '@angular/core';
import { ActionUpdate, ContextUpdate } from 'ccbl-js/lib/ccbl-exec-data';
import { ChannelActionInterface, ChannelActionStateInterface } from 'ccbl-js/lib/ChannelActionStateEventInterface';
import { CCBLContext } from 'ccbl-js/lib/Context';
import { CcblProgramElements, CCBLProgramObjectInterface, HumanReadableEventAction, HumanReadableEventContext, HumanReadableStateAction, HumanReadableStateContext } from 'ccbl-js/lib/ProgramObjectInterface';
import { BehaviorSubject, Observable } from 'rxjs';
import { ProxyCcblProg } from './ProxyCcblProg';

@Injectable()
export class DirectProxyCcblProgService implements ProxyCcblProg {
  private ccblProg?: CCBLProgramObjectInterface;
  private elements?: CcblProgramElements;
  private mapActions  = new Map<string, Observable<ActionUpdate>>;
  private mapContexts = new Map<string, Observable<ContextUpdate>>;

  constructor() { }

  setProgram(p: CCBLProgramObjectInterface): this {
    this.ccblProg = p;
    this.elements = p.getCcblElements();
    
    // Plug actions
    const actions: ChannelActionInterface[] = [];
    const LA = [this.elements];
    while (LA.length > 0) {
      const elements = LA.pop();
      actions.push( ...Object.values(elements?.stateActions ?? {}), ...Object.values(elements?.eventActions ?? {}) );
      LA.push( ...Object.values(elements?.subProgramInstances ?? {}) )
    }
    for (const act of actions) {
      const bs = new BehaviorSubject<ActionUpdate>({
        type: "action update",
        actionId: act.id,
        active: act.getIsActivated().get(),
        overrided: act.isChannelActionState() ? (act as ChannelActionStateInterface).getOverrideExpression() : undefined
      });
      act.getIsActivated().on( active => bs.next({...bs.value, active}) );
      if (act.isChannelActionState()) {
        (act as ChannelActionStateInterface).onOverride( overrided => bs.next({...bs.value, overrided}) )
      }
      this.mapActions.set(act.id, bs.asObservable());
    }

    // Plug the contexts
    const contexts: CCBLContext[] = [];
    const LE = [this.elements];
    while (LE.length > 0) {
      const elements = LE.pop();
      contexts.push( ...Object.values(elements?.stateContexts ?? {}), ...Object.values(elements?.eventContexts ?? {}) );
      LE.push( ...Object.values(elements?.subProgramInstances ?? {}) )
    }
    for (const ctxt of contexts) {
      const bs = new BehaviorSubject<ContextUpdate>({
        type: "context update",
        contextId: ctxt.id,
        active: ctxt.getActive()
      });
      ctxt.onActiveUpdated( active => bs.next({...bs.value, active}) );
      this.mapContexts.set(ctxt.id, bs.asObservable());
    }

    // return
    return this;
  }

  getActionProxy (A: HumanReadableStateAction  | HumanReadableEventAction ): undefined | Observable<ActionUpdate > {
    if (A.id) {
      return this.mapActions.get(A.id);
    }
    return undefined;
  }

  getContextProxy(C: HumanReadableStateContext | HumanReadableEventContext): undefined | Observable<ContextUpdate> {
    if (C.id) {
      return this.mapContexts.get(C.id);
    }
    return undefined;
  }

}
