import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {convertExpressionToNodes, isAttributeAccessor, isOperatorUnary, ProgVersionner} from '../ccbl-gfx9.service';
import {ParsedExprNode} from '../dataParsedExpr';
import {HumanReadableProgram, VariableDescription} from 'ccbl-js/lib/ProgramObjectInterface';
import {MatDialog} from '@angular/material/dialog';
import {DataEditExpression, DialogEditExpressionComponent} from '../dialog-edit-expression/dialog-edit-expression.component';
import {MathNode} from 'mathjs';
import {mathjs} from 'ccbl-js/lib/CCBLExpressionInExecutionEnvironment';

@Component({
  selector: 'lib-ccbl-expression',
  templateUrl: './ccbl-expression.component.html',
  styleUrls: ['./ccbl-expression.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CcblExpressionComponent implements OnInit {
  @ViewChild('newExpr') newExpr: ElementRef;
  @Input() overrided = false;
  @Input()
  get expression(): string {
    return this.pExpression;
  }
  set expression(e: string) {
    this.pExpression = e;
    try {
      if (e !== undefined) {
        this.nodeRoot = mathjs.parse(e);
      }
    } catch (err) {
      this.nodeRoot = undefined;
      // console.error('CcblExpressionComponent::setExpression: error in parsing expression', e);
    }
  }
  @Input() editable = true;
  @Input() acceptEvents = false;
  @Input() vocabulary: VariableDescription[] = [];
  @Input() canExpressTransition = false;
  @Input() program: HumanReadableProgram;
  // tslint:disable-next-line: no-output-rename
  @Output('update') private newExpression = new EventEmitter<string>();

  pEditing = false;
  private pExpression: string;
  private nodeRoot: MathNode;

  constructor(private matDialog: MatDialog) { }

  ngOnInit() {
  }

  get isInterpolation(): boolean {
    return this.nodeRoot && this.nodeRoot.isBlockNode;
  }

  get V0(): string {
    const N = this.nodeRoot as any;
    return N?.blocks[0].node.toString();
  }

  get V1(): string {
    const N = this.nodeRoot as any;
    return N?.blocks[1].node.toString();
  }

  get duration(): string {
    const N = this.nodeRoot as any;
    return N?.blocks[2].node.toString();
  }

  get interpolator(): string {
    const N = this.nodeRoot as any;
    return N?.blocks[3].node.toString();
  }

  getExpression(): string {
    return this.expression;
  }

  update(val: string) {
    this.newExpression.emit(val);
  }

  getLabel(n: ParsedExprNode): string {
    const w = n.label;
    return w; // isOperatorUnary(n) || isAttributeAccessor(n) ? w : `${w} `;
  }

  get parsedExprNodes(): ParsedExprNode[] {
    return this.expression ? convertExpressionToNodes(this.program, this.expression, this.acceptEvents, ...this.vocabulary) : [];
  }

  async edit(vocabulary: VariableDescription[] = []) {
    if (this.editable) {
      const data: DataEditExpression = {
        expression: this.expression,
        program: this.program,
        acceptEvents: this.acceptEvents,
        canExpressTransition: this.canExpressTransition,
        vocabulary
      };
      const dialogRef = this.matDialog.open<DialogEditExpressionComponent, DataEditExpression, string>(DialogEditExpressionComponent, {
        data,
        closeOnNavigation: false
      });
      const newE: string = await dialogRef.afterClosed().toPromise();
      if (newE !== undefined) {
        this.newExpression.emit(newE);
      }
    }
  }

}
