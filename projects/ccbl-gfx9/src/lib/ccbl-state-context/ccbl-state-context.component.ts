import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {ProgVersionner, stringToAllen, CcblGfx9Service} from '../ccbl-gfx9.service';
import {
  ContextOrProgram, copyHumanReadableEventContext, copyHumanReadableStateContext,
  HumanReadableContext,
  HumanReadableEventAction, HumanReadableEventChannelAction,
  HumanReadableEventContext, HumanReadableProgram,
  HumanReadableStateAction,
  HumanReadableStateContext,
  VariableDescription,
  ProgramReference
} from 'ccbl-js/lib/ProgramObjectInterface';
import {BehaviorSubject} from 'rxjs';
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

@Component({
  selector: 'lib-ccbl-state-context',
  templateUrl: './ccbl-state-context.component.html',
  styleUrls: ['./ccbl-state-context.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CcblStateContextComponent implements OnInit {
  currentContext = new BehaviorSubject<HumanReadableStateContext>(undefined);
  hide = false;
  active = new BehaviorSubject<boolean>(false);
  pContext: HumanReadableStateContext;
  pDndDropZoneAll: string[] = ['HumanReadableStateContext', 'HumanReadableEventContext'];
  @Input() from: AllenType;
  get context(): HumanReadableStateContext {return this.pContext; }
  @Input() set context(c: HumanReadableStateContext) {
    // console.log('Contexte', c);
    if (this.pContext && this.pContext.ccblContext && this.pContext.ccblContext.onActiveUpdated) {
      this.pContext.ccblContext.offActiveUpdated( this.cbCCBL );
    }
    this.pContext = c;
    if (c && c.ccblContext && c.ccblContext.onActiveUpdated) {
      // console.log(`On s'abonne !`);
      c.ccblContext.onActiveUpdated( this.cbCCBL );
      this.cbCCBL( c.ccblContext.getActive() );
    }
    this.currentContext.next(c);
  }
  @Input('program-versionner') private progVersionner: ProgVersionner;
  @Input() isProgramRoot = false;
  static async staticEditProgram(dialog: MatDialog, data: DataEditProgramDescr): Promise<HumanReadableProgram | undefined> {
    const dialogRef = dialog.open<EditProgramDescrComponent, any, HumanReadableProgram>(EditProgramDescrComponent, {
      data,
      closeOnNavigation: false,
      width: '100%',
      height: '100%',
      maxWidth: '100vw !important'
    });
    return dialogRef.afterClosed().toPromise();
  }
  cbCCBL = a => {
    this.active.next(a);
  }
  private pCurrentIndexInSequence = 1;
  private pCurrentContext: HumanReadableStateContext;

  constructor(
    private clipboard: ClipboardService,
    private dialog: MatDialog
  ) {
    this.currentContext.subscribe( c => this.pCurrentContext = c);
  }

  ngOnInit() {
  }

  get program(): HumanReadableProgram {
    return this.progVersionner.getCurrent();
  }

  get hasSubProg(): boolean {
    return !!this.program.subPrograms && Object.keys(this.program.subPrograms).length > 0;
  }

  get hasNoCondition(): boolean {
    return !this.isProgramRoot && !this.pCurrentContext.eventStart && !this.pCurrentContext.eventFinish && !this.pCurrentContext.state;
  }

  async editProgram() {
    const data: DataEditProgramDescr = {
      program: this.programVersionner.getCurrent(),
      // progV: this.programVersionner
    };
    const P: HumanReadableProgram = await CcblStateContextComponent.staticEditProgram(this.dialog, data);
    if (P) {
      this.progVersionner.updateWith(P);
    }
  }

  async editCondition(context?: HumanReadableStateContext) {
    context = context || this.pCurrentContext;
    const data: DataEditionContextState = {
      context,
      progV: this.progVersionner,
      from: this.from
    };
    const dialogRef = this.dialog.open(DialogEditContextStateConditionComponent, {
      data,
      disableClose: true
    });
    const newState: HumanReadableStateContext = await dialogRef.afterClosed().toPromise();
    if (newState) {
      this.progVersionner.updateContext(context, newState);
    }
  }

  get dndDropZoneAll(): string[] {
    return this.hide ? [] : this.pDndDropZoneAll;
  }

  get displayState(): boolean {
    return !!this.pCurrentContext.state || (this.pCurrentContext.eventStart === undefined && this.pCurrentContext.eventFinish === undefined);
  }

  get channels(): VariableDescription[] {
    return this.progVersionner.getChannels();
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
    return this.pCurrentContext.actions ? this.pCurrentContext.actions : [];
  }

  get startActions(): HumanReadableEventAction[] {
    return this.pCurrentContext.actionsOnStart ? this.pCurrentContext.actionsOnStart : [];
  }

  get finishActions(): HumanReadableEventAction[] {
    return this.pCurrentContext.actionsOnEnd ? this.pCurrentContext.actionsOnEnd : [];
  }

  asHumanReadableEventChannelAction(action: HumanReadableEventAction): HumanReadableEventChannelAction {
    return action as HumanReadableEventChannelAction;
  }

  asHumanReadableStateContext(c: ContextOrProgram): HumanReadableStateContext {
    return c as HumanReadableStateContext;
  }

  getDuringContexts(): ContextOrProgram[] {
    if (this.pCurrentContext.allen && this.pCurrentContext.allen.During) {
      return this.pCurrentContext.allen.During;
    } else {
      return [];
    }
  }

  getStartWithContexts(): ContextOrProgram[] {
    if (this.pCurrentContext.allen && this.pCurrentContext.allen.StartWith) {
      return this.pCurrentContext.allen.StartWith;
    } else {
      return [];
    }
  }

  getEndWithContexts(): ContextOrProgram[] {
    if (this.pCurrentContext.allen && this.pCurrentContext.allen.EndWith) {
      return this.pCurrentContext.allen.EndWith;
    } else {
      return [];
    }
  }

  updateLabel(label: string) {
    this.programVersionner.updateContext(this.pCurrentContext, {
      ...this.pCurrentContext,
      contextName: label
    });
  }

  updateState(expr: string) {
    this.progVersionner.updateStateInContext(this.pCurrentContext, expr);
  }

  startDragging() {
    this.progVersionner.draggedContext = this.pCurrentContext;
    this.hide = true;
  }

  stopDragging() {
    this.progVersionner.draggedContext = undefined;
    this.hide = false;
  }

  cut() {
    this.clipboard.cut(this.progVersionner, this.pCurrentContext);
  }

  copy() {
    this.clipboard.copy(this.progVersionner, this.pCurrentContext);
  }

  get canPaste(): boolean {
    return this.clipboard.canPaste;
  }

  paste() {
    this.clipboard.paste(this.progVersionner, this.pCurrentContext);
  }

  deleteContext() {
    this.progVersionner.removeContext(this.pCurrentContext);
  }

  newContext(allen: string, contextType: 'STATE' | 'EVENT') {
    switch (contextType) {
      case 'EVENT': return this.appendEventContext( {allen} );
      case 'STATE': return this.appendStateContext( {allen} );
    }
  }

  log(...L) {
    console.log(...L);
  }

  get draggedContext(): ContextOrProgram {
    return this.progVersionner.draggedContext;
  }

  appendContext(allen: string, context: ContextOrProgram, after?: ContextOrProgram) {
    // console.log('Append context', allen, context, after);
    this.progVersionner.moveContext({
      context,
      to: {
        parent: this.pCurrentContext,
        via: stringToAllen(allen),
        after
      }
    });
  }

  canDrop = (context: HumanReadableContext): boolean => {
    // Can drop if it is a context AND this state is not part of subcontexts
    if (context && context.contextName) {
      return !this.progVersionner.isContextNestedIn(this.pCurrentContext, context as HumanReadableStateContext);
    }
    return false;
  }

  async appendStateContext(conf: {allen: string, after?: HumanReadableContext}) {
    const A = this.pCurrentContext.allen;
    let lastSubContext: ContextOrProgram;
    if (conf.allen === 'Meet') {
      const LC: ContextOrProgram[] = A?.Meet?.contextsSequence || [];
      lastSubContext = LC[LC.length - 1];
    } else {
      const LC: ContextOrProgram[] = A ? A[conf.allen] : [];
      lastSubContext = LC[LC.length - 1];
    }
    const newContext: HumanReadableStateContext = {
      contextName: 'C',
      state: ''
    };
    await this.editCondition(newContext);;
    this.progVersionner.appendContextOrProgram({
      context: newContext,
      parent: this.pCurrentContext,
      via: stringToAllen(conf.allen),
      after: conf.after || lastSubContext
    });
  }

  appendEventContext(conf: {allen: string, after?: HumanReadableContext}) {
    const LC: ContextOrProgram[] = this.pCurrentContext.allen[conf.allen];
    const lastSubContext = LC[LC.length - 1];
    const events = this.progVersionner.getEvents();
    let context: HumanReadableEventContext;
    if (events.length) {
      context = {
          contextName: 'new event context',
          eventSource: events[0].name,
          actions: []
        };
    } else {
      context = {
        contextName: 'new event context',
        eventSource: '',
        eventExpression: 'true',
        actions: []
      };
    }
    this.progVersionner.appendContextOrProgram( {
      context,
      parent: this.pCurrentContext,
      via: stringToAllen(conf.allen),
      after: conf.after || lastSubContext
    } );
  }

  isThereEvents(): boolean {
    return this.progVersionner.getEvents().length > 0;
  }

  getAvailableChannels(): VariableDescription[] {
    let L = this.progVersionner.getChannels();
    if (this.pCurrentContext.actions) {
      L = L.filter(c => !this.pCurrentContext.actions.find((a: HumanReadableStateAction) => a.channel === c.name));
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
    const A: HumanReadableStateAction = await CcblActionStateComponent.staticEdit(this.dialog, {
      action,
      program: this.program,
      context: this.pCurrentContext
    });
    if (A) {
      const newContext = copyHumanReadableStateContext(this.pCurrentContext);
      newContext.actions = newContext.actions ? [...newContext.actions, A] : [A];
      this.programVersionner.updateContext(this.pCurrentContext, newContext);
    }
  }

  async newEventAction(position: 'start' | 'finish') {
    const channel = this.programVersionner.getChannels()[0];
    const action: HumanReadableEventChannelAction = {
      channel: channel.name,
      affectation: '0'
    };
    const newAction: HumanReadableEventAction = await CcblEventChannelActionComponent.staticEditAction(this.dialog, {
      action,
      progVersionner: this.programVersionner
    });
    if (newAction) {
      const newContext = copyHumanReadableStateContext(this.pCurrentContext);
      if (position === 'start') {
        newContext.actionsOnStart = newContext.actionsOnStart ? [...newContext.actionsOnStart, newAction] : [newAction];
      } else {
        newContext.actionsOnEnd = newContext.actionsOnEnd ? [...newContext.actionsOnEnd, newAction] : [newAction];
      }
      this.programVersionner.updateContext(this.pCurrentContext, newContext);
    }
  }

  appendAction(channel: VariableDescription, contextType: 'EVENT' | 'STATE', position: 'start' | 'finish') {
    switch (contextType) {
      case 'STATE': return this.appendStatedAction(channel);
      case 'EVENT': return this.appendEventAction(channel, position);
    }
  }

  appendStatedAction(vd: VariableDescription) {
    this.progVersionner.appendStateAction(this.pCurrentContext, {channel: vd.name, affectation: {value: ''}});
  }

  appendEventAction(vd: VariableDescription, pos: 'start' | 'finish') {
    this.progVersionner.appendEventActionOnStateContext(
      this.pCurrentContext, {
        channel: vd.name,
        affectation: 'undefined'
      },
      pos === 'start' ? 'actionsOnStart' : 'actionsOnEnd'
    );
  }

  updateStateAction(oldA: HumanReadableStateAction, newA: HumanReadableStateAction): void {
    this.programVersionner.updateStateAction(oldA, newA);
  }

  appendProgramReference(conf: {allen: string, after?: HumanReadableContext}) {
    console.error('appendProgramReference NOT YET IMPLEMENTED');
  }

  async editChannelAction(action: HumanReadableEventChannelAction, start: boolean): Promise<void> {
    const newA = await CcblEventChannelActionComponent.staticEditAction(this.dialog, {
      action, progVersionner: this.progVersionner
    });
    if (newA) {
      const newContext = copyHumanReadableStateContext(this.pCurrentContext);
      if (start) {
        newContext.actionsOnStart = this.pCurrentContext.actionsOnStart.map( a => a === action ? newA : a);
      } else {
        newContext.actionsOnEnd   = this.pCurrentContext.actionsOnEnd  .map( a => a === action ? newA : a);
      }
      this.programVersionner.updateContext(this.pCurrentContext, newContext);
    }
  }

  deleteChannelAction(action: HumanReadableEventChannelAction): void {
    const newContext = copyHumanReadableStateContext(this.pCurrentContext);
    newContext.actionsOnStart = this.pCurrentContext.actionsOnStart.filter( a => a !== action );
    newContext.actionsOnEnd   = this.pCurrentContext.actionsOnEnd  .filter( a => a !== action );
    this.programVersionner.updateContext(this.pCurrentContext, newContext);
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
    const refP: ProgramReference = await dialogRef.afterClosed().toPromise();
    if (refP) {
      const L = this.pCurrentContext.allen?.During || [];
      this.progVersionner.appendContextOrProgram({
        context: refP,
        parent: this.pCurrentContext,
        via: AllenType.During,
        after: L[L.length-1]
      });
    }
  }

  // Managing sequence
  get startSequence(): boolean {
    return !! this.context.allen?.Meet;
  }

  get contextSequenceRest(): ContextOrProgram[] {
    return this.context.allen?.Meet?.contextsSequence || [];
  }

  get loopAt(): number {
    return this.context.allen?.Meet?.loop;
  }

  get currentIndexInSequence(): number {
    return this.pCurrentIndexInSequence;
  }

  set currentIndexInSequence(i: number) {
    this.pCurrentIndexInSequence = i;
    this.currentContext.next( i === 1 ? this.context : this.context.allen.Meet.contextsSequence[i-2] );
  }
}
