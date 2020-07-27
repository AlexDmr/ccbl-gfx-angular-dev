import { Injectable } from '@angular/core';
import { HumanReadableStateContext, HumanReadableProgram } from 'ccbl-js/lib/ProgramObjectInterface';
import { computeDependencies, ActionsPath, getStateChildren, unionOrderedAP, equalLActionsPath } from './smt.definitions';

const dec: string[] = [];

@Injectable({
  providedIn: 'root'
})
export class SmtService {

  constructor() { }

  async evalProgram(P: HumanReadableProgram): Promise<ActionsPath[]> {
    const LAP: ActionsPath[] = computeDependencies(P);
    // Calcul atteignabilité&co des contexts dans LAP
    if (LAP.length > 0) {
      await this.evalAP(LAP[0], LAP);
    }
    // Calcul d'occlusion des opérations
    //   - cas d'une opération qui en occulte une autre
    //   - cas d'un ensemble d'opération qui en occulte une autre
    //     A : 0
    //     E >= 0 alors A : 1
    //     E <  0 alors A : 2
    return LAP
  }

  async evalAP(c: ActionsPath, LAP: ActionsPath[]): Promise<ActionsPath> {
    // First, eval parent if needed
    if (c.computationState === 'Undone') {
      const parent = c.ancestors[c.ancestors.length - 1];
      if (parent?.computationState === 'Undone') {
        await this.evalAP(parent, LAP);
      }
      await this.evalAPinContext(c, parent?.canBeTrue || [[]], LAP);
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
  private async evalAPinContext(c: ActionsPath, LLC: ActionsPath[][], LAP: ActionsPath[]): Promise<ActionsPath[][]> {
    console.log(dec.join(''), c.context.id, c.computationState);
    switch (c.computationState) {
      case 'Undone':
        c.computationState = 'WiP';
        c.canBeTrue = [];
        for (const LC of LLC) {
          const cLLC = await this.getLLC(c, LC, LAP);
          for (const cLC of cLLC) {
            // Eval c in the context of LC
            if (await this.canBeTrue(c, cLC)) {
              c.canBeTrue.push(cLC);
            }
            if (await this.canHold(c, cLC)) {
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
            await this.evalAPinContext(ap, L, LAP);
            dec.pop();
          }
        } else {
          c.computationState = 'Undone';
          // c.canBeTrue = [];
        }
        console.log(dec.join(''), c.context.id, 'now', c.computationState);
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
  async getLLC(c: ActionsPath, LC: ActionsPath[], LAP: ActionsPath[]): Promise<ActionsPath[][]> {
    const LAPtoEval: ActionsPath[][] = [];
    if (c.dependencies.length > 0) {
      const LP = c.dependencies.filter( lap => !lap.find(ap => ap.computationState === 'WiP') );
      for (const lap of LP) {
        // First, compute ALPHA, i.e. under which configurations AP can be true and can hold
        for (const ap of lap) {
          dec.push(`\t`);
          await this.evalAP(ap, LAP);
          dec.pop();
        }

        // Combine LC configuration with ALPHA configurations
        lap.forEach( ap => {
          ap.canBeTrue.forEach(L => {
            const orderedL = unionOrderedAP(...LC, ...L)
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

  async canBeTrue(c: ActionsPath, LC: ActionsPath[]): Promise<boolean> {
    return true;
  }

  async canHold(c: ActionsPath, LC: ActionsPath[]): Promise<boolean> {
    return true;
  }
}
