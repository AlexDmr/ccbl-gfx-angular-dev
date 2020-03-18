import {HumanReadableProgram, VariableDescription} from 'ccbl-js/lib/ProgramObjectInterface';
import {Trace, TraceStringToNumber} from './Traces';

export interface Setup<T extends number | string, V> {
  initialRootProgram: HumanReadableProgram;
  sensors: Sensor[];
  goal: string;
  trace: Trace<T, V>;
}

export function SetupStringToNumber<V>(s: Setup<string, V>): Setup<number, V> {
  return {...s, trace: TraceStringToNumber(s.trace)};
}


export type SensorVarType = 'channel' | 'emitter' | 'event';
export type SensorDataType = 'boolean' | 'number' | 'color';
export interface BasicSensor extends VariableDescription {
  label: string;
  userCanControl: boolean;
  varType: SensorVarType;
}

export function isEvent(s: BasicSensor): boolean {
  return s && s.varType === 'event';
}

export function isBooleanSensor(s: BasicSensor): boolean {
  return s && s.type === 'boolean';
}
export interface BooleanSensor extends BasicSensor {
  type: 'boolean';
}

export function isScalarSensor(s: BasicSensor): boolean {
  return s && s.type === 'number';
}
export interface ScalarSensor extends BasicSensor {
  type: 'number';
}

export function isColorSensor(s: BasicSensor): boolean {
  return s && s.type === 'color';
}
export interface ColorSensor extends BasicSensor {
  type: 'color';
}

export type Sensor = ScalarSensor | BooleanSensor | ColorSensor;
