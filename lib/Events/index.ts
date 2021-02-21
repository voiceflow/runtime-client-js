import Bluebird from 'bluebird';

import { GeneralTrace, TraceMap, TraceType } from '@/lib/types';

import Context from '../Context';

export type TraceEventHandler<T extends TraceType, V extends Record<string, any>> = (object: TraceMap[T], context: Context<V>) => void;

export type GeneralTraceEventHandler<V extends Record<string, any>> = (object: GeneralTrace, context: Context<V>) => void;

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

  onAny(handler: GeneralTraceEventHandler<V>) {
    this.genHandlers.push(handler);
  }

  async handle<T extends TraceType>(trace: TraceMap[T], context: Context<V>) {
    await Bluebird.each(this.specHandlers.get(trace.type)!, async (handler: TraceEventHandler<T, V>) => {
      await handler(trace, context);
    });

    await Bluebird.each(this.genHandlers, async (handler: GeneralTraceEventHandler<V>) => {
      await handler(trace, context);
    });
  }
}

export default EventManager;
