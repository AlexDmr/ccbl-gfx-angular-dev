import {MathNode} from 'mathjs';

export interface ParsedExprNode {
  label: string;
  type: string;
  mathNode?: MathNode;
}

