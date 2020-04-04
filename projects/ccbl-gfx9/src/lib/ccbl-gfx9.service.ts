import { Injectable } from '@angular/core';
import {
  Affectation,
  ContextOrProgram, DataIsNameUsedInProg,
  HumanReadableContext,
  HumanReadableEventAction,
  HumanReadableEventChannelAction,
  HumanReadableEventContext,
  HumanReadableProgram,
  HumanReadableStateAction,
  HumanReadableStateContext, isNameUsedInProg, ProgramReference,
  VariableDescription, VarLocation, VarRange, Vocabulary
} from 'ccbl-js/lib/ProgramObjectInterface';
import {BehaviorSubject, Observable} from 'rxjs';
import {AllenType} from 'ccbl-js/lib/AllenInterface';
import {scopeInterpolator, mathjs} from 'ccbl-js/lib/CCBLExpressionInExecutionEnvironment';
import {MathNode} from 'mathjs';
import {ParsedExprNode} from './dataParsedExpr';

@Injectable({
  providedIn: 'root'
})
export class CcblGfx9Service {
  private editedPrograms: ProgVersionner[] = [];

  constructor() { }

  startEditing(progOriginal: HumanReadableProgram): ProgVersionner {
    const progVersionner = new ProgVersionner(progOriginal);
    this.editedPrograms.push(progVersionner);
    return progVersionner;
  }

  stopEditing(progVersionner: ProgVersionner) {
    progVersionner.dispose();
    this.editedPrograms = this.editedPrograms.filter( PV => PV !== progVersionner );
  }

}

export class ProgVersionner {
  draggedContext: ContextOrProgram = undefined;

  constructor(private original: HumanReadableProgram) {
    original.localChannels = original.localChannels || [];
    original.dependencies = original.dependencies || {};
    original.dependencies.import = original.dependencies.import || {};
    original.dependencies.import.channels = original.dependencies.import.channels || [];
    original.dependencies.import.emitters = original.dependencies.import.emitters || [];
    original.dependencies.import.events   = original.dependencies.import.events   || [];
    original.dependencies.export = original.dependencies.export || {};
    original.dependencies.export.channels = original.dependencies.export.channels || [];
    original.dependencies.export.emitters = original.dependencies.export.emitters || [];
    original.dependencies.export.events   = original.dependencies.export.events   || [];
    this.progSubj = new BehaviorSubject<HumanReadableProgram>(original);
  }
  private progSubj: BehaviorSubject<HumanReadableProgram>;
  private undos: HumanReadableProgram[] = [];
  private redos: HumanReadableProgram[] = [];

  static getSubContexts(from: ContextOrProgram): ContextOrProgram[] {
    const context = from as HumanReadableStateContext;
    const L: ContextOrProgram[] = [];
    if (context.allen) {
      if (context.allen.During    ) {L.push(...context.allen.During); }
      if (context.allen.StartWith ) {L.push(...context.allen.StartWith); }
      if (context.allen.EndWith   ) {L.push(...context.allen.EndWith); }
      if (context.allen.Meet      ) {L.push(...context.allen.Meet.contextsSequence); }
    }
    return L;
  }

  dispose() {
    this.progSubj.complete();
    this.undos = undefined;
    this.redos = undefined;
  }

  parse(expr: string): MathNode {
    return mathjs.parse(expr);
  }

  getCurrent(): HumanReadableProgram {
    return this.progSubj.getValue();
  }

  getEvents(): VariableDescription[] {
    const prog = this.getCurrent();
    const L: VariableDescription[] = [...prog.dependencies.import.events, ...prog.dependencies.export.events];
    L.sort( (a, b) => a.name.toLowerCase() > b.name.toLocaleLowerCase() ? 1 : -1 );
    return L;
  }

  getEmitters(): VariableDescription[] {
    const prog = this.getCurrent();
    const L: VariableDescription[] = [...prog.dependencies.import.emitters];
    L.sort( (a, b) => a.name.toLowerCase() > b.name.toLocaleLowerCase() ? 1 : -1 );
    return L;
  }

  getChannels(): VariableDescription[] {
    const prog = this.getCurrent();
    const L: VariableDescription[] = [
      ...(prog.localChannels || []),
      ...(prog.dependencies?.import?.channels || []),
      ...(prog.dependencies?.export?.channels || []),
      ...(prog.dependencies?.export?.emitters || [])
    ];
    L.sort( (a, b) => a.name.toLowerCase() > b.name.toLocaleLowerCase() ? 1 : -1 );
    return L;
  }

