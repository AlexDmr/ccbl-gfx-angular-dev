
export interface Interval {
  start: number;
  end: number;
}

export interface Trace<T extends number | string, V> {
  label: string;
  events: TraceEvent<T, V>[];
}

export interface TraceEvent<T extends number | string, V> {
  timestamp: T;
  sensorId: string;
  sensorValue: V;
}

export function TraceEventStringToNumber<V>(te: TraceEvent<string, V>): TraceEvent<number, V> {
  return {...te, timestamp: new Date(te.timestamp).getTime()};
}

export function TraceStringToNumber<V>(t: Trace<string, V>): Trace<number, V> {
  return {...t, events: t.events.map(TraceEventStringToNumber)};
}
