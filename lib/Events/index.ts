import Bluebird from 'bluebird';

import { GeneralTrace, TraceMap, TraceType } from '@/lib/types';

import Context from '../Context';

export type TraceEventHandler<T extends TraceType, V extends Record<string, any>> = (trace: TraceMap[T], context: Context<V>) => void;

export type GeneralTraceEventHandler<V extends Record<string, any>> = (trace: GeneralTrace, context: Context<V>) => void;

export type BeforeProcessingEventHandler<V extends Record<string, any>> = (context: Context<V>) => void;

export type AfterProcessingEventHandler<V extends Record<string, any>> = (context: Context<V>) => void;

type TraceEventHandlerMap<V> = {
  [TraceEvent.BEFORE_PROCESSING]: BeforeProcessingEventHandler<V>;
  [TraceEvent.AFTER_PROCESSING]: AfterProcessingEventHandler<V>;
};

type Arrify<T extends Record<string, any>> = {
  [K in keyof T]: Array<T[K]>;
};

type InternalTraceEventHandlersMap<V> = Arrify<TraceEventHandlerMap<V>>;

type _Map<T extends Record<string, any>, K extends TraceType = TraceType> = Map<K, Array<TraceEventHandler<K, T>>>;

export class EventManager<V extends Record<string, any>> {
  private specHandlers: _Map<V>;

  private genHandlers: GeneralTraceEventHandler<V>[];

  private traceEventHandlers: InternalTraceEventHandlersMap<V>;

  constructor() {
    this.specHandlers = new Map();
    const traceTypeVals = Object.keys(TraceType).map((type) => type.toLowerCase()) as TraceType[];
    traceTypeVals.forEach((traceType) => this.specHandlers.set(traceType, []));

    this.genHandlers = [];
    this.traceEventHandlers = {
      [TraceEvent.BEFORE_PROCESSING]: [],
      [TraceEvent.AFTER_PROCESSING]: [],
    };
  }

  onTraceType<T extends TraceType>(event: T, handler: TraceEventHandler<T, V>) {
    this.addHandler(handler, this.specHandlers.get(event)!);
  }

  offTraceType<T extends TraceType>(event: T, handler: TraceEventHandler<T, V>) {
    this.removeHandler(handler, this.specHandlers.get(event)!);
  }

  onTraceEvent<T extends Exclude<TraceEvent, TraceEvent.GENERAL>>(event: T, handler: TraceEventHandlerMap<V>[T]) {
    this.addHandler(handler, this.traceEventHandlers[event]);
  }

  offTraceEvent<T extends Exclude<TraceEvent, TraceEvent.GENERAL>>(event: T, handler: TraceEventHandlerMap<V>[T]) {
    this.removeHandler(handler, this.traceEventHandlers[event]);
  }

  onGeneral(handler: GeneralTraceEventHandler<V>) {
    this.addHandler(handler, this.genHandlers);
  }

  offGeneral(handler: GeneralTraceEventHandler<V>) {
    this.removeHandler(handler, this.genHandlers);
  }

  async handleProcessing<E extends TraceEvent.AFTER_PROCESSING | TraceEvent.BEFORE_PROCESSING>(event: E, context: Context<V>) {
    await Bluebird.each(this.traceEventHandlers[event], async (handler) => {
      await handler(context);
    });
  }

  async handleTrace<T extends TraceType>(trace: TraceMap[T], context: Context<V>) {
    await Bluebird.each(this.specHandlers.get(trace.type)!, async (handler: TraceEventHandler<T, V>) => {
      await handler(trace, context);
    });

    await Bluebird.each(this.genHandlers, async (handler: GeneralTraceEventHandler<V>) => {
      await handler(trace, context);
    });
  }
}

export default EventManager;