  updateWith(prog: HumanReadableProgram) {
    this.redos = this.redos.length ? [] : this.redos;
    this.undos.push( this.progSubj.getValue() );
    this.progSubj.next(prog);
  }

  asObservable(): Observable<HumanReadableProgram> {
    return this.progSubj.asObservable();
  }

  // _______________________________________________________________________________________________________________________________________
  // Undo / Redo -----------------------------------------------------------------------------------------------------------
  // _______________________________________________________________________________________________________________________________________
  canUndo(): boolean {
    return this.undos.length > 0;
  }

  undo() {
    if (this.undos.length) {
      const prog = this.undos.pop();
      this.redos.push( this.getCurrent() );
      this.progSubj.next(prog);
    }
    // console.log("redos", this.redos, "undos", this.undos);
  }

  canRedo(): boolean {
    return this.redos.length > 0;
  }

  redo() {
    if (this.redos.length) {
      const prog = this.redos.pop();
      this.undos.push( this.getCurrent() );
      this.progSubj.next(prog);
    }
    // console.log("redos", this.redos, "undos", this.undos);
  }

  // _______________________________________________________________________________________________________________________________________
  // Local channels and emitters -----------------------------------------------------------------------------------------------------------
  // _______________________________________________________________________________________________________________________________________
  appendLocalChannel(varDescr: VariableDescription) {
    const prog = this.getCurrent();
    this.updateWith({
      ...prog,
      localChannels: [...prog.localChannels, varDescr]
    });
  }

  appendImportedChannel(varDescr: VariableDescription) {
    const prog = this.getCurrent();
    const newProg = {...prog};
    newProg.dependencies.import.channels.push(varDescr);
    this.updateWith(newProg);
  }

  appendExportedChannel(varDescr: VariableDescription) {
    const prog = this.getCurrent();
    const newProg = {...prog};
    newProg.dependencies.export.channels.push(varDescr);
    this.updateWith(newProg);
  }

  appendImportedEmitter(varDescr: VariableDescription) {
    const prog = this.getCurrent();
    const newProg = {...prog};
    newProg.dependencies.import.emitters.push(varDescr);
    this.updateWith(newProg);
  }

  appendExportedEmitter(varDescr: VariableDescription) {
    const prog = this.getCurrent();
    const newProg = {...prog};
    newProg.dependencies.export.emitters.push(varDescr);
    this.updateWith(newProg);
  }

  isVariableUsed(varDescr: VariableDescription): boolean {
    // Get all actions and see if it is used left or right side
    // Also have a look in instanciated programs...
    return false;
  }

  appendImportedEvent(varDescr: VariableDescription) {
    const prog = this.getCurrent();
    const newProg = {...prog};
    newProg.dependencies.import.events.push(varDescr);
    this.updateWith(newProg);
  }

  appendExportedEvent(varDescr: VariableDescription) {
    const prog = this.getCurrent();
    const newProg = {...prog};
    newProg.dependencies.export.events.push(varDescr);
    this.updateWith(newProg);
  }

  removeVariableDescription(varDescr: VariableDescription) {
    const prog = this.getCurrent();
    const reducer = (acc, vd) => vd !== varDescr ? [...acc, vd] : acc;
    this.updateWith({
      ...prog,
      localChannels: prog.localChannels.reduce(reducer, []),
      dependencies: {
        import: {
          channels: prog.dependencies.import.channels.reduce(reducer, []),
          emitters: prog.dependencies.import.emitters.reduce(reducer, []),
          events: prog.dependencies.import.events.reduce(reducer, [])
        },
        export: {
          channels: prog.dependencies.export.channels.reduce(reducer, []),
          emitters: prog.dependencies.export.emitters.reduce(reducer, []),
          events: prog.dependencies.export.events.reduce(reducer, [])
        }
      }
    });
  }

  updateVariableDescription(original: VariableDescription, updated: VariableDescription) {
    const prog = this.getCurrent();
    if (original && updated && prog.localChannels) {
      const fctUpdate = vd => vd !== original ? vd : updated;
      this.updateWith({
        ...prog,
        localChannels: prog.localChannels.map(fctUpdate),
        dependencies: {
          import: {
            channels: prog.dependencies.import.channels.map(fctUpdate),
            emitters: prog.dependencies.import.emitters.map(fctUpdate),
            events:   prog.dependencies.import.events  .map(fctUpdate)
          },
          export: {
            channels: prog.dependencies.export.channels.map(fctUpdate),
            emitters: prog.dependencies.export.emitters.map(fctUpdate),
            events:   prog.dependencies.export.events  .map(fctUpdate)
          }
        }
      });
    } else {
      throw new Error('Missing original or updated.');
    }
  }

