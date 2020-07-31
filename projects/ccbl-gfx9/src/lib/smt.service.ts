import { Injectable } from '@angular/core';
import { HumanReadableStateContext, HumanReadableProgram, VariableDescription } from 'ccbl-js/lib/ProgramObjectInterface';
import { computeDependencies, ActionsPath, getStateChildren,
         unionOrderedAP, equalLActionsPath, getProgramDeclarations,
         getActionsPathWithoutLastActions, getContexts, getActions, getSMTExpr, getActionsSMT,
         Negation, EnumerateContextsByPriorityInv } from './smt.definitions';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/internal/operators/filter';

@Injectable({
  providedIn: 'root'
})
export class SmtService {
  private url = 'ws://localhost:8080';
  private subjProgEval = new BehaviorSubject<SMTconfig>( undefined );
  obsProgEval: Observable<SMTconfig> = this.subjProgEval.asObservable().pipe( filter(c => !!c) );

  constructor() {
    console.log('Init a SmtService');
  }

  get URL(): string {
    return this.url;
  }

  config(url?: string) {
    this.url = url ?? this.url;
  }

  async evalProgram(P: HumanReadableProgram): Promise<SMTconfig> {
    // const LAP: ActionsPath[] = computeDependencies(P);
    // Calcul atteignabilité&co des contexts dans LAP
    const conf = new SMTconfigC(P);
    await conf.init( this.url );
    // Direct canBeTrue computation
    for (const ap of conf.LAP) {
      // console.log('<evalProgram-evalAP', ap.context.id, '>');
      await this.evalAP(ap, conf);
      await this.developConsequences(ap, conf, false); // XXX DEBUG
      await this.developConsequences(ap, conf, true ); // XXX DEBUG
      // console.log('</evalProgram-evalAP>');
      ap.computationState = 'Done';
    }
    this.subjProgEval.next(conf);
    return conf;
  }

  async developConsequences(AP: ActionsPath, conf: SMTconfig, withAP = false): Promise<ActionsPath> {
    const L0: ActionsPath[] = EnumerateContextsByPriorityInv({...conf.P, id: 'root', contextName: 'root'})
                             .map(c => conf.LAP.find(ap => ap.context.id === c.id) );
    const lap = L0.filter(ap => ap !== AP && !AP.ancestors.find(a => a.context === ap.context) );
    const newCanBeTrue = [];
    for (const cond of AP.canBeTrue) {
      let newCond = unionOrderedAP( ...(withAP ? [...cond, AP] : cond) ) // [...cond];
      // Filter cond and their ancestors
      let L = lap.filter(ap => !newCond.find(a => a.context === ap.context && !a.ancestors.find(an => an.context === ap.context) ) );
      while (L.length > 0) {
        const ap0 = L.shift();
        const apNeg = Negation(ap0);
        const canApNegBeTrue: boolean = await this.canBeTrue(apNeg, newCond, conf);
        if (!canApNegBeTrue) { // cond => ap
          newCond.push(ap0);
          // Recursively restart
          L = lap.filter(ap => !newCond.find(a => a.context === ap.context && !a.ancestors.find(an => an.context === ap.context) ) );
        } else { // Remove ap descendants from L
          L = L.filter(ap => ap !== ap0 && !ap.ancestors.find(a => a.context === ap0.context) );
        }
      } // end whil L.length
      newCond = unionOrderedAP(...newCond);
      if (await this.canBeTrue(AP, newCond, conf)) {
        newCanBeTrue.push(newCond);
      }
    }
    AP.canBeTrue = newCanBeTrue.reduce( (acc, LAP) => acc.find(L => equalLActionsPath(L, LAP)) ? acc : [...acc, LAP], []);
    return AP;
  }

  async evalAP(c: ActionsPath, conf: SMTconfig): Promise<ActionsPath> {
    const {LAP} = conf;
    // console.log('<evalAP', c.context.id, '>');
    // First, eval parent if needed
    if (c.computationState === 'Undone') {
      const parent = c.ancestors[c.ancestors.length - 1];
      if (parent?.computationState === 'Undone') {
        await this.evalAP(parent, conf);
      }
      await this.evalAPinContext(c, parent?.canBeTrue || [[]], conf);
    }
    // console.log('</evalAP>');
    return c;
  }

  /**
   * Returns the list of list of contexts for which c can be evaluated true.
   * Each of them will include LC.
   * If c has no dependency, then the result is [LC]
   * If it has dependencies, then each of them is considered recursively to build the result.
   * @param c   The context to consider
   * @param LC  The list of list of contexts under which c has to be evaluated originally
   * @param LAP The list of contexts of the program containing c
   * @returns the list of list of contexts for which c can be evaluated true.
   */
  private async evalAPinContext(c: ActionsPath, LLC: ActionsPath[][], conf: SMTconfig): Promise<ActionsPath[][]> {
    const {LAP} = conf;
    // console.log('<evalAPinContext', c.context.id, '>');
    switch (c.computationState) {
      case 'Undone':
        c.computationState = 'WiP';
        c.canBeTrue = [];
        for (const LC of LLC) {
          const cLLC = await this.getLLC(c, LC, conf);
          for (const cLC of cLLC) {
            // Eval c in the context of LC
            if (await this.canBeTrue(c, cLC, conf)) {
              c.canBeTrue.push(cLC);
            }
            if (await this.canHold  (c, cLC, conf)) {
              c.canHold.push(cLC);
            }
          }
        }
        if (c.canBeTrue.length === c.dependencies.length) {
          c.computationState = 'Done';
          /*// Go through childrens
          const children: HumanReadableStateContext[] = getStateChildren(c.context);
          const L = c.canBeTrue.map( lap => [...lap, c]);
          for (const C of children) {
            const ap = LAP.find( AP => AP.context === C);
            await this.evalAPinContext(ap, L, conf);
          }*/
        } else {
          c.computationState = 'Undone';
        }
        // console.log('</evalAPinContext>');
        return c.canBeTrue;
      case 'WiP': // If we are here, there is a dependency circularity
        // console.log('</evalAPinContext>');
        return [];
      case 'Done':
        // console.log('</evalAPinContext>');
        return c.canBeTrue;
    }
  }

