import {AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {isOperatorUnary, ProgVersionner} from '../ccbl-gfx9.service';
import {VariableDescription} from 'ccbl-js/lib/ProgramObjectInterface';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

export interface DataEditExpression {
  expression: string;
  progV: ProgVersionner;
  acceptEvents: boolean;
  vocabulary: VariableDescription[];
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

  constructor(private dialogRef: MatDialogRef<DialogEditExpressionComponent, string>,
              @Inject(MAT_DIALOG_DATA) public data: DataEditExpression) {
    this.newExpr = this.tmpExpr = this.data.expression;
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
    this.dialogRef.close( this.pNewExpr );
  }

  get progV(): ProgVersionner {
    return this.data.progV;
  }

  updateInput() {
    if (!this.errorIndication) {
      this.tmpExpr = this.newExpr;
    }
  }

  get newExpr(): string {
    return this.pNewExpr;
  }

  set newExpr(s: string) {
    try {
      this.progV.parse(s);
      // this.pNewExpr = n.toString();
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
