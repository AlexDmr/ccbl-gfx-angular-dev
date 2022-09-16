/* tslint:disable:member-ordering */
import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {ProgVersionner, stringToAllen, getUID, updateDisplay, getDisplay} from '../ccbl-gfx9.service';
import {
  ContextOrProgram, copyHumanReadableStateContext,
  HumanReadableContext,
  HumanReadableEventAction, HumanReadableEventChannelAction,
  HumanReadableEventContext, HumanReadableProgram,
  HumanReadableStateAction,
  HumanReadableStateContext,
  VariableDescription,
  ProgramReference
} from 'ccbl-js/lib/ProgramObjectInterface';
import {BehaviorSubject, firstValueFrom, Observable, of, Subscription} from 'rxjs';
import {ClipboardService} from '../clipboard.service';
import {MatDialog} from '@angular/material/dialog';
import {
  DataEditionContextState,
  DialogEditContextStateConditionComponent
} from '../dialog-edit-context-state-condition/dialog-edit-context-state-condition.component';
import {AllenType} from 'ccbl-js/lib/AllenInterface';
import {CcblActionStateComponent} from '../ccbl-action-state/ccbl-action-state.component';
import {CcblEventChannelActionComponent} from '../ccbl-event-channel-action/ccbl-event-channel-action.component';
import {DataEditProgramDescr, EditProgramDescrComponent} from '../edit-program-descr/edit-program-descr.component';
import { DialogEditProgInstanceComponent } from '../dialog-edit-prog-instance/dialog-edit-prog-instance.component';
import { DataEditSubProgram } from '../dialog-edit-sub-program/dialog-edit-sub-program.component';
import { SmtService } from '../smt.service';
import { ActionsPath } from '../smt.definitions';
import { map, switchMap } from 'rxjs/operators';
import { ProxyCcblProg } from '../ProxyCcblProg';

