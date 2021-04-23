import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {VariableDescription} from 'ccbl-js/lib/ProgramObjectInterface';
import {ProgVersionner} from '../ccbl-gfx9.service';

@Component({
  selector: 'lib-ccbl-variable-declaration',
  templateUrl: './var-declaration.component.html',
  styleUrls: ['./var-declaration.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VarDeclarationComponent implements OnInit {
  @Input('description') varDescription?: VariableDescription;
  @Input('program-versionner') progVersionner?: ProgVersionner;
  editing = false;

  constructor() { }

  ngOnInit() {
  }

  updateWith(name: string, type: string) {
    if (this.progVersionner && this.varDescription) {
      this.progVersionner.updateVariableDescription(this.varDescription, {name, type});
    }
    this.editing = false;
  }

  delete() {
    if (this.progVersionner && this.varDescription) {
      this.progVersionner.removeVariableDescription(this.varDescription);
    }
  }

}