  isNamedUsed(name: string): boolean {
    const prog = this.getCurrent();

    // local function getImportVariable, getExportVariable
    function getVariableFromVocabulary(voc: Vocabulary): VariableDescription[] {
      const V: VariableDescription[] = [];
      if (voc) {
        V.push(...(voc.channels || []));
        V.push(...(voc.emitters || []));
        V.push(...(voc.events || []));
      }
      return V;
    }
    function getVariableImported(p: HumanReadableProgram): VariableDescription[] {
      return (p && p.dependencies) ? getVariableFromVocabulary(p.dependencies.import) : [];
    }
    function getVariableExported(p: HumanReadableProgram): VariableDescription[] {
      return (p && p.dependencies) ? getVariableFromVocabulary(p.dependencies.export) : [];
    }

    // Name used for a local channel ?
    const LVD: VariableDescription[] = prog.localChannels ? prog.localChannels.slice() : [];
    LVD.push( ...getVariableImported(prog), ...getVariableExported(prog) );

    // Also look in programs instances
    const progRefs = this.getProgramsInstances();
    progRefs.forEach( pgRef => {
      const pgName = pgRef.as;
      const pg: HumanReadableProgram = prog.subPrograms[pgRef.programId];
      getVariableExported(pg).forEach( v => LVD.push({
        ...v,
        name: `${pgName}__${v.name}`,
      }));
    });

    return !!LVD.find(vd => vd.name === name) || Object.keys( scopeInterpolator ).indexOf(name) >= 0;
  }

  getProgramsInstances(): ProgramReference[] {
    const prog = this.getCurrent();

    function isProgramReference(c: ContextOrProgram): boolean {
      return !!(c as ProgramReference).programId;
    }

    const contexts: ContextOrProgram[] = ProgVersionner.getSubContexts( {contextName: 'root', ...prog} );
    const Lpgref: ProgramReference[] = [];
    while (contexts.length) {
      const context = contexts.pop();
      if (isProgramReference(context)) {
        Lpgref.push(context as ProgramReference);
      }
      contexts.push( ...ProgVersionner.getSubContexts(context) );
    }
    return Lpgref;
  }

  // _______________________________________________________________________________________________________________________________________
  // Contexts ------------------------------------------------------------------------------------------------------------------------------
  // State contexts ------------------------------------------------------------------------------------------------------------------------
  // _______________________________________________________________________________________________________________________________________
  isContextNestedIn(context: HumanReadableContext, ancestor: HumanReadableStateContext): boolean {
    if (context === ancestor) {
      return true;
    } else {
      const L: HumanReadableContext[] = [];
      if (ancestor.allen) {
        L.push(
          ...(ancestor.allen.During    ? ancestor.allen.During    as HumanReadableContext[]             : []),
          ...(ancestor.allen.StartWith ? ancestor.allen.StartWith as HumanReadableContext[]             : []),
          ...(ancestor.allen.EndWith   ? ancestor.allen.EndWith   as HumanReadableContext[]             : []),
          ...(ancestor.allen.Meet      ? ancestor.allen.Meet.contextsSequence as HumanReadableContext[] : []),
        );
      }
      return L.reduce( (acc, c) => acc || this.isContextNestedIn(context, c as HumanReadableStateContext), false );
    }
  }

  removeContext(context: ContextOrProgram, updateProg = true): {
    old: HumanReadableContext[],
    now: HumanReadableContext[]
  } {
    const path = this.getPathToContext(context);
    return this.updateAncestors(undefined, path, updateProg);
  }

