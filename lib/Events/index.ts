import Bluebird from 'bluebird';

import { GeneralTrace, TraceMap, TraceType } from '@/lib/types';

import Context from '../Context';

export type TraceEventHandler<T extends TraceType, V extends Record<string, any>> = (trace: TraceMap[T], context: Context<V>, index: number) => void;

export type GeneralTraceEventHandler<V extends Record<string, any>> = (trace: GeneralTrace, context: Context<V>, index: number) => void;

type _Map<T extends Record<string, any>, K extends TraceType = TraceType> = Map<K, Array<TraceEventHandler<K, T>>>;

export class EventManager<V extends Record<string, any>> {
  private specHandlers: _Map<V>;

  private genHandlers: GeneralTraceEventHandler<V>[];

  constructor() {
    this.specHandlers = new Map();
    const traceTypeVals = Object.keys(TraceType).map((type) => type.toLowerCase()) as TraceType[];
    traceTypeVals.forEach((traceType) => this.specHandlers.set(traceType, []));

    this.genHandlers = [];
  }

  on<T extends TraceType>(event: T, handler: TraceEventHandler<T, V>) {
    const handlerList = this.specHandlers.get(event)! as TraceEventHandler<T, V>[];
    handlerList.push(handler);
  }

  off<T extends TraceType>(event: T, handler: TraceEventHandler<T, V>) {
    const handlerList = this.specHandlers.get(event)! as TraceEventHandler<T, V>[];
    const toDel = handlerList.indexOf(handler);
    handlerList.splice(toDel, 1);
  }

  onAny(handler: GeneralTraceEventHandler<V>) {
    this.genHandlers.push(handler);
  }

  offAny(handler: GeneralTraceEventHandler<V>) {
    this.genHandlers.splice(this.genHandlers.indexOf(handler), 1);
  }

  async handle<T extends TraceType>(trace: TraceMap[T], context: Context<V>) {
    await Bluebird.each(this.specHandlers.get(trace.type)!, async (handler: TraceEventHandler<T, V>, index) => {
      await handler(trace, context, index);
    });

    await Bluebird.each(this.genHandlers, async (handler: GeneralTraceEventHandler<V>, index) => {
      await handler(trace, context, index);
    });
  }
}

export default EventManager;
