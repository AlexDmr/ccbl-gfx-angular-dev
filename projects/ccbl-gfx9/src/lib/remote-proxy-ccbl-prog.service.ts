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
    // console.log("RemoteProxyCcblProgService::cbMessage", ME)
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
          // this.bsProg.next( msg.program );
          // XXX DEPRECATED, attention à ce qu'on remonte du server...
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
    this.obsOpen  = this.bsOpen.pipe( runInZone(zone) );
    this.programs = this.bsProg.pipe( runInZone(zone) );
  }

  ngOnDestroy(): void {
      this.ws?.close();
  }

  private bsProg = new BehaviorSubject<{path: string[], program: HumanReadableProgram}[]>( [] );
  readonly programs: Observable<{path: string[], program: HumanReadableProgram}[]>;
  
  disconnect(code: number = 1001): this {
    this.ws?.close(code);
    return this;
  }

  connect(url: string, options?: {jwt: string}): this {
    // XXX DEBUG/DEV
    interface CcblProgramElementsJSON {
      program: HumanReadableProgram;
      subProgramInstances: {[id in string]: CcblProgramElementsJSON};
      stateContexts: string[]; // ids
      eventContexts: string[]; // ids
      stateActions: string[]; // ids
      eventActions: string[]; // ids
    }
    // /XXX
    this.ws?.close();
    console.log("ws connect to", url);
    this.ws = new WebSocket(url/*, ["ccbl-remote"]*/);
    this.ws.addEventListener("open" , () => {
      this.cbOpen();
      if (options?.jwt) {
        this.ws!.send( JSON.stringify({jwt: options.jwt}) );
        // Wait for server response
        let cbUser: (m: MessageEvent<any>) => void;
        this.ws?.addEventListener("message", cbUser = m => {
          try {
            const obj = JSON.parse( m.data ) as {id: string; role: string, programInstances: {
              available: boolean;
              path: string[];
              elements: undefined | Omit<CcblProgramElementsJSON, "subProgramInstances">
            }[]};
            console.log(obj);
            this.bsProg.next(
              obj.programInstances.map( ({available, elements, path}) => available && elements?.program ? {path, program: elements.program} : undefined )
                                  .map( p => {console.log(p); return p} )
                                  .filter( p => !!p )
                                  .map( p => p as {path: string[], program: HumanReadableProgram} )
            );
          } catch(err) {
            console.error("Error during post identification message processing from server", err)
          } finally {
            this.ws?.removeEventListener("message", cbUser);
          }
        })
      }
    });
    this.ws.addEventListener("close", this.cbClose );
    // this.ws.addEventListener("message", this.cbMessage );
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
