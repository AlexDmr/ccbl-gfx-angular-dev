import { CCBLProgramObjectInterface, HumanReadableEventAction, HumanReadableEventContext, HumanReadableStateAction, HumanReadableStateContext } from "ccbl-js/lib/ProgramObjectInterface";
import { ActionUpdate, ContextUpdate } from "ccbl-js/lib/ccbl-exec-data";
import { Observable } from "rxjs";

export abstract class ProxyCcblProg {
    abstract getActionProxy (A: HumanReadableStateAction  | HumanReadableEventAction ): undefined | Observable<ActionUpdate >;
    abstract getContextProxy(A: HumanReadableStateContext | HumanReadableEventContext): undefined | Observable<ContextUpdate>;

    abstract setProgram(p: CCBLProgramObjectInterface): this;
}