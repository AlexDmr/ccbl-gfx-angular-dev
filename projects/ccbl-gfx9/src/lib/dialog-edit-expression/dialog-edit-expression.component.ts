import {AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {isOperatorUnary, ProgVersionner} from '../ccbl-gfx9.service';
import {VariableDescription} from 'ccbl-js/lib/ProgramObjectInterface';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MathNode} from 'mathjs';
import {mathjs} from 'ccbl-js/lib/CCBLExpressionInExecutionEnvironment';

export interface DataEditExpression {
  expression: string;
  progV: ProgVersionner;
  acceptEvents: boolean;
  vocabulary: VariableDescription[];
  canExpressTransition: boolean;
}

@Component({
  selector: 'lib-dialog-edit-expression',
  templateUrl: './dialog-edit-expression.component.html',
  styleUrls: ['./dialog-edit-expression.component.scss']
})
export class DialogEditExpressionComponent implements OnInit, AfterViewInit {
  tmpExpr: string;
  pNewExpr: string;
  errorIndication: string;
  cursorPos = -1;
  cursorErrorPos = -1;
  @ViewChild('inputExpr') inputExpr: ElementRef<HTMLInputElement>;
  @ViewChild('fakeLabel') fakeLabel: ElementRef<HTMLPreElement>;
  interpolators = ['linear', 'easeInOut', 'waitEnd'];
  interpolator = 'linear';
  V0 = '0';
  V1 = '';
  duration = '1000';
  private mathNodeRoot: MathNode;

  constructor(private dialogRef: MatDialogRef<DialogEditExpressionComponent, string>,
              @Inject(MAT_DIALOG_DATA) public data: DataEditExpression) {
    this.newExpr = this.tmpExpr = this.data.expression;
    if (this.isTransition) {
      const L = (this.mathNodeRoot as any).blocks.map(b => b.node) as MathNode[];
      this.V0 = L[0].toString();
      this.V1 = L[1].toString();
      this.duration = L[2].toString();
      this.interpolator = L[3].toString();
    }
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    /*
    const input = this.inputExpr.nativeElement;
    input.onclick = input.onkeydown = input.onkeyup = () => {
      const carAt = input.selectionStart;
      // Compute fake cursor position
      this.fakeLabel.nativeElement.textContent = this.pNewExpr.slice(0, carAt);
      this.cursorPos = this.fakeLabel.nativeElement.clientWidth;
    };
    input.onblur = () => {
      this.cursorPos = -1;
    };*/
  }

  cancel() {
    this.dialogRef.close();
  }

  ok() {
    this.dialogRef.close(
      this.isTransition ? [this.V0, this.V1, this.duration, this.interpolator].join('; ') : this.pNewExpr
    );
  }

  get progV(): ProgVersionner {
    return this.data.progV;
  }

  updateInput() {
    if (!this.errorIndication) {
      this.tmpExpr = this.newExpr;
    }
  }

  get canExpressTransition(): boolean {
    return this.data.canExpressTransition;
  }

  get isTransition(): boolean {
    return (this.canExpressTransition && this.mathNodeRoot) ? this.mathNodeRoot.isBlockNode : false;
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
    try {
      this.mathNodeRoot = this.progV.parse(s);
      // this.pNewExpr = n.toString();
      if (!this.isTransition) {
        const L = this.progV.convertExpressionToNodes(s, this.data.acceptEvents, ...this.data.vocabulary);
        const Lerr = L.filter(w => w.type.indexOf('error') >= 0).map(w => w.label);
        this.pNewExpr = L.map(w => w.label).join('');
        this.cursorErrorPos = -1;
        // console.log(this.pNewExpr);
        if (this.inputExpr) {
          // this.inputExpr.nativeElement.value = this.pNewExpr;
        }
        if (Lerr.length > 0) {
          this.errorIndication = 'Undefined variables: ' + Lerr.join(', ');
        } else {
          this.errorIndication = undefined;
        }
      }
    } catch (err) {
      this.errorIndication = err.toString();
      this.pNewExpr = s;
      const res = /\(char ([0-9]*)\)$/.exec(this.errorIndication);
      const carAt = res ? +res[1] : -1;
      this.fakeLabel.nativeElement.textContent = this.pNewExpr.slice(0, carAt);
      this.cursorErrorPos = this.fakeLabel.nativeElement.clientWidth;
    }
  }
}