@Component({
  selector: 'lib-ccbl-state-context[program-versionner][from][context]',
  templateUrl: './ccbl-state-context.component.html',
  styleUrls: ['./ccbl-state-context.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CcblStateContextComponent implements OnInit {
  currentContext = new BehaviorSubject<HumanReadableStateContext | undefined>(undefined);
  hide = false;
  // private subActive?: Subscription;
  active: Observable<boolean> = of(false); // = new BehaviorSubject<boolean>(false);
  pContext!: HumanReadableStateContext;
  pDndDropZoneAll: string[] = ['HumanReadableStateContext', 'HumanReadableEventContext'];
  @Input() from?: AllenType;
  get context(): HumanReadableStateContext {return this.pContext; }
  @Input() set context(c: HumanReadableStateContext) {
    this.pContext = c;
    if (!!c) {
      c.id = c.id || getUID('SC');
      this.currentIndexInSequence = getDisplay(this.context)?.currentIndexInSequence || 1;
    }
    this.currentContext.next(c);
    // this.subActive?.unsubscribe();
    this.active = this.currentContext.pipe(
      switchMap( ctxt => (ctxt ? this.proxyCcbl.getContextProxy(ctxt)?.pipe(map( up => up.active ) ) : undefined ) ?? of(false) )
    )
  }
  // tslint:disable-next-line:no-input-rename
  @Input('program-versionner') progVersionner!: ProgVersionner;
  @Input() isProgramRoot = false;

  private pCurrentIndexInSequence = 1;
  private pCurrentContext?: HumanReadableStateContext;
  private subjAP = new BehaviorSubject<ActionsPath | undefined>( undefined );
  canBeTrue: Observable<boolean> = this.subjAP.pipe(
    map( AP => !AP || AP.canBeTrue.length > 0 )
  );


  // Statics
  static async staticEditProgram(dialog: MatDialog, data: DataEditProgramDescr): Promise<HumanReadableProgram | undefined> {
    const dialogRef = dialog.open<EditProgramDescrComponent, any, HumanReadableProgram>(EditProgramDescrComponent, {
      data,
      closeOnNavigation: false,
      width: '100%',
      height: '100%',
      maxWidth: '100vw !important'
    });
    return firstValueFrom( dialogRef.afterClosed() );
  }

  static async staticEditCondition(dialog: MatDialog, data: DataEditionContextState): Promise<HumanReadableStateContext | undefined> {
    const dialogRef = dialog.open<DialogEditContextStateConditionComponent, DataEditionContextState, HumanReadableStateContext>(
      DialogEditContextStateConditionComponent, {
      data,
      closeOnNavigation: false
    });
    return firstValueFrom( dialogRef.afterClosed() );
  }


  // Constructor
  constructor(
    private clipboard: ClipboardService,
    private dialog: MatDialog,
    private smtService: SmtService,
    private proxyCcbl: ProxyCcblProg
  ) {
    this.currentContext.subscribe( c => this.pCurrentContext = c);
  }

  ngOnInit() {
    this.currentIndexInSequence = getDisplay(this.context)?.currentIndexInSequence || 1;
    console.log('Ready for', this.context?.id);
    this.smtService.obsProgEval.subscribe( conf => {
      const id = this.isProgramRoot ? 'root' : this.context?.id;
      const AP = conf.LAP.find(ap => ap.context.id === id);
      // console.log('AP =', AP);
      this.subjAP.next( AP );
    });
  }

  programVerification(): void {
    this.smtService.evalProgram( this.progVersionner!.getCurrent() );
  }

  get program(): HumanReadableProgram {
    return this.progVersionner!.getCurrent();
  }

  get hasSubProg(): boolean {
    return !!this.program.subPrograms && Object.keys(this.program.subPrograms).length > 0;
  }

  get hasNoCondition(): boolean {
    return !this.isProgramRoot && !this.pCurrentContext!.eventStart && !this.pCurrentContext!.eventFinish && !this.pCurrentContext!.state;
  }

  async editProgram() {
    const data: DataEditProgramDescr = {
      program: this.programVersionner!.getCurrent(),
      // progV: this.programVersionner
    };
    const P: HumanReadableProgram | undefined = await CcblStateContextComponent.staticEditProgram(this.dialog, data);
    if (P) {
      this.progVersionner!.updateWith(P);
    }
  }

  async editCondition(context?: HumanReadableStateContext): Promise<void> {
    context = context ?? this.pCurrentContext!;
    const data: DataEditionContextState = {
      context,
      progV: this.progVersionner!,
      from: this.from!
    };
    const newSC = await CcblStateContextComponent.staticEditCondition(this.dialog, data);
    if (newSC) {
      this.progVersionner!.updateContext(context, newSC);
    }
  }

  get dndDropZoneAll(): string[] {
    return this.hide ? [] : this.pDndDropZoneAll;
  }

  get displayState(): boolean {
    const C = this.pCurrentContext!;
    return !!C.state || (C.eventStart === undefined && C.eventFinish === undefined);
  }

  get channels(): VariableDescription[] {
    return this.progVersionner!.getChannels();
  }

  get programVersionner() {
    return this.progVersionner;
  }

  get AllenTypeStartWith(): AllenType {
    return AllenType.StartWith;
  }

  get AllenTypeEndWith(): AllenType {
    return AllenType.EndWith;
  }

  get AllenTypeMeet(): AllenType {
    return AllenType.Meet;
  }

  get AllenTypeDuring(): AllenType {
    return AllenType.During;
  }

  get AllenTypeAfter(): AllenType {
    return AllenType.After;
  }

  get actions(): HumanReadableStateAction[] {
    return this.pCurrentContext?.actions ?? [];
  }

  get startActions(): HumanReadableEventAction[] {
    return this.pCurrentContext?.actionsOnStart ?? [];
  }

  get finishActions(): HumanReadableEventAction[] {
    return this.pCurrentContext?.actionsOnEnd ?? [];
  }

  asHumanReadableEventChannelAction(action: HumanReadableEventAction): HumanReadableEventChannelAction {
    return action as HumanReadableEventChannelAction;
  }

  asHumanReadableStateContext(c: ContextOrProgram): HumanReadableStateContext {
    return c as HumanReadableStateContext;
  }

  getDuringContexts(): ContextOrProgram[] {
    return this.pCurrentContext?.allen?.During ?? [];
  }

  getStartWithContexts(): ContextOrProgram[] {
    return this.pCurrentContext?.allen?.StartWith ?? [];
  }

  getEndWithContexts(): ContextOrProgram[] {
    return this.pCurrentContext?.allen?.EndWith ?? [];
  }

  updateLabel(label: string) {
    this.programVersionner!.updateContext(this.pCurrentContext!, {
      ...this.pCurrentContext!,
      contextName: label
    });
  }

  updateState(expr: string) {
    this.progVersionner!.updateStateInContext(this.pCurrentContext!, expr);
  }

  startDragging() {
    this.progVersionner!.draggedContext = this.pCurrentContext;
    this.hide = true;
  }

  stopDragging() {
    this.progVersionner!.draggedContext = undefined;
    this.hide = false;
  }

  cut() {
    this.clipboard.cut(this.progVersionner!, this.pCurrentContext!);
  }

  copy() {
    this.clipboard.copy(this.progVersionner!, this.pCurrentContext!);
  }

  get canPaste(): boolean {
    return this.clipboard.canPaste;
  }

  paste() {
    this.clipboard.paste(this.progVersionner!, this.pCurrentContext!);
  }

  deleteContext() {
    this.progVersionner!.removeContext(this.pCurrentContext!);
  }

  newContext(allen: string, contextType: 'STATE' | 'EVENT') {
    switch (contextType) {
      case 'EVENT': return this.appendEventContext( {} );
      case 'STATE': return this.appendStateContext( {allen} );
    }
  }

  log(...L: unknown[]) {
    console.log(...L);
  }

  get draggedContext(): ContextOrProgram {
    return this.progVersionner!.draggedContext!;
  }

  appendContext(allen: string, context: ContextOrProgram, after?: ContextOrProgram) {
    // console.log('Append context', allen, context, after);
    this.progVersionner!.moveContext({
      context,
      to: {
        parent: this.context!,
        via: stringToAllen(allen),
        after
      }
    });
  }

  canDrop = (context: HumanReadableContext): boolean => {
    // Can drop if it is a context AND this state is not part of subcontexts
    if (context && context.contextName) {
      return !this.progVersionner!.isContextNestedIn(this.pCurrentContext!, context as HumanReadableStateContext);
    }
    return false;
  }

  moveContextInSequence(i: number, cop: ContextOrProgram): void {
    const C = cop as HumanReadableStateContext;
    const {now: LcontextWithoutC, old} = this.progVersionner!.removeContext(C, false);
    const posOld = old.findIndex(c => c === this.context);
    let parentContext = this.context;
    if (posOld >= 0) {
      parentContext = LcontextWithoutC[posOld] as HumanReadableStateContext;
    }
    const contextWithoutC = LcontextWithoutC[LcontextWithoutC.length - 1];
    if (i === 1) {
      // Replace root context with the new one, copy the sequence in the new one
      // Insert previous root context as first child of the sequence
      const newParent = copyHumanReadableStateContext(C);
      newParent.allen = newParent.allen || {};
      const M = newParent.allen.Meet = newParent.allen.Meet || {loop: 1, contextsSequence: []};
      M.loop = parentContext!.allen!.Meet!.loop;
      const F = copyHumanReadableStateContext(parentContext!);
      delete F?.allen?.Meet;
      M.contextsSequence = [F, ...newParent.allen.Meet.contextsSequence, ...(parentContext?.allen?.Meet?.contextsSequence ?? [])];
      this.progVersionner!.updateContext(parentContext!, newParent);
    } else {
      // Position in the sequence
      const newC = copyHumanReadableStateContext(parentContext as HumanReadableStateContext);
      newC.allen!.Meet!.contextsSequence.splice(i - 2, 0, C);
      this.progVersionner!.updateContext(parentContext!, newC);
    }
  }

  loopOnSelf() {
    const newC = copyHumanReadableStateContext(this.context!);
    newC.allen = newC.allen || {};
    newC.allen.Meet = {
      loop: 0,
      contextsSequence: []
    };
    this.progVersionner!.updateContext(this.context!, newC);
  }

  async appendStateContext(conf: {allen: string, after?: HumanReadableContext}) {
    let C: HumanReadableStateContext;
    let lastSubContext: ContextOrProgram;
    if (conf.allen === 'Meet') {
      C = this.context!;
      const LC: ContextOrProgram[] = C.allen?.Meet?.contextsSequence || [];
      lastSubContext = LC[LC.length - 1];
    } else {
      C = this.pCurrentContext!;
      const LC: ContextOrProgram[] = (C.allen && (C.allen as any)[conf.allen]) ? (C.allen as any)[conf.allen] : [];
      lastSubContext = LC[LC.length - 1];
    }
    const newContext = await CcblStateContextComponent.staticEditCondition(this.dialog, {
      context: {contextName: 'C', state: '', type: 'STATE'},
      progV: this.progVersionner!,
      from: undefined as any
    });
    this.progVersionner!.appendContextOrProgram({
      context: newContext,
      parent: C,
      via: stringToAllen(conf.allen),
      after: conf.after || lastSubContext
    });
  }

  appendEventContext(conf: {after?: HumanReadableContext}) {
    const LC: ContextOrProgram[] = this.pCurrentContext!.allen!.During ?? [];
    const lastSubContext = LC[LC.length - 1];
    const events = this.progVersionner!.getEvents();
    let context: HumanReadableEventContext;
    if (events.length) {
      context = {
          contextName: 'new event context',
          eventSource: events[0].name,
          type: 'EVENT',
          actions: []
        };
    } else {
      context = {
        contextName: 'new event context',
        eventSource: '',
        type: "EVENT",
        eventExpression: 'true',
        actions: []
      };
    }
    this.progVersionner!.appendContextOrProgram( {
      context,
      parent: this.pCurrentContext!,
      via: AllenType.During,
      after: conf.after || lastSubContext
    } );
  }

  isThereEvents(): boolean {
    return this.progVersionner!.getEvents().length > 0;
  }

  getAvailableChannels(): VariableDescription[] {
    let L = this.progVersionner!.getChannels();
    if (this.pCurrentContext?.actions) {
      L = L.filter(c => !this.pCurrentContext!.actions!.find((a: HumanReadableStateAction) => a.channel === c.name));
    }
    const LC = L.sort((v1, v2) => v1.name.toLowerCase() > v2.name.toLowerCase() ? 1 : -1);
    return LC;
  }

  async newStateAction() {
    const channel = this.getAvailableChannels()[0];
    const action: HumanReadableStateAction = {
      channel: channel.name,
      affectation: {type: 'expression', value: 'undefined'}
    };
    const A = await CcblActionStateComponent.staticEdit(this.dialog, {
      action,
      program: this.program,
      context: this.pCurrentContext!
    });
    if (A) {
      const newContext = copyHumanReadableStateContext(this.pCurrentContext!);
      newContext.actions = newContext.actions ? [...newContext.actions, A] : [A];
      this.programVersionner!.updateContext(this.pCurrentContext!, newContext);
    }
  }

  async newEventAction(position: 'start' | 'finish') {
    const channel = this.programVersionner!.getChannels()[0];
    const action: HumanReadableEventChannelAction = {
      channel: channel.name,
      affectation: '0'
    };
    const newAction: HumanReadableEventAction = await CcblEventChannelActionComponent.staticEditAction(this.dialog, {
      action,
      progVersionner: this.programVersionner!
    });
    if (newAction) {
      const newContext = copyHumanReadableStateContext(this.pCurrentContext!);
      if (position === 'start') {
        newContext.actionsOnStart = newContext.actionsOnStart ? [...newContext.actionsOnStart, newAction] : [newAction];
      } else {
        newContext.actionsOnEnd = newContext.actionsOnEnd ? [...newContext.actionsOnEnd, newAction] : [newAction];
      }
      this.programVersionner!.updateContext(this.pCurrentContext!, newContext);
    }
  }

  appendAction(channel: VariableDescription, contextType: 'EVENT' | 'STATE', position: 'start' | 'finish') {
    switch (contextType) {
      case 'STATE': return this.appendStatedAction(channel);
      case 'EVENT': return this.appendEventAction(channel, position);
    }
  }

  appendStatedAction(vd: VariableDescription) {
    this.progVersionner!.appendStateAction(this.pCurrentContext!, {channel: vd.name, affectation: {value: ''}});
  }

  appendEventAction(vd: VariableDescription, pos: 'start' | 'finish') {
    this.progVersionner!.appendEventActionOnStateContext(
      this.pCurrentContext!, {
        channel: vd.name,
        affectation: 'undefined'
      },
      pos === 'start' ? 'actionsOnStart' : 'actionsOnEnd'
    );
  }

  updateStateAction(oldA: HumanReadableStateAction, newA: HumanReadableStateAction): void {
    this.programVersionner!.updateStateAction(oldA, newA);
  }

  appendProgramReference(conf: {allen: string, after?: HumanReadableContext}) {
    console.error('appendProgramReference NOT YET IMPLEMENTED');
  }

  async editChannelAction(action: HumanReadableEventChannelAction, start: boolean): Promise<void> {
    const newA = await CcblEventChannelActionComponent.staticEditAction(this.dialog, {
      action, progVersionner: this.progVersionner!
    });
    if (newA) {
      const newContext = copyHumanReadableStateContext(this.pCurrentContext!);
      if (start) {
        newContext.actionsOnStart = (this.pCurrentContext?.actionsOnStart ?? []).map( a => a === action ? newA : a);
      } else {
        newContext.actionsOnEnd   = (this.pCurrentContext?.actionsOnEnd   ?? []).map( a => a === action ? newA : a);
      }
      this.programVersionner!.updateContext(this.pCurrentContext!, newContext);
    }
  }

  deleteChannelAction(action: HumanReadableEventChannelAction): void {
    const newContext = copyHumanReadableStateContext(this.pCurrentContext!);
    newContext.actionsOnStart = (this.pCurrentContext?.actionsOnStart ?? []).filter( a => a !== action );
    newContext.actionsOnEnd   = (this.pCurrentContext?.actionsOnEnd   ?? []).filter( a => a !== action );
    this.programVersionner!.updateContext(this.pCurrentContext!, newContext);
  }

  async newProgInstance() {
    const data: DataEditSubProgram = {
      parentProgram: this.program,
      program: {}
    };
    const dialogRef = this.dialog.open(DialogEditProgInstanceComponent, {
      data,
      closeOnNavigation: false
    });
    const refP: ProgramReference = await firstValueFrom( dialogRef.afterClosed() );
    if (refP) {
      const L = this.pCurrentContext?.allen?.During ?? [];
      this.progVersionner!.appendContextOrProgram({
        context: refP,
        parent: this.pCurrentContext!,
        via: AllenType.During,
        after: L[L.length-1]
      });
    }
  }

  // Managing sequence
  get startSequence(): boolean {
    return this.context?.allen?.Meet?.contextsSequence !== undefined;
  }

  get contextSequenceRest(): ContextOrProgram[] {
    return this.context?.allen?.Meet?.contextsSequence ?? [];
  }

  get loopAt(): number | undefined {
    return this.context?.allen?.Meet?.loop;
  }

  set loopAt(v: number | undefined) {
    const cp = copyHumanReadableStateContext(this.context!);
    cp.allen = cp.allen || {};
    cp.allen.Meet = cp.allen.Meet || {contextsSequence: []};
    cp.allen.Meet.loop = v !== undefined ? Math.min(v, 1 + cp.allen.Meet.contextsSequence.length) : undefined;
    this.progVersionner!.updateContext(this.context!, cp);
  }

  get currentIndexInSequence(): number {
    return this.pCurrentIndexInSequence;
  }

  set currentIndexInSequence(i: number) {
    this.pCurrentIndexInSequence = i;
    // XXX à revoir sans les id ... ? updateDisplay(this.context as {id: string}, {currentIndexInSequence: i});
    if (this.context?.allen?.Meet?.contextsSequence) {
      this.currentContext.next( i === 1 ? this.context : this.context.allen.Meet.contextsSequence[i-2] );
    }
  }

  get genLoop(): Generator<number, void, void> {
    const context = this.context;
    function* gen(N: number) {
      for (let i = 0; i < N; i++) {
        yield i;
      }
    }
    const nb = this.context?.allen?.Meet?.contextsSequence?.length ?? 0;
    return gen(nb + 1);
  }
}


