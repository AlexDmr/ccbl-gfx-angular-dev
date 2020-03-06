
export interface VariableDescription {
  name: string;
  type: string;
}

export interface Vocabulary {
  channels?: VariableDescription[];
  emitters?: VariableDescription[];
  events?: VariableDescription[];
}

export interface ImportExportConfig {
  import?: Vocabulary;
  export?: Vocabulary;
}

export interface Affectation {
  type?: 'expression' | 'constraint';
  value: string;
}

export declare type ContextOrProgram = HumanReadableContext | ProgramReference;

export interface ProgramReference {
  programId: string;
  as: string;
  mapInputs?: {
    [key: string]: string;
  };
}

export interface AllenRelationships {
  During?: ContextOrProgram[];
  StartWith?: ContextOrProgram[];
  EndWith?: ContextOrProgram[];
  Meet?: {
    contextsSequence: HumanReadableContext[];
    loop?: number;
  };
}

export interface HumanReadableStateAction {
  channel: string;
  affectation: Affectation;
}

export declare type HumanReadableEventAction = HumanReadableEventChannelAction | HumanReadableEventTriggerAction;

export declare interface HumanReadableEventTriggerAction {
  eventer: string;
  expression: string;
}

export declare interface HumanReadableEventChannelAction {
  channel: string;
  affectation: string;
}

export interface EventTrigger {
  eventName?: string;
  eventSource: string;
  eventFilter?: string;
}
export interface HumanReadableStateContext {
  contextName: string;
  eventStart?: EventTrigger;
  state?: string;
  eventFinish?: EventTrigger;
  actions?: HumanReadableStateAction[];
  allen?: AllenRelationships;
  actionsOnStart?: HumanReadableEventAction[];
  actionsOnEnd?: HumanReadableEventAction[];
}
export interface HumanReadableEventContext extends EventTrigger {
  contextName: string;
  actions: HumanReadableEventAction[];
}
export declare type HumanReadableContext = HumanReadableStateContext | HumanReadableEventContext;

export interface HumanReadableProgram {
  localChannels?: VariableDescription[];
  dependencies?: ImportExportConfig;
  actions?: HumanReadableStateAction[];
  allen?: AllenRelationships;
  subPrograms?: {
    [key: string]: HumanReadableProgram;
  };
}