  appendContextOrProgram( conf: {
    context?: ContextOrProgram,
    parent: HumanReadableStateContext,
    via: AllenType,
    after?: ContextOrProgram
  },             updateProg = true ) {
    // Create a new context state and insert it at the right place in parent.
    const {context, parent, via} = conf;
    const position: number = conf.after ? conf.parent.allen[AllenToString(via)].indexOf(conf.after) + 1 : 0;
    const path = this.getPathToContext(parent);
    const contextToAppend: ContextOrProgram = !!context ? context : {
      contextName: 'new context'
    };
    const newParent: HumanReadableStateContext = {
      ...parent,
      allen: {
        ...parent.allen
      }
    };

    newParent.allen = newParent.allen || {};
    switch (via) {
      case AllenType.During   : newParent.allen.During    = appendContextOrProgram(newParent.allen.During,    contextToAppend, position); break;
      case AllenType.StartWith: newParent.allen.StartWith = appendContextOrProgram(newParent.allen.StartWith, contextToAppend, position); break;
      case AllenType.EndWith  : newParent.allen.EndWith   = appendContextOrProgram(newParent.allen.EndWith,   contextToAppend, position); break;
      case AllenType.Meet     : newParent.allen.Meet = {
        ...newParent.allen.Meet,
        contextsSequence: appendContextOrProgram(newParent.allen.Meet?.contextsSequence || [], contextToAppend, position) as HumanReadableStateContext[]
      };
                                break;
    }

    this.updateAncestors(newParent, path);
  }

  moveContext( conf: {
    context: ContextOrProgram,
    to: {
      parent: HumanReadableStateContext,
      via: AllenType,
      after?: ContextOrProgram
    }
  }) {
    // Remove context without updateing program then append it to its new parent
    const {old, now} = this.removeContext(conf.context, false);
    // In case we move to an ancestor, the ancestor reference has been changed by the deletion so we need to update it.
    const i = old.indexOf(conf.to.parent);
    if (i >= 0) {
      conf.to.parent = now[i] as HumanReadableStateContext;
    }
    this.appendContextOrProgram({...conf.to, context: conf.context} );
  }

  updateContext(prev: HumanReadableContext, next: HumanReadableContext) {
    const path = this.getPathToContext(prev);
    return this.updateAncestors(next as HumanReadableStateContext, path);
  }

  updateProrgamReference(prev: ProgramReference, next: ProgramReference) {
    const path = this.getPathToContext(prev);
    return this.updateAncestors(next, path);
  }

  // _______________________________________________________________________________________________________________________________________
  // Expressions / Actions -----------------------------------------------------------------------------------------------------------------
  // _______________________________________________________________________________________________________________________________________
  appendEventActionOnStateContext( context: HumanReadableStateContext,
                                   action: HumanReadableEventAction,
                                   pos: 'actionsOnStart' | 'actionsOnEnd') {
    const path = this.getPathToContext(context);
    const newContext = {
      ...context,
      actionsOnStart: context.actionsOnStart ? context.actionsOnStart.slice() : [],
      actionsOnEnd:   context.actionsOnEnd   ? context.actionsOnEnd  .slice() : []
    };
    switch (pos) {
      case 'actionsOnStart':
        newContext.actionsOnStart.push( action );
        break;
      case 'actionsOnEnd':
        newContext.actionsOnEnd  .push( action );
    }
    this.updateAncestors(newContext, path);
  }

  appendStateAction(context: HumanReadableStateContext, action?: HumanReadableStateAction) {
    const path = this.getPathToContext(context);
    context.actions = context.actions || [];
    this.updateAncestors({
      ...context,
      actions: [
        ...context.actions,
        action ? action : {channel: '', affectation: {value: ''}}
      ]
    } as HumanReadableStateContext, path);
  }

  appendEventAction(context: HumanReadableEventContext, action?: HumanReadableEventAction) {
    const path = this.getPathToContext(context);
    context.actions = context.actions || [];
    this.updateEventeContextAncestors({
      ...context,
      actions: [
        ...context.actions,
        action ? action : {channel: '', affectation: '0'}
      ]
    } as HumanReadableEventContext, path);
  }

  removeEventAction(action: HumanReadableEventAction) {
    const AP = this.getActionPathToAction(action);
    const context = AP.path.pop().from;
    const cs = context as HumanReadableStateContext;
    if (cs.state) {
      const newCs = {...cs};
      cs.actionsOnStart = cs.actionsOnStart || [];
      cs.actionsOnEnd   = cs.actionsOnEnd   || [];
      this.updateAncestors({
        ...context,
        actionsOnStart: cs.actionsOnStart.filter(a => a !== action ),
        actionsOnEnd:   cs.actionsOnEnd  .filter(a => a !== action )
      } as HumanReadableStateContext, AP.path );
    } else {
      this.updateEventeContextAncestors({
        ...context,
        actions: (context as HumanReadableEventContext).actions.filter(a => a !== action )
      } as HumanReadableEventContext, AP.path );
    }
  }

  removeStateAction(action: HumanReadableStateAction) {
    const AP = this.getActionPathToStateAction(action);
    const context = AP.path.pop().from;
    this.updateAncestors({
      ...context,
      actions: (context as HumanReadableStateContext).actions.filter(a => a !== action )
    } as HumanReadableStateContext, AP.path );
  }

