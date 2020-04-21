import {ChangeDetectionStrategy, Component, Inject, OnInit, Input} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef, MatDialog} from '@angular/material/dialog';
import {
  HumanReadableProgram,
  ProgramReference,
  VariableDescription,
  EventTrigger,
  isNameUsedInProg,
  copyProgRef,
} from 'ccbl-js/lib/ProgramObjectInterface';
import { mathjs } from 'ccbl-js/lib/CCBLExpressionInExecutionEnvironment';
import { BehaviorSubject } from 'rxjs';

const errorName = 'Program name should be reductible to a symbol';

export interface DataEditProgramRef {
  parentProgram: HumanReadableProgram;
  progRef?: ProgramReference;
  editMode?: boolean;
}

@Component({
  selector: 'lib-dialog-edit-prog-instance',
  templateUrl: './dialog-edit-prog-instance.component.html',
  styleUrls: ['./dialog-edit-prog-instance.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DialogEditProgInstanceComponent implements OnInit {
  newProgRefSubj = new BehaviorSubject<ProgramReference>( undefined );
  originalName: string;
  private errorMessage: string[];
  errorObs = new BehaviorSubject<string>('');

  static async editProgRef(dialog: MatDialog, data: DataEditProgramRef): Promise<ProgramReference> {
    const dialogRef = dialog.open<DialogEditProgInstanceComponent, DataEditProgramRef, ProgramReference>(
      DialogEditProgInstanceComponent, {
      data,
      closeOnNavigation: false,
      width: '80%',
      position: {bottom: '10px'}
    });
    return dialogRef.afterClosed().toPromise();
  }

  constructor(private dialogRef: MatDialogRef<DialogEditProgInstanceComponent, ProgramReference>,
              @Inject(MAT_DIALOG_DATA) private data: DataEditProgramRef) {
    const sPName = this.subProgramsId[0];
    if (this.data.progRef) {
      this.newProgRefSubj.next( copyProgRef( this.data.progRef ) );
      this.originalName = this.data.progRef.as;
    } else {
      this.newProgRefSubj.next({
        programId: sPName,
        mapInputs: {},
        as: `new instance of ${sPName}`
      });
    }
  }

  ngOnInit(): void {

  }

  get editMode(): boolean {
    return !!this.data.editMode;
  }

  cancel(): void {
    this.dialogRef.close();
  }

  ok(): void {
    this.dialogRef.close( this.newProgRefSubj.getValue() );
  }

  get programId(): string {
    return this.newProgRefSubj.getValue().programId;
  }

  set programId(id: string) {
    const P = this.newProgRefSubj.getValue();
    const PR: ProgramReference = {
      as: P.as,
      programId: id,
      mapInputs: {}
    };
    this.newProgRefSubj.next(PR);
    console.log(PR);
  }

  get progRef(): ProgramReference {
    return this.newProgRefSubj.getValue();
  }


  getEvent(name: string): EventTrigger {
    if (this.progRef.mapInputs[name] as EventTrigger) {
      return this.progRef.mapInputs[name] as EventTrigger;
    } else {
      const dep = this.data.parentProgram.dependencies;
      const L: VariableDescription[] = [
        ...(dep?.import?.events || []),
        ...(dep?.export?.events || []),
      ];
      const n = L.find(e => e.name === name)?.name || '';
      return {eventSource: n};
    }
  }

  getEmitter(name: string): string {
    const M = this.progRef.mapInputs[name];
    if (M) {
      return M as string;
    } else {
      const dep = this.data.parentProgram.dependencies;
      const L: VariableDescription[] = [
        ...(dep?.import?.emitters || []),
        ...(dep?.export?.emitters || []),
        ...(dep?.import?.channels || []),
        ...(dep?.export?.channels || []),
        ...(this.data.parentProgram?.localChannels)
      ];
      const n = L.find(e => e.name === name)?.name || '';
      return n;
    }
  }

  getChannel(name: string): string {
    const M = this.progRef.mapInputs[name];
    return M as string;
  }

  get parentProgram(): HumanReadableProgram {
    return this.data.parentProgram;
  }

  get subProgramsId(): string[] {
    return Object.keys( this.data.parentProgram.subPrograms );
  }

  get subProg(): HumanReadableProgram {
    return this.data.parentProgram.subPrograms[ this.progRef.programId ];
  }

  get availableEvents(): VariableDescription[] {
    return [
      ...(this.data.parentProgram.dependencies?.import?.events || []),
      ...(this.data.parentProgram.dependencies?.export?.events || [])
    ].sort();
  }

  get availableEmitters(): VariableDescription[] {
    return [
      ...(this.data.parentProgram.dependencies?.import?.emitters || []),
    ].sort();
  }

  get availableChannels(): VariableDescription[] {
    return [
      ...(this.data.parentProgram.dependencies?.import?.channels || []),
      ...(this.data.parentProgram.dependencies?.export?.emitters || []),
      ...(this.data.parentProgram.dependencies?.export?.channels || [])
    ].sort();
  }

  get eventsToMap(): VariableDescription[] {
    return this.subProg?.dependencies?.import?.events || [];
  }

  get emittersToMap(): VariableDescription[] {
    return this.subProg?.dependencies?.import?.emitters || [];
  }

  get channelsToMap(): VariableDescription[] {
    return this.subProg?.dependencies?.import?.channels || [];
  }

  get channels(): VariableDescription[] {
    const P = this.parentProgram;
    return [
      ...(P.dependencies?.import?.channels || []),
      ...(P.dependencies?.export?.channels || []),
      ...(P.localChannels || []),
    ];
  }

  updateProgramReference(pg: ProgramReference) {
    this.newProgRefSubj.next(pg);
  }

  updateName(n: string) {
    this.progRef.as = n;
    return this.canValidate;
  }

  get canValidate(): boolean {
    this.errorMessage = [];
    try {
      const N = mathjs.parse( this.progRef.as );
      if (!N.isSymbolNode) {
        this.errorMessage.push(errorName);
      }
    } catch(err) {
      this.errorMessage.push(errorName);
    }

    const SPs = this.data.parentProgram.subPrograms || {};
    const used = isNameUsedInProg( this.progRef.as, this.data.parentProgram );

    if (used && !(this.editMode && this.progRef.as === this.originalName)) {
      this.errorMessage.push(`This program name is already used as ${used.location} ${used.varRange}`);
    }

    if (this.eventsToMap  .find( e => !this.progRef.mapInputs[e.name] ) ||
        this.emittersToMap.find( e => !this.progRef.mapInputs[e.name] ) ||
        this.channelsToMap.find( e => !this.progRef.mapInputs[e.name] )
    ) {
      this.errorMessage.push(`Some inputs are not specified`);
    }

    this.errorObs.next( this.errorMessage.join(`\n`) );
    return this.errorMessage.length === 0;
  }

}
