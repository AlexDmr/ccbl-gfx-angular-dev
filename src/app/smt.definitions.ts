import { HumanReadableStateContext, HumanReadableStateAction, HumanReadableProgram, VariableDescription, ContextOrProgram } from "ccbl-js/lib/ProgramObjectInterface";
import { MathNode, MathJsStatic, create, all } from 'mathjs';

const mathjs: Partial<MathJsStatic> = create(all, {});

export interface ExpressionSMT {
  dependencies: string[]; // Emitters or Channels
  SMT: string;
}

export interface ActionsPath {
  ancestors: ActionsPath[];
  priority: number;
  context: HumanReadableStateContext;
  state: ExpressionSMT;
  actions: HumanReadableStateAction[];     // The actions     that are actives
  constraints: HumanReadableStateAction[]; // The constraints that are actives
  dependencies: ActionsPath[][];           // List of contexts that may influence the context to evaluate true
                                           // i.e. contexts that set the value of a channel from wich state depends
  computationState: 'Undone' | 'WiP' | 'Done';

  canBeTrue: ActionsPath[][];   // The list of possible contexts list that make context state true
  canHold:   ActionsPath[][];
  canBeFalse?: Promise<ActionsPath[][]>;
}

  // LL is a list of variables
  // Each variable can have possible values T[]
  // We send back the combination of variable
  // ex : [[a, b], [c]] => [[], [a], [b], [c], [a, c], [b, c]]
  export function Combination<T>(LL: T[][]): T[][] {
    if (LL.length === 0) {
      return [[]]; // Only empty set
    } else {
      const [LA, ...LLR] = LL;
      // Combinations without LA
      const L1: T[][] = Combination(LLR);

      // Combinations with every possible A in LA
      const L2: T[][] = LA.flatMap( A => L1.map( L => [A, ...L]) )

      return [...L1, ...L2];
    }
  }

export function equalLActionsPath(LAP1: ActionsPath[], LAP2: ActionsPath[]): boolean {
  return LAP1.length === LAP2.length
      && LAP1.reduce( (acc, A) => acc && !!LAP2.find(a => a.context === A.context), true)
        ;
}

export function unionOrderedAP(...LAP: ActionsPath[]): ActionsPath[] {
  return LAP.reduce(
              (L, AP) => L.indexOf(AP) >= 0 ? L : [...L, AP], []
            ).sort( (a: ActionsPath, b: ActionsPath) => a.priority - b.priority );
}

