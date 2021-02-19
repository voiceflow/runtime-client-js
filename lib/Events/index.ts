import { GeneralTrace, TraceMap, TraceType } from '@/lib/types';
import Context from '../Context';

export type TraceEventHandler<
  T extends TraceType, 
  V extends Record<string, any>
> = (object: TraceMap[T], context: Context<V>) => void;

export type GeneralTraceEventHandler<V extends Record<string, any>> = (object: GeneralTrace, context: Context<V>) => void;

type _Map<
  T extends Record<string, any>,
  K extends TraceType = TraceType, 
> = Map<K, Array<TraceEventHandler<K, T>>>;

export class EventsManager<V extends Record<string, any>> {
  private specHandlers: _Map<V>; 
  private genHandlers: GeneralTraceEventHandler<V>[];

  constructor() {
    this.specHandlers = new Map();
    const traceTypeVals = (Object.keys(TraceType).map(type => type.toLowerCase()) as TraceType[]);
    traceTypeVals.forEach((traceType) => this.specHandlers.set(traceType, []));
  
    this.genHandlers = [];
  }

  on<T extends TraceType>(event: T, handler: TraceEventHandler<T, V>) {
    const handlerList = this.specHandlers.get(event)! as TraceEventHandler<T, V>[];
    handlerList.push(handler);
  }

  onAny(handler: GeneralTraceEventHandler<V>) {
    this.genHandlers.push(handler);
  }

  handle<T extends TraceType>(event: T, trace: TraceMap[T], context: Context<V>) {
    this.specHandlers.get(event)!.forEach((handler: TraceEventHandler<T, V>) => handler(trace, context));

    this.genHandlers.forEach((handler: GeneralTraceEventHandler<V>) => handler(trace, context));
  }
}

export default EventsManager;