  updateStateAction(action: HumanReadableStateAction, newAction: HumanReadableStateAction) {
    const AP = this.getActionPathToStateAction(action);
    const context = AP.path.pop().from;
    this.updateAncestors({
      ...context,
      actions: (context as HumanReadableStateContext).actions.map(a => a !== action ? a : newAction )
    } as HumanReadableStateContext, AP.path );
  }

  updateStateActionChannel(action: HumanReadableStateAction, newChannel: string) {
    this.updateStateAction(action, {...action, channel: newChannel});
  }

  updateStateActionAffectationType(action: HumanReadableStateAction, type: 'expression' | 'constraint') {
    this.updateStateAction(action, {...action, affectation: {...action.affectation, type} });
  }

  parseExpression(expr: string): {success?: MathNode, error?: string} {
    try {
      return {success: mathjs.parse(expr)};
    } catch (err) {
      return {error: err};
    }
  }

  convertExpressionToNodes(expr: string, acceptEvent: boolean, ...vocabulary: VariableDescription[]): ParsedExprNode[] {
    return convertExpressionToNodes(this.getCurrent(), expr, acceptEvent, ...vocabulary);
  }

  convertExpressionToHTML(expr: MathNode | string): string {
    let node: MathNode;
    let err: string;
    if (typeof expr === 'string') {
      const res = this.parseExpression(expr);
      node = res.success;
      err = res.error;
    } else {
      node = expr;
    }
    // console.log(node);
    return node ? this.mathNodeToHTML(node) : `
      <label class="error tooltip">${expr}<label class="tooltiptext">(${err})</label></label>`;
  }

  updateStateInContext(context: HumanReadableStateContext, value: string) {
    const path = this.getPathToContext(context);
    console.log('Change state in', path, 'to', value);
    this.updateAncestors({
      ...context,
      state: value
    } as HumanReadableStateContext, path);
  }

  /*updateEventAction(previous: HumanReadableEventChannelAction, updated: HumanReadableEventChannelAction) {
    const LP = this.asActionsAndPaths();

    // Find the ActionAndPath that is about this affectation
    const AP = LP.find( ap => ap.action === previous );

    const PS = AP.path.pop() as PathStep;
    const from = PS.from as HumanReadableEventContext;
    const newContext = {...from, actions: (from.actions as HumanReadableEventChannelAction[]).map(
        a => a === previous ? updated : a
      ) } as HumanReadableEventContext;

    // Update ancestors
    this.updateEventeContextAncestors(newContext, AP.path); // XXX
  }*/

  updateAffectation(affectation: Affectation, value: string) {
    const LP = this.asActionsAndPaths();

    // Find the ActionAndPath that is about this affectation
    const AP = LP.find( ap => {
      const action = ap.action as HumanReadableStateAction;
      return action ? action.affectation === affectation : false;
    } );

    // Change action
    const PS = AP.path.pop() as PathStep;
    const from = PS.from as HumanReadableStateContext;
    const newContext: HumanReadableStateContext = {...from, actions: (from.actions as HumanReadableStateAction[]).map(
        a => a.affectation === affectation ? {...a, affectation: {...a.affectation, value}} : a
      ) };

    // Update ancestors
    this.updateAncestors(newContext, AP.path);
  }

  private getActionPathToAction(action: HumanReadableAction): ActionAndPath {
    const LP = this.asActionsAndPaths();

    // Find the ActionAndPath that is about this affectation
    return LP.find( ap => ap.action === action );
  }

  private getActionPathToStateAction(action: HumanReadableStateAction): ActionAndPath {
    const LP = this.asActionsAndPaths();

    // Find the ActionAndPath that is about this affectation
    return LP.find( ap => ap.action === action );
  }

  getPathToContext(context: ContextOrProgram): PathStep[] {
    const LP = this.asActionsAndPaths();

    // Find one ActionAndPath that is about this context
    const AP: ActionAndPath = LP.find( ap => !!ap.path.find( step => step.to === context ) );

    if (!!AP) {
      const {path} = AP.path.reduce(
        (acc, step) => {
          if (acc.found) {
            return acc;
          } else {
            acc.found = step.to === context;
            return {
              ...acc,
              path: [...acc.path, step]
            };
          }
        },
        {found: false, path: [] as PathStep[]}
      );
      return path;
    } else {
      return [];
    }
  }

