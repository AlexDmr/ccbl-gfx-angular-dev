import {AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {convertExpressionToNodes} from '../ccbl-gfx9.service';
import {HumanReadableProgram, VariableDescription} from 'ccbl-js/lib/ProgramObjectInterface';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MathJsStatic, MathNode, create, all, BlockNode} from 'mathjs';
import {BehaviorSubject} from 'rxjs';

const mathjs = create(all, {}) as MathJsStatic;

export interface DataEditExpression {
  expression: string;
  program: HumanReadableProgram;
  acceptEvents: boolean;
  vocabulary: VariableDescription[];
  canExpressTransition: boolean;
}

@Component({
  selector: 'lib-dialog-edit-expression',
  templateUrl: './dialog-edit-expression.component.html',
  styleUrls: ['./dialog-edit-expression.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DialogEditExpressionComponent implements OnInit, AfterViewInit {
  tmpExpr: string;
  pNewExpr: string = '';
  errorIndicationSubj = new BehaviorSubject<string | undefined>(undefined);
  cursorPos = -1;
  cursorErrorPos = -1;
  @ViewChild('inputExpr') inputExpr!: ElementRef<HTMLInputElement>;
  @ViewChild('fakeLabel') fakeLabel!: ElementRef<HTMLPreElement>;
  interpolators = ['linear', 'easeInOut', 'waitEnd'];
  interpolator = 'linear';
  V0 = '0';
  V1 = '';
  duration = '1000';
  private mathNodeRoot?: MathNode;

  constructor(private dialogRef: MatDialogRef<DialogEditExpressionComponent, string>,
              @Inject(MAT_DIALOG_DATA) public data: DataEditExpression) {
    this.newExpr = this.tmpExpr = this.data.expression;
    if (this.isTransition) {
      const L: MathNode[] = [];
      this.mathNodeRoot!.forEach( n => L.push(n) );
      // XXX OLD const L = (this.mathNodeRoot as any).blocks.map(b => b.node) as MathNode[];
      this.V0 = L[0].toString();
      this.V1 = L[1].toString();
      this.duration = L[2].toString();
      this.interpolator = L[3].toString();
    }
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
  }

  cancel() {
    this.dialogRef.close();
  }

  ok() {
    this.dialogRef.close(
      this.isTransition ? [this.V0, this.V1, this.duration, this.interpolator].join('; ') : this.pNewExpr
    );
  }

  updateInput() {
    if (!this.errorIndicationSubj.getValue()) {
      this.tmpExpr = this.newExpr;
    }
  }

  get canExpressTransition(): boolean {
    return this.data.canExpressTransition;
  }

  get isTransition(): boolean {
    return this.canExpressTransition && !!(this.mathNodeRoot as BlockNode)?.isBlockNode; // ) ? this.mathNodeRoot.isBlockNode : false;
  }

  set isTransition(b: boolean) {
    if (b && !this.isTransition) {
      this.V1 = this.newExpr;
      this.mathNodeRoot = mathjs.parse('0;0;0;linear');
    } else {
      this.mathNodeRoot = undefined;
    }
  }

  get newExpr(): string {
    return this.pNewExpr;
  }

  set newExpr(s: string) {
    // console.log('setNewExpr = ', s);
    if (s.trim() === '') {
      this.errorIndicationSubj.next('Expression cannot be empty');
      return;
    }
    try {
      mathjs.parse(s);
    } catch(err: any) {
      this.errorIndicationSubj.next( err.toString() );
      return;
    }
    try {
      this.mathNodeRoot = mathjs.parse(s);
      // this.pNewExpr = n.toString();
      if (!this.isTransition) {
        const L = convertExpressionToNodes(this.data.program, s, this.data.acceptEvents, ...this.data.vocabulary);
        const Lerr = L.filter(w => w.type.indexOf('error') >= 0).map(w => w.label);
        this.pNewExpr = L.map(w => w.label).join('');
        this.cursorErrorPos = -1;
        if (this.inputExpr) {
          // this.inputExpr.nativeElement.value = this.pNewExpr;
        }
        if (Lerr.length > 0) {
          this.errorIndicationSubj.next( 'Undefined variables: ' + Lerr.join(', ') );
        } else {
          this.errorIndicationSubj.next(undefined );
        }
      }
    } catch (err: any) {
      this.errorIndicationSubj.next( err.toString() );
      this.pNewExpr = s;
      const res = /\(char ([0-9]*)\)$/.exec(this.errorIndicationSubj.getValue() ?? '');
      const carAt = res ? +res[1] : -1;
      this.fakeLabel.nativeElement.textContent = this.pNewExpr.slice(0, carAt);
      this.cursorErrorPos = this.fakeLabel.nativeElement.clientWidth;
    }
  }

}
