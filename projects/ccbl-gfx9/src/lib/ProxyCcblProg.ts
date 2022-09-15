import { CCBLProgramObjectInterface, HumanReadableEventAction, HumanReadableEventContext, HumanReadableProgram, HumanReadableStateAction, HumanReadableStateContext } from "ccbl-js/lib/ProgramObjectInterface";
import { ActionUpdate, ContextUpdate } from "ccbl-js/lib/ccbl-exec-data";
import { Observable } from "rxjs";

export abstract class ProxyCcblProg {
    abstract readonly program: Observable<HumanReadableProgram>;
    
    abstract getActionProxy (A: HumanReadableStateAction  | HumanReadableEventAction ): undefined | Observable<ActionUpdate >;
    abstract getContextProxy(A: HumanReadableStateContext | HumanReadableEventContext): undefined | Observable<ContextUpdate>;

    abstract setProgram(p: CCBLProgramObjectInterface): this;
    abstract connect(url: string): this;
}