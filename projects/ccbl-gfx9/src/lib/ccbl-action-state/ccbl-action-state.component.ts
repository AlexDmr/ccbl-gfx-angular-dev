import {ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ProgVersionner} from '../ccbl-gfx9.service';
import {HumanReadableStateAction, VariableDescription} from 'ccbl-js/lib/ProgramObjectInterface';
import {EditableOptionType} from '../editable-option/editable-option.component';
import {BehaviorSubject} from 'rxjs';

type OPERATOR = 'expression' | 'constraint';

@Component({
  selector: 'lib-ccbl-action-state',
  templateUrl: './ccbl-action-state.component.html',
  styleUrls: ['./ccbl-action-state.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CcblActionStateComponent implements OnInit, OnDestroy {
  active = new BehaviorSubject<boolean>(false);
  overridedWith = new BehaviorSubject<string | undefined>(undefined);
  pAction: HumanReadableStateAction;
  get action(): HumanReadableStateAction {return this.pAction;}
  @Input() set action(a: HumanReadableStateAction) {
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
  cbCcblActivation = (a: boolean) => {
    // console.log('action active:', a);
    this.active.next(a);
  }
  cbCcblOverridedWith = (e: string | undefined) => {
    this.overridedWith.next(e);
  }

  constructor() { }

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

}
