import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {ProgVersionner, stringToAllen} from '../ccbl-gfx9.service';
import {
  ContextOrProgram, copyHumanReadableStateContext,
  HumanReadableContext,
  HumanReadableEventAction, HumanReadableEventChannelAction,
  HumanReadableEventContext, HumanReadableProgram,
  HumanReadableStateAction,
  HumanReadableStateContext,
  VariableDescription
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

@Component({
  selector: 'lib-ccbl-state-context',
  templateUrl: './ccbl-state-context.component.html',
  styleUrls: ['./ccbl-state-context.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CcblStateContextComponent implements OnInit {
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

  constructor(private clipboard: ClipboardService, private dialog: MatDialog) { }

  ngOnInit() {
  }

  get program(): HumanReadableProgram {
    return this.progVersionner.getCurrent();
  }

  get hasNoCondition(): boolean {
    return !this.isProgramRoot && !this.context.eventStart && !this.context.eventFinish && !this.context.state;
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
    context = context || this.context;
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
    return !!this.context.state || (this.context.eventStart === undefined && this.context.eventFinish === undefined);
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
    return this.context.actions ? this.context.actions : [];
  }

  get startActions(): HumanReadableEventAction[] {
    return this.context.actionsOnStart ? this.context.actionsOnStart : [];
  }

  get finishActions(): HumanReadableEventAction[] {
    return this.context.actionsOnEnd ? this.context.actionsOnEnd : [];
  }

  getDuringContexts(): ContextOrProgram[] {
    if (this.context.allen && this.context.allen.During) {
      return this.context.allen.During;
    } else {
      return [];
    }
  }

  getStartWithContexts(): ContextOrProgram[] {
    if (this.context.allen && this.context.allen.StartWith) {
      return this.context.allen.StartWith;
    } else {
      return [];
    }
  }

  getEndWithContexts(): ContextOrProgram[] {
    if (this.context.allen && this.context.allen.EndWith) {
      return this.context.allen.EndWith;
    } else {
      return [];
    }
  }

  updateLabel(label: string) {
    this.programVersionner.updateContext(this.context, {
      ...this.context,
      contextName: label
    });
  }

  updateState(expr: string) {
    this.progVersionner.updateStateInContext(this.context, expr);
  }

  startDragging() {
    this.progVersionner.draggedContext = this.context;
    this.hide = true;
  }

  stopDragging() {
    this.progVersionner.draggedContext = undefined;
    this.hide = false;
  }

  cut() {
    this.clipboard.cut(this.progVersionner, this.context);
  }

  copy() {
    this.clipboard.copy(this.progVersionner, this.context);
  }

  get canPaste(): boolean {
    return this.clipboard.canPaste;
  }

  paste() {
    this.clipboard.paste(this.progVersionner, this.context);
  }

  deleteContext() {
    this.progVersionner.removeContext(this.context);
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

  get draggedContext(): HumanReadableContext {
    return this.progVersionner.draggedContext;
  }

  appendContext(allen: string, context: HumanReadableContext, after?: HumanReadableContext) {
    // console.log('Append context', allen, context, after);
    this.progVersionner.moveContext({
      context,
      to: {
        parent: this.context,
        via: stringToAllen(allen),
        after
      }
    });
  }

  canDrop = (context: HumanReadableContext): boolean => {
    // Can drop if it is a context AND this state is not part of subcontexts
    if (context && context.contextName) {
      return !this.progVersionner.isContextNestedIn(this.context, context as HumanReadableStateContext);
    }
    return false;
  }

  async appendStateContext(conf: {allen: string, after?: HumanReadableContext}) {
    const A = this.context.allen;
    const LC: ContextOrProgram[] = A ? A[conf.allen] : [];
    const lastSubContext = LC[LC.length - 1];
    const newContext: HumanReadableStateContext = {
      contextName: 'C',
      state: ''
    };
    this.progVersionner.appendContext({
      context: newContext,
      parent: this.context,
      via: stringToAllen(conf.allen),
      after: conf.after || lastSubContext
    });
    return this.editCondition(newContext);
  }

  appendEventContext(conf: {allen: string, after?: HumanReadableContext}) {
    const LC: ContextOrProgram[] = this.context.allen[conf.allen];
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
    this.progVersionner.appendContext( {
      context,
      parent: this.context,
      via: stringToAllen(conf.allen),
      after: conf.after || lastSubContext
    } );
  }

  isThereEvents(): boolean {
    return this.progVersionner.getEvents().length > 0;
  }

  getAvailableChannels(): VariableDescription[] {
    let L = this.progVersionner.getChannels();
    if (this.context.actions) {
      L = L.filter(c => !this.context.actions.find((a: HumanReadableStateAction) => a.channel === c.name));
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
      context: this.context
    });
    if (A) {
      const newContext = copyHumanReadableStateContext(this.context);
      newContext.actions = newContext.actions ? [...newContext.actions, A] : [A];
      this.programVersionner.updateContext(this.context, newContext);
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
      const newContext = copyHumanReadableStateContext(this.context);
      if (position === 'start') {
        newContext.actionsOnStart = newContext.actionsOnStart ? [...newContext.actionsOnStart, newAction] : [newAction];
      } else {
        newContext.actionsOnEnd = newContext.actionsOnEnd ? [...newContext.actionsOnEnd, newAction] : [newAction];
      }
      this.programVersionner.updateContext(this.context, newContext);
    }
  }

  appendAction(channel: VariableDescription, contextType: 'EVENT' | 'STATE', position: 'start' | 'finish') {
    switch (contextType) {
      case 'STATE': return this.appendStatedAction(channel);
      case 'EVENT': return this.appendEventAction(channel, position);
    }
  }

  appendStatedAction(vd: VariableDescription) {
    this.progVersionner.appendStateAction(this.context, {channel: vd.name, affectation: {value: ''}});
  }

  appendEventAction(vd: VariableDescription, pos: 'start' | 'finish') {
    this.progVersionner.appendEventActionOnStateContext(
      this.context, {
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
}
