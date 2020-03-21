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
import {isAttributeAccessor, isOperatorUnary, ProgVersionner} from '../ccbl-gfx9.service';
import {ParsedExprNode} from '../dataParsedExpr';
import {VariableDescription} from 'ccbl-js/lib/ProgramObjectInterface';
import {MatDialog} from '@angular/material/dialog';
import {DataEditExpression, DialogEditExpressionComponent} from '../dialog-edit-expression/dialog-edit-expression.component';

@Component({
  selector: 'lib-ccbl-expression',
  templateUrl: './ccbl-expression.component.html',
  styleUrls: ['./ccbl-expression.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CcblExpressionComponent implements OnInit {
  @ViewChild('newExpr') newExpr: ElementRef;
  @Input() expression: string;
  @Input() editable = true;
  @Input() acceptEvents = false;
  @Input() vocabulary: VariableDescription[] = [];
  @Input('program-versionner') private progVersionner: ProgVersionner;
  @Output('update')            private newExpression = new EventEmitter<string>();

  pEditing = false;

  constructor(private matDialog: MatDialog) { }

  ngOnInit() {
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
    return this.progVersionner.convertExpressionToNodes(this.expression, this.acceptEvents, ...this.vocabulary);
  }

  get parsedHTML(): string {
    return this.progVersionner.convertExpressionToHTML( this.getExpression() );
  }

  async edit(vocabulary: VariableDescription[] = []) {
    if (this.editable) {
      const data: DataEditExpression = {
        expression: this.expression,
        progV: this.progVersionner,
        acceptEvents: this.acceptEvents,
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