  private asActionsAndPaths(): ActionAndPath[] {
    const prog = this.getCurrent();
    return this.getActionsAndPathRec({
      actions: prog.actions,
      contextName: 'programRoot',
      allen: prog.allen
    } );
  }

  private updateEventeContextAncestors(newContext: HumanReadableEventContext, path: PathStep[]) {
    this.updateAncestors(newContext as any as HumanReadableStateContext, path);
  }

  private updateAncestors( newContext: ContextOrProgram // HumanReadableStateContext
    ,                      path: PathStep[]
    ,                      updateProg = true): { old: HumanReadableContext[]
    , now: HumanReadableContext[]
  } {
    const prog = this.getCurrent();
    let step: PathStep;
    const old: HumanReadableContext[] = [];
    const now: HumanReadableContext[] = [];
    // tslint:disable-next-line:no-conditional-assignment
    while ( step = path.pop() ) {
      // console.log("\tstep", step);
      let viaStr;
      let Lcontexts;
      const from = step.from as HumanReadableStateContext;
      switch (step.via) {
        case AllenType.EndWith  : viaStr = 'EndWith'  ; Lcontexts = from.allen.EndWith   ; break;
        case AllenType.StartWith: viaStr = 'StartWith'; Lcontexts = from.allen.StartWith ; break;
        case AllenType.Meet     : viaStr = 'Meet'     ; Lcontexts = from.allen.Meet      ; break;
        case AllenType.During   : viaStr = 'During'   ; Lcontexts = from.allen.During    ; break;
      }
      const tmp = {...from} as HumanReadableStateContext;
      tmp.allen[viaStr] = Lcontexts.map( c => c !== step.to ? c : newContext).filter( c => !!c );
      // Go next
      newContext = tmp as HumanReadableStateContext;
      old.push(from);
      now.push(newContext);
    }

    // Update program
    if (updateProg) {
      const newProg = {...prog, ...(newContext as HumanReadableStateContext)};
      this.updateWith(newProg);
    }

    // console.log(old, now);
    return {old, now};
  }

  private getActionsAndPathRec(cp: ContextOrProgram): ActionAndPath[] {
    const contextState = cp as HumanReadableStateContext;
    const LE: ActionAndPath[] = this.appendActionsAndPathRec(contextState, AllenType.Meet      );
    const LS: ActionAndPath[] = this.appendActionsAndPathRec(contextState, AllenType.During    );
    const LD: ActionAndPath[] = this.appendActionsAndPathRec(contextState, AllenType.StartWith );
    const LM: ActionAndPath[] = this.appendActionsAndPathRec(contextState, AllenType.EndWith   );
    const LAW: ActionAndPath[] = ((contextState.actions || []) as HumanReadableAction[]).map( action => ({
      action,
      in: actionPlace.While,
      path: [{from: contextState}]
    }) );
    if (LAW.length === 0) { LAW.push({
      action: undefined,
      in: actionPlace.While,
      path: [{from: cp}]
    });
    } // In case there is no leaf action...
    // const cs = context as HumanReadableStateContext;
    const LAS: ActionAndPath[] = ((contextState.actionsOnStart || []) as HumanReadableAction[]).map( action => ({
      action,
      in: actionPlace.Start,
      path: [{from: cp}]
    }) );
    const LAF: ActionAndPath[] = ((contextState.actionsOnEnd || []) as HumanReadableAction[]).map( action => ({
      action,
      in: actionPlace.Finish,
      path: [{from: cp}]
    }) );

    // const contextState = context as HumanReadableStateContext;
    return [...LAW, ...LAS, ...LAF, ...LE, ...LS, ...LD, ...LM];
  }

  private appendActionsAndPathRec(from: HumanReadableStateContext, via: AllenType): ActionAndPath[] {
    const paths: PathStep[] = [];

    if (from.allen) {
      if (from.allen.EndWith && via === AllenType.EndWith) {
        paths.push( ...from.allen.EndWith.map(context => ({from, to: context as HumanReadableContext, via: AllenType.EndWith}) ));
      }
      if (from.allen.StartWith && via === AllenType.StartWith) {
        paths.push( ...from.allen.StartWith.map(context => ({from, to: context as HumanReadableContext, via: AllenType.StartWith}) ));
      }
      if (from.allen.During && via === AllenType.During) {
        paths.push( ...from.allen.During.map(context => ({from, to: context as HumanReadableContext, via: AllenType.During}) ));
      }
      if (from.allen.Meet && via === AllenType.Meet) {
        paths.push( ...from.allen.Meet.contextsSequence.map(context => ({
          from,
          to: context as HumanReadableContext,
          via: AllenType.Meet})
        ));
      }
    }

    const LL: ActionAndPath[][] = paths.map(step => {
      return this.getActionsAndPathRec(step.to).map(AP => {
        AP.path = [step, ...AP.path];
        return AP;
      });
    } );

    return LL.reduce( (acc, L) => [...acc, ...L] , [] as ActionAndPath[] );
  }

