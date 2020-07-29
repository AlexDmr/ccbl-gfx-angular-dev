import { Injectable } from '@angular/core';
import { HumanReadableStateContext, HumanReadableProgram, VariableDescription } from 'ccbl-js/lib/ProgramObjectInterface';
import { computeDependencies, ActionsPath, getStateChildren,
         unionOrderedAP, equalLActionsPath, getProgramDeclarations,
         getActionsPathWithoutLastActions, getContexts, getActions, getSMTExpr, getActionsSMT } from './smt.definitions';

const dec: string[] = [];

@Injectable({
  providedIn: 'root'
})
export class SmtService {
  private url = 'ws://localhost:8080';

  constructor() { }

  get URL(): string {
    return this.url;
  }

  config(url?: string) {
    this.url = url ?? this.url;
  }

  async evalProgram(P: HumanReadableProgram): Promise<ActionsPath[]> {
    // const LAP: ActionsPath[] = computeDependencies(P);
    // Calcul atteignabilité&co des contexts dans LAP
    const conf = new SMTconfigC(P);
    await conf.init( this.url );
    for (const ap of conf.LAP) {
      await this.evalAP(ap, conf);
      ap.computationState = 'Done';
    }
    // await this.evalAP(conf.LAP[0], conf );
    // Calcul d'occlusion des opérations
    //   - cas d'une opération qui en occulte une autre
    //   - cas d'un ensemble d'opération qui en occulte une autre
    //     A : 0
    //     E >= 0 alors A : 1
    //     E <  0 alors A : 2
    return conf.LAP;
  }

  async evalAP(c: ActionsPath, conf: SMTconfig): Promise<ActionsPath> {
    const {LAP} = conf;
    // First, eval parent if needed
    if (c.computationState === 'Undone') {
      const parent = c.ancestors[c.ancestors.length - 1];
      if (parent?.computationState === 'Undone') {
        await this.evalAP(parent, conf);
      }
      await this.evalAPinContext(c, parent?.canBeTrue || [[]], conf);
    }
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
    // console.log(dec.join(''), c.context.id, c.computationState);
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
          // Go through childrens
          const children: HumanReadableStateContext[] = getStateChildren(c.context);
          const L = c.canBeTrue.map( lap => [...lap, c]);
          for (const C of children) {
            const ap = LAP.find( AP => AP.context === C);
            dec.push(`\t`);
            await this.evalAPinContext(ap, L, conf);
            dec.pop();
          }
        } else {
          c.computationState = 'Undone';
        }
        // console.log(dec.join(''), c.context.id, 'now', c.computationState);
        return c.canBeTrue;
        break;
        case 'WiP': // If we are here, there is a dependency circularity
          return [];
        case 'Done':
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
          dec.push(`\t`);
          await this.evalAP(ap, conf);
          dec.pop();
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
    const L = unionOrderedAP( ...[...ancestors, ...LAP, c].map( C => C === c ? c0 : C) );
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
    // console.log(SMT);
    // Eval c0.state in the context provided by L
    const [sat] = await conf.send(SMT);
    console.log(c.context.id, `in [${LC.map(ctxt => ctxt.id).join(', ')}] = `, sat);
    console.log(SMT);
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
      this.ws.send(msg);
      return new Promise<string[]>(
        (resolve, reject) => this.Lcb.push({nb, on: resolve, L: []})
      );
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
