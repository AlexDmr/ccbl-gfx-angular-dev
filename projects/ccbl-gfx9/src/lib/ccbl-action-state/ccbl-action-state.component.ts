import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {ProgVersionner} from '../ccbl-gfx9.service';
import {HumanReadableStateAction, HumanReadableStateContext, VariableDescription} from 'ccbl-js/lib/ProgramObjectInterface';
import {EditableOptionType} from '../editable-option/editable-option.component';
import {BehaviorSubject} from 'rxjs';
import {MatDialog} from '@angular/material/dialog';
import {DataActionState, DialogEditActionStateComponent} from '../dialog-edit-action-state/dialog-edit-action-state.component';

type OPERATOR = 'expression' | 'constraint';

@Component({
  selector: 'lib-ccbl-action-state[action][context]',
  templateUrl: './ccbl-action-state.component.html',
  styleUrls: ['./ccbl-action-state.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CcblActionStateComponent implements OnInit, OnDestroy {
  active = new BehaviorSubject<boolean>(false);
  overridedWith = new BehaviorSubject<string | undefined>(undefined);
  newAction: HumanReadableStateAction;
  @Output() update = new EventEmitter<HumanReadableStateAction>();
  pAction: HumanReadableStateAction;
  @Input() context: HumanReadableStateContext;
  @Input()
  get action(): HumanReadableStateAction {
    return this.pAction;
  }
  set action(a: HumanReadableStateAction) {
    if (this.pAction && this.pAction.ccblAction && !!this.pAction.ccblAction.getIsActivated) {
      // @ts-ignore
      this.pAction.ccblAction.getIsActivated().off( this.cbCcblActivation );
    }
    this.pAction?.ccblAction?.offOverride( this.cbCcblOverridedWith );
    this.pAction = a;
    if (this.pAction && this.pAction.ccblAction && !!this.pAction.ccblAction.getIsActivated) {
      // @ts-ignore
      this.pAction.ccblAction.getIsActivated().on( this.cbCcblActivation );
      this.active.next( this.pAction.ccblAction.getIsActivated().get() );
    }
    this.pAction?.ccblAction?.onOverride( this.cbCcblOverridedWith );
  }
  @Input('program-versionner') private progVersionner: ProgVersionner;
  static async staticEdit(matDialog: MatDialog, data: DataActionState) {
    const dialogRef = matDialog.open<DialogEditActionStateComponent, DataActionState, HumanReadableStateAction>(
      DialogEditActionStateComponent, {
        data,
        closeOnNavigation: false
      } );
    const newAction: HumanReadableStateAction = await dialogRef.afterClosed().toPromise();
    if (newAction) {
      data.progV.updateStateAction(data.action, newAction);
    }
  }
  cbCcblActivation = (a: boolean) => {
    // console.log('action active:', a);
    this.active.next(a);
  }
  cbCcblOverridedWith = (e: string | undefined) => {
    this.overridedWith.next(e);
  }

  constructor(private matDialog: MatDialog) { }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    this.pAction?.ccblAction?.getIsActivated()?.off( this.cbCcblActivation );
  }

  get programVersionner(): ProgVersionner {
    return this.progVersionner;
  }

  get channel(): string {
    return this.action.channel;
  }

  set channel(channelName: string) {
    this.progVersionner.updateStateActionChannel(this.action, channelName);
  }

  get channelsOptions(): EditableOptionType<string>[] {
    return this.progVersionner.getChannels().map( c => ({
      label: c.name,
      value: c.name
    }) );
  }

  getChannels(): VariableDescription[] {
    return this.progVersionner.getChannels();
  }

  operationLabel(op: OPERATOR): string {
    switch (op) {
      case 'expression': return '⇐';
      case 'constraint': return 'constraint by';
    }
  }

  operationExtentedLabel(op: OPERATOR): string {
    switch (op) {
      case 'expression': return '⇐ (channel takes value)';
      case 'constraint': return 'value is constraint by';
    }
  }

  get operationsOptions(): EditableOptionType<OPERATOR>[] {
    return [
      {label: this.operationExtentedLabel('expression'), value: 'expression'},
      {label: this.operationExtentedLabel('constraint'), value: 'constraint'}
    ];
  }

  get operation(): OPERATOR {
    return this.isAffectation() ? 'expression' : 'constraint';
  }

  set operation(op: OPERATOR) {
    this.progVersionner.updateStateActionAffectationType(this.action, op);
  }

  updateAffectation(expr: string) {
    this.progVersionner.updateAffectation(this.action.affectation, expr);
  }

  deleteAction() {
    this.progVersionner.removeStateAction(this.action);
  }

  private isAffectation(): boolean {
    const affectation = this.action.affectation;
    return affectation.value !== undefined && (!affectation.type || affectation.type === 'expression');
  }

  private isConstraint(): boolean {
    const affectation = this.action.affectation;
    return affectation.type === 'constraint';
  }

  async edit() {
    const data: DataActionState = {
      action: this.action,
      context: this.context,
      progV: this.programVersionner
    };
    return CcblActionStateComponent.staticEdit(this.matDialog, data);
  }

  delete() {
    this.programVersionner.removeStateAction(this.action);
  }

}