  private getChannelFromName(name: string): VariableDescription | undefined {
    return this.getChannels().find(c => c.name === name);
  }

  private getEmitterFromName(name: string): VariableDescription | undefined {
    return this.getEmitters().find(c => c.name === name);
  }

  private getEventFromName(name: string): VariableDescription | undefined {
    return this.getEvents().find(c => c.name === name);
  }

  private mathNodeToHTML(node: MathNode): string {
    if (node.isConstantNode) {
      let txt: string;
      if (typeof node.value === 'string') {
        txt = `"${node.value}"`;
      } else {
        txt = node.value !== undefined && node.value.toString ? node.value.toString() : '';
      }
      return txt !== '' ? `<label class="constant">${txt}</label>` : `<label class="error tooltip">
        EXPRESSION EXPECTED
        <label class="tooltiptext">Empty expression are not allowed.</label>
      </label>`;
    }
    if (node.isOperatorNode) {
      const LA: string[] = node.args.map( n => this.mathNodeToHTML(n) );
      if (LA.length === 1) {
        return `${node.op} ${LA[0]}`;
      } else {
        return LA.join( ` ${node.op}` );
      }
    }
    if (node.isSymbolNode) {
      // Channel, emitter, other program, ... ? Is it present in the program ?
      if (this.isNamedUsed( node.name )) {
        return `<label>${node.name}</label>`;
      } else {
        return `<label class="error tooltip">${node.name}<label class="tooltiptext">Unknown symbol</label></label>`;
      }
    }
    if ((node as any).isAccessorNode) {
      const obj = this.mathNodeToHTML( (node as any).object );
      return `${obj}.<label class="accessor">${node.name}</label>`;
    }
    if ( (node as any).isFunctionNode) {
      const LA: string[] = node.args.map( n => this.mathNodeToHTML(n) );
      const strArgs = LA.join(', ');
      return `<label class="function">${node.name}</label>( ${strArgs} )`;
    }
    if (node.isBlockNode) {
      const blocks = (node as any).blocks as MathNode[];
      return blocks.map( b => this.mathNodeToHTML((b as any).node) ).join(' ; ');
    }

    console.error('unknown node', node);
    return node.name;
  }

}

type HumanReadableAction = HumanReadableStateAction | HumanReadableEventAction;

export enum actionPlace {
  While,
  Start,
  Finish
}
export interface ActionAndPath {
  action: HumanReadableAction;
  in: actionPlace;
  path: PathStep[];
}

export interface PathStep {
  from: HumanReadableContext | ProgramReference;
  to?: HumanReadableContext | ProgramReference;
  via?: AllenType;
}

function appendContextOrProgram(L: ContextOrProgram[], c: ContextOrProgram, position: number): ContextOrProgram[] {
  const Lres: ContextOrProgram[] = L ? [...L] : [];
  Lres.splice(position, 0, c);
  return Lres;
}

export function stringToAllen(str: string): AllenType {
  switch (str) {
    case 'During':    return AllenType.During;
    case 'StartWith': return AllenType.StartWith;
    case 'EndWith':   return AllenType.EndWith;
    case 'Meet':      return AllenType.Meet;
    default:          throw new Error(`UNKNOWN ALLEN TYPE: ${str}`);
  }
}

export function AllenToString(allen: AllenType): string {
  switch (allen) {
    case AllenType.During   : return 'During';
    case AllenType.StartWith: return 'StartWith';
    case AllenType.EndWith  : return 'EndWith';
    case AllenType.Meet     : return 'Meet';
    default:          throw new Error(`UNKNOWN ALLEN TYPE: ${allen}`);
  }

}

export function isOperatorUnary(n: ParsedExprNode): boolean {
  return n.type.indexOf('MathJS::OperatorNode') !== -1 && n.type.indexOf('unary') !== -1;
}

export function isAttributeAccessor(n: ParsedExprNode): boolean {
  return n.type.indexOf('attribute') !== -1;
}

