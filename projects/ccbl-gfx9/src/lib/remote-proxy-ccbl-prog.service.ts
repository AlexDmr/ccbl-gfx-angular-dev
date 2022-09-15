import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { ActionUpdate, ContextUpdate, PayloadForMain } from 'ccbl-js/lib/ccbl-exec-data';
import { CCBLProgramObjectInterface, HumanReadableEventAction, HumanReadableEventContext, HumanReadableProgram, HumanReadableStateAction, HumanReadableStateContext } from 'ccbl-js/lib/ProgramObjectInterface';
import { BehaviorSubject, Observable } from 'rxjs';
import { ProxyCcblProg } from './ProxyCcblProg';
import { runInZone } from './runInZone';


@Injectable()
export class RemoteProxyCcblProgService implements ProxyCcblProg, OnDestroy {
  private mapActions  = new Map<string, {obs: Observable<ActionUpdate>, bs: BehaviorSubject<ActionUpdate>}>;
  private mapContexts = new Map<string, {obs: Observable<ContextUpdate>, bs: BehaviorSubject<ContextUpdate>}>;
  private ws?: WebSocket;
  private bsOpen = new BehaviorSubject<boolean>( false );
  readonly obsOpen: Observable<boolean>;

  private readonly cbOpen  = () => {console.log("ws open"); this.bsOpen.next(true );}
  private readonly cbClose = () => {console.log("ws close"); this.bsOpen.next(false);}
  private readonly cbMessage = (ME: MessageEvent<string>) => {
    console.log("RemoteProxyCcblProgService::cbMessage", ME)
    const msg: PayloadForMain = JSON.parse(ME.data);
    if (msg) {
      switch (msg.type) {
        case "program update":
          this.mapActions .clear();
          this.mapContexts.clear();
          for (const actionId of [...msg.eventActions, ...msg.stateActions]) {
            const bs = new BehaviorSubject<ActionUpdate>({type: "action update", actionId, active: false, overrided: undefined});
            this.mapActions.set(actionId, {bs, obs: bs.pipe( runInZone(this.zone) )});
          }
          for (const contextId of [...msg.eventContexts, ...msg.stateContexts]) {
            const bs = new BehaviorSubject<ContextUpdate>({type: "context update", contextId, active: false});
            this.mapContexts.set(contextId, {bs, obs: bs.pipe( runInZone(this.zone) )});
          }
          this.bsProg.next( msg.program );
          break;
        case "action update":
          this.mapActions.get(msg.actionId)?.bs.next(msg);
          break;
        case "context update":
          this.mapContexts.get(msg.contextId)?.bs.next(msg);
          break;
        }
    }
  }

  constructor(private zone: NgZone) {
    console.log("New RemoteProxyCcblProgService");
    this.obsOpen = this.bsOpen.pipe( runInZone(zone) );
    this.program = this.bsProg.pipe( runInZone(zone) );
  }

  ngOnDestroy(): void {
      this.ws?.close();
  }

  private bsProg = new BehaviorSubject<HumanReadableProgram>( {} );
  readonly program: Observable<HumanReadableProgram>;
  
  connect(url: string): this {
    this.ws?.close();
    console.log("ws connect to", url);
    this.ws = new WebSocket(url/*, ["ccbl-remote"]*/);
    this.ws.addEventListener("open" , this.cbOpen  );
    this.ws.addEventListener("close", this.cbClose );
    this.ws.addEventListener("message", this.cbMessage );
    return this;
  }

  setProgram(p: CCBLProgramObjectInterface): this {
    throw "cannot set a program with RemoteProxyCcblProgService, use a DirectProxyCcblProgService instead";
  }

  getActionProxy (A: HumanReadableStateAction  | HumanReadableEventAction ): undefined | Observable<ActionUpdate > {
    if (A.id) {
      return this.mapActions.get(A.id)?.obs;
    }
    return undefined;
  }
  getContextProxy(C: HumanReadableStateContext | HumanReadableEventContext): undefined | Observable<ContextUpdate> {
    if (C.id) {
      return this.mapContexts.get(C.id)?.obs;
    }
    return undefined;
  }

}