export function getStateAffectationPaths(P: HumanReadableProgram, node: ContextOrProgram): ActionsPath[] {
    const SC = node as HumanReadableStateContext;
    if (SC.contextName !== undefined) {
      // For each channel, compute all paths to affectations (State only)
      const LA: HumanReadableStateAction[] = SC.actions ?? [];

      const LC = [
        ...(SC.allen?.During ?? []),
        ...(SC.allen?.StartWith ?? []),
        ...(SC.allen?.EndWith ?? []),
        ...(SC.allen?.Meet?.contextsSequence ?? [])
      ];

      const AP: ActionsPath = {
        ancestors: [],
        priority: 0,
        context: SC,
        state: getSMTExpr(P, SC.state ?? 'true'),
        actions :     LA.filter(a => a.affectation.type !== 'constraint'),
        constraints : LA.filter(a => a.affectation.type === 'constraint'),
        dependencies: [],
        computationState: 'Undone',
        canBeTrue: [],
        canHold: []
      };
      return [
        AP,
        ...(LC.map(c => getStateAffectationPaths(P, c))
             .reduce( (acc, L) => [...acc, ...L], [] )
             .map( (c, i) => ({
              ...c,
              ancestors: [AP, ...c.ancestors],
              priority: i + 1,
              actions: [...AP.actions.filter(a => !c.actions.find(act => act.channel === a.channel) ), ...c.actions],
              constraints: [...AP.constraints.filter(cs => !c.actions.find(a => a.channel === cs.channel) ), ...c.constraints]
             }) )
        )
      ]
    } else {
      return [];
    }
  }

  export function mathNodeToSMT(P: HumanReadableProgram, node: MathNode): string {
    if (node.isConstantNode) {
      return node.value.toString();
    }
    if ( (node as any).isConditionalNode ) {
      // const {condition, falseExpr, trueExpr}: {condition: MathNode, falseExpr: MathNode, trueExpr: MathNode} = node as any;
      return '';
    }
    if (node.isArrayNode) {
      // const items: MathNode[] = (node as any).items;
      return '';
    }
    if (node.isOperatorNode) {
      const LA: string[] = node.args.map( n => mathNodeToSMT(P, n) );
      const op = node.op === '==' ? '=' : node.op;
      if (LA.length === 1) {
          return `${op}${LA[0]}`;
      } else {
          return `(${op} ${LA.join(' ')})`;
      }
    }
    if (node.isParenthesisNode) {
        return mathNodeToSMT(P, (node as any).content);
    }
    if (node.isSymbolNode) {
        return node.name;
    }
    if (node.isAccessorNode) {
      const Latt = (node as any).index.dimensions as MathNode[];
      const dotNotation = (node as any).index.dotNotation as boolean;
      return Latt.reduce(
        (acc, n) => `${acc}${dotNotation ? '.' : '['}${n.value !== undefined ? n.value : mathNodeToSMT(P, n)}${dotNotation ? '' : ']'}`,
        mathNodeToSMT( P, (node as any).object )
      );
    }
    if (node.isFunctionNode) {
      /*const LA: ParsedExprNode[][] = node.args.map( n => mathNodeToArray(P, n, acceptEvent, ...vocabulary) );
      const F = mathNodeToArray(P, (node as any).fn, acceptEvent, ...vocabulary);
      F[0].type = 'function';
      L.push(
        ...F,
        {label: '( ', type: 'parenthesis', mathNode: node},
        ...LA.reduce( (acc, LE) => [...acc, {label: ', ', type: 'comma', mathNode: node}, ...LE] ),
        {label: ') ', type: 'parenthesis', mathNode: node}
      );*/
    }
    if (node.isBlockNode) {
      /*
      const blocks = (node as any).blocks as MathNode[];
      const LE = blocks.map( b => mathNodeToArray( P, (b as any).node, acceptEvent, ...vocabulary) );
      L.push( ...LE.reduce( (acc, e) => [...acc, {label: '; ', type: 'MathJS::BlockNode'}, ...e] ) );
      */
    }

    return '';
  }

  export function getActionsSMT(P: HumanReadableProgram, actions: HumanReadableStateAction[]): string {
    return actions.map(
      A => `(assert (= ${A.channel} ${getSMTExpr(P, A.affectation.value).SMT} ) )`
    ).join(`\n`);
  }

  export function getSMTExpr(P: HumanReadableProgram, expr: string): ExpressionSMT {
    const node = mathjs.parse( expr );
    const LV: VariableDescription[] = [
      ...(P.localChannels ?? []),
      ...(P.dependencies?.import?.channels ?? []),
      ...(P.dependencies?.export?.channels ?? []),
      ...(P.dependencies?.export?.emitters ?? []),
    ];
    return {
      dependencies: node.filter( n => n.isSymbolNode )
                        .map(n => n.name)
                        .filter(n => !!LV.find(v => v.name === n) )
                        ,
      SMT: mathNodeToSMT( P, node )
    }
}

  export function  computeDependencies(P: HumanReadableProgram): ActionsPath[] {
    const LAP: ActionsPath[] = getStateAffectationPaths(P, {...P, contextName: 'root'});
    LAP.forEach( AP => {
      // AP depend on its parent to be true
      // List all actionsPath dependencies for each variable dependency
      const LL = AP.state.dependencies.map(
        v => LAP.filter( ap => !!(ap.context.actions ?? []).find(a => a.channel === v)) // Filter actionsPath that set v
                .filter( ap =>  !ap.ancestors.find(a => a.context === AP.context)     ) // Filter actionspath that are descendants of AP
                .filter( ap =>  !AP.ancestors.find(a => a.context === ap.context)     ) // Filter actionspath that are ancestors of AP
                .filter( ap =>   AP.context !== ap.context                            ) // Avoid self
        );
      // Register Lcombinaisons as dependencies
      AP.dependencies = Combination(LL).map(
        L => L.reduce( (acc, A) => acc.find(a => a.context === A.context) ? acc : [...acc, A], [] as ActionsPath[])
              .reduceRight(
                (acc, A) => acc.find(a => !!a.ancestors.find(ap => ap.context === A.context)) ? acc : [A, ...acc],
                [] as ActionsPath[]
              )
      ).reduce(
        (accLL, L) => accLL.find (lap => equalLActionsPath(lap, L)) ? accLL : [...accLL, L], [] as ActionsPath[][]
      );
    }); // FIN forEach

    return LAP;
  }

  export function getStateChildren(c: HumanReadableStateContext): HumanReadableStateContext[] {
    return [
      ...( (c.allen?.During    ?? []) as HumanReadableStateContext[] ),
      ...( (c.allen?.StartWith ?? []) as HumanReadableStateContext[] ),
      ...( (c.allen?.EndWith   ?? []) as HumanReadableStateContext[] ),
      // ...( (c.allen?.Meet?.contextsSequence ?? []) as HumanReadableStateContext[] ),
    ].filter(C => C.contextName !== undefined)
  }

  export function getProgramDeclarations(P: HumanReadableProgram): string {
    let str = `\n; Variables declaration\n`;
    const L = [ ...(P.dependencies?.import?.channels || [])
              , ...(P.dependencies?.import?.emitters || [])
              , ...(P.dependencies?.export?.channels || [])
              , ...(P.dependencies?.export?.emitters || [])
              , ...(P.localChannels || [])
              ];
    str += L.map( v => getVarDeclaration(v) ).join(`\n`);
    return str;
  }

  function getVarDeclaration(v: VariableDescription): string {
      switch(v.type.toLowerCase()) {
        case 'boolean':
        case 'bool':
          return `(declare-fun ${v.name} () Bool)`;
        case 'integer':
        case 'int':
          return `(declare-fun ${v.name} () Int)`;
        case 'number':
        case 'real':
          return `(declare-fun ${v.name} () Real)`;
        default:
            const node = mathjs.parse(v.type);
            if (node.isObjectNode) {
              let str = '';
              const properties: {[key: string]: MathNode} = (node as any).properties;
              // tslint:disable-next-line: forin
              for ( const p in properties ) {
                const val = properties[p];
                if (val.isSymbolNode) {
                  str += getVarDeclaration({name: `${v.name}.${p}`, type: val.name});
                  str += `\n`;
                } else {
                  if (node.isObjectNode) {
                      str += getVarDeclaration({name: `${v.name}.${p}`, type: val.toString()});
                      str += `\n`;
                    }
                }
              }
              return str;
            } else {
              return 'unknown';
            }
      }
  }

  export function getActionsPathWithoutLastActions(AP: ActionsPath): ActionsPath {
    return {
      ...AP,
      actions: [],
      context: {
        ...AP.context,
        actions: []
      }
    };
  }

  export function getActions(...L: ActionsPath[]): HumanReadableStateAction[] {
    return L.map(ap => ap.context.actions ?? [])
            .reduce( (acc, LA) => {
              const Lres: HumanReadableStateAction[] = [];
              acc.forEach( act => {
                if (!LA.find(a => a.channel === act.channel)) {
                  Lres.push(act);
                }
              });
              Lres.push( ...LA );
              return Lres;
            } );
  }

  export function getContexts(...L: ActionsPath[]): HumanReadableStateContext[] {
    return L.flatMap( AP => [...getContexts(...AP.ancestors), AP.context] )
            .reduce( (acc, C: HumanReadableStateContext) => !!acc.find(c => c.id === C.id) ? acc : [...acc, C], []);
  }
