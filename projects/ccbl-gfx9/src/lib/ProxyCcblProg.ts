import { CCBLProgramObjectInterface, HumanReadableEventAction, HumanReadableEventContext, HumanReadableProgram, HumanReadableStateAction, HumanReadableStateContext, ProgramPath } from "ccbl-js/lib/ProgramObjectInterface";
import { ActionUpdate, ContextUpdate } from "ccbl-js/lib/ccbl-exec-data";
import { Observable } from "rxjs";

export abstract class ProxyCcblProg {
    abstract readonly programs: Observable<{path: string[], program: HumanReadableProgram}[]>;
    
    abstract subscribeToProgram(path: ProgramPath, onOff: "on" | "off"): this
    abstract getActionProxy (A: HumanReadableStateAction  | HumanReadableEventAction ): undefined | Observable<ActionUpdate >;
    abstract getContextProxy(A: HumanReadableStateContext | HumanReadableEventContext): undefined | Observable<ContextUpdate>;

    abstract setProgram(p: CCBLProgramObjectInterface): this;
    abstract connect(url: string, options?: {jwt: string}): this;
    abstract disconnect(code: number): this;
}