export function convertExpressionToNodes(
  P: HumanReadableProgram, expr: string, acceptEvent: boolean, ...vocabulary: VariableDescription[]
): ParsedExprNode[] {
  const res = mathjs.parse(expr);
  return res ? mathNodeToArray(P, res, acceptEvent, ...vocabulary) : [];
}

export function mathNodeToArray(
  P: HumanReadableProgram, node: MathNode, acceptEvent, ...vocabulary: VariableDescription[]
): ParsedExprNode[] {
  const L: ParsedExprNode[] = [];
  if (node.isConstantNode) {
    let txt: string;
    if (typeof node.value === 'string') {
      txt = `"${node.value}" `;
    } else {
      txt = node.value !== undefined ? `${node.value.toString()} ` : 'undefined';
    }
    L.push({
      label: txt,
      type: typeof node.value,
      mathNode: node
    });
  }
  if (node.isArrayNode) {
    const items: MathNode[] = (node as any).items;
    const Litems: ParsedExprNode[][] = items.map( item => mathNodeToArray(P, item, acceptEvent, ...vocabulary) );
    L.push(
      {label: '[', type: 'MathJS::OperatorArray open unary', mathNode: node},
      ...Litems.reduce( (acc, LN) => [
        ...acc,
        {label: ', ', type: 'comma', mathNode: node},
        ...LN
      ] ),
      {label: '] ', type: 'MathJS::OperatorArray unary', mathNode: node}
    );
  }
  if (node.isOperatorNode) {
    const LA: ParsedExprNode[][] = node.args.map( n => mathNodeToArray(P, n, acceptEvent, ...vocabulary) );
    if (LA.length === 1) {
      L.push( {label: node.op, type: 'MathJS::OperatorNode unary', mathNode: node}
        , ...LA[0] );
    } else {
      L.push( ...LA.reduce( (acc, e) => [...acc, {label: `${node.op} `, type: 'MathJS::OperatorNode'}, ...e] ) );
    }
  }
  if (node.isParenthesisNode) {
    L.push( {label: '( ', type: 'parenthesis', mathNode: node}
      , ...mathNodeToArray( P, (node as any).content, acceptEvent, ...vocabulary )
      , {label: ') ', type: 'parenthesis', mathNode: node} );
  }
  if (node.isSymbolNode) {
    const name = node.name;
    const used = isNameUsedInProg(name, P);
    if (used) {
      L.push({
        label: `${name} `,
        type: `${used.location.slice(0, -1)} ${used.varRange}` + (!acceptEvent && used.location === 'events' ? 'error' : ''),
        mathNode: node
      });
    } else {
      const voc = vocabulary.find(v => v.name === name);
      if (voc) {
        L.push({label: `${name} `, type: `vocabulary ${voc.type}`});
      } else {
        L.push({label: name, type: 'error unknown', mathNode: node});
      }
    }
  }
  if (node.isAccessorNode) {
    const Latt = (node as any).index.dimensions as MathNode[];
    const Lobj = mathNodeToArray( P, (node as any).object, acceptEvent, ...vocabulary );
    const dotNotation = (node as any).index.dotNotation as boolean;
    Lobj[Lobj.length - 1].label = Lobj[Lobj.length - 1].label.trim();
    L.push(
      ...Lobj,
      ...Latt.reduce( (acc, n) => [
        ...acc,
        {label: dotNotation ? '.' : '[', type: 'attribute', mathNode: node},
        {label: n.value, type: 'attribute accessor'},
        {label: dotNotation ? '' : ']', type: 'attribute', mathNode: node},
      ], [])
    );
    L[L.length - 1].label += ' ';
  }
  if (node.isFunctionNode) {
    const LA: ParsedExprNode[][] = node.args.map( n => mathNodeToArray(P, n, acceptEvent, ...vocabulary) );
    L.push( {label: name, type: 'function', mathNode: node}
      ,  {label: '(', type: 'parenthesis', mathNode: node}
      , ...LA.reduce( (acc, LE) => [...acc, {label: ', ', type: 'comma', mathNode: node}, ...LE] )
      ,  {label: ') ', type: 'parenthesis', mathNode: node}
    );
  }
  if (node.isBlockNode) {
    const blocks = (node as any).blocks as MathNode[];
    const LE = blocks.map( b => mathNodeToArray( P, (b as any).node, acceptEvent, ...vocabulary) );
    L.push( ...LE.reduce( (acc, e) => [...acc, {label: '; ', type: 'MathJS::BlockNode'}, ...e] ) );
  }

  return L;
}
