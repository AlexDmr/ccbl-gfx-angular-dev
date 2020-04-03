import {Injectable} from '@angular/core';
import {ProgVersionner} from './ccbl-gfx9.service';
import {HumanReadableContext, HumanReadableStateContext} from 'ccbl-js/lib/ProgramObjectInterface';
import {AllenType} from 'ccbl-js/lib/AllenInterface';
import {Clipboard} from '@angular/cdk/clipboard';

@Injectable({
  providedIn: 'root'
})
export class ClipboardService {
  private context: HumanReadableContext = undefined;

  constructor(private angClipboard: Clipboard) { }

  copy(progV: ProgVersionner, ctxt: HumanReadableContext) {
    this.context = ctxt;
  }

  cut(progV: ProgVersionner, ctxt: HumanReadableContext) {
    this.context = ctxt;
    progV.removeContext(ctxt);
  }

  paste(progV: ProgVersionner, to: HumanReadableStateContext) {
    if (this.canPaste) {
      progV.appendContextOrProgram({
        parent: to,
        via: AllenType.During,
        context: this.context
      });
      this.context = undefined;
    }
  }

  get canPaste(): boolean {
    return this.context !== undefined;
  }
}