  /**
   * Returns the list of list of contexts for which c has to be evaluated.
   * Each of them will include LC.
   * If c has no dependency, then the result is [LC]
   * If it has dependencies, then each of them is considered recursively to build the result.
   * @param c   The context to consider
   * @param LC  The list of contexts under which c has to be evaluated originally
   * @returns   The list of list of contexts for which c has to be evaluated
   */
  async getLLC(c: ActionsPath, LC: ActionsPath[], conf: SMTconfig): Promise<ActionsPath[][]> {
    const {LAP} = conf;
    const LAPtoEval: ActionsPath[][] = [];
    if (c.dependencies.length > 0) {
      const LP = c.dependencies.filter( lap => !lap.find(ap => ap.computationState === 'WiP') );
      for (const lap of LP) {
        // First, compute ALPHA, i.e. under which configurations AP can be true and can hold
        for (const ap of lap) {
          await this.evalAP(ap, conf);
        }

        // Combine LC configuration with ALPHA configurations
        lap.forEach( ap => {
          ap.canBeTrue.forEach(L => {
            const orderedL = unionOrderedAP(...LC, ...L, ap)
                            .filter( e =>  !e.ancestors.find(a => a.context === c.context) )
                            .filter( e =>  !c.ancestors.find(a => a.context === e.context) )
                            .filter( e =>   c.context !== e.context                         );
            // Push them into the configurations
            if( orderedL.length > 0 &&
               !LAPtoEval.find(A => equalLActionsPath(A, orderedL))
              ) {
                LAPtoEval.push( orderedL );
              }
            });
        });
        if (LAPtoEval.length === 0) {
          LAPtoEval.push([c]);
        }
      }
    } else {
      LAPtoEval.push(LC);
      console.error('should never get there...');
    }

    return LAPtoEval;
  }

  async canBeTrue(c: ActionsPath, LAP: ActionsPath[], conf: SMTconfig): Promise<boolean> {
    const c0: ActionsPath = getActionsPathWithoutLastActions(c);
    const ancestors: ActionsPath[] = [
      ...LAP.flatMap(ap => ap.ancestors),
      ...c.ancestors
    ];
    const L = unionOrderedAP( ...[...ancestors, ...LAP, c0] ); // c].map( C => C === c ? c0 : C) );
    const LC = getContexts(...L);
    const LA = getActions (...L);

    const Lsmt: string[] = [
      ...LC.map(C => [
        '(assert ',
        getSMTExpr(conf.P, C.state || 'true').SMT,
        ' )'
      ].join('')),
      getActionsSMT(conf.P, LA)
    ];

    const SMT: string = [
      '(push)',
      ...Lsmt,
      '(check-sat)',
      '(pop)', '', '', ''
    ].join(`\n`);
    // Eval c0.state in the context provided by L
    const [sat] = await conf.send(SMT);
    return sat === 'sat';
  }

  async canHold(c: ActionsPath, LAP: ActionsPath[], conf: SMTconfig): Promise<boolean> {
    return true;
  }

}

interface SMTconfig {
  P: HumanReadableProgram;
  LAP: ActionsPath[];
  ws: WebSocket;
  init(url: string): void;
  send(msg: string): Promise<string[]>;
  close(): void;
}

class SMTconfigC implements SMTconfig {
  LAP: ActionsPath[];
  ws: WebSocket;
  private Lcb: CBobj[] = [];

  constructor(public P: HumanReadableProgram) {
      this.LAP = computeDependencies(P);
    }

    async init(url: string) {
      this.ws = await this.openSession(url);
      this.ws.onmessage = (evt: MessageEvent) => {
        evt.data.trim().split(`\n`).forEach( sat => {
          this.Lcb[0].L.push(sat);
          if (this.Lcb[0].L.length === this.Lcb[0].nb) {
            const cb = this.Lcb.shift();
            cb.on( cb.L );
          }
        });
      };
      return this.ws.send( getProgramDeclarations(this.P) );
    }

    send(msg: string): Promise<string[]> {
      const nb = msg.split(`\n`).reduce( (n, w) => w === '(check-sat)' ? n + 1 : n, 0);
      const cb: CBobj = {nb, on: undefined, L: []};
      this.Lcb.push(cb);
      const P =  new Promise<string[]>(
        (resolve, reject) => cb.on = resolve
      );
      this.ws.send(msg);
      return P;
    }

    close(): void {
      this.ws.close();
    }

    private openSession(url: string): Promise<WebSocket> {
      const ws = new WebSocket(url);
      return new Promise( (resolve, reject) => {
        ws.onopen = event => resolve(ws);
      });
    }

  }

  interface CBobj {
    nb: number;
    on: (r: string[]) => void;
    L: string[];
  }
