import Bluebird from 'bluebird';

import { GeneralTrace, TraceEvent, TraceMap, TraceType } from '@/lib/types';

import Context from '../Context';

export type TraceEventHandler<T extends TraceType, V extends Record<string, any>> = (trace: TraceMap[T], context: Context<V>) => void;

export type GeneralTraceEventHandler<V extends Record<string, any>> = (trace: GeneralTrace, context: Context<V>) => void;

export type BeforeProcessingEventHandler<V extends Record<string, any>> = (context: Context<V>) => void;

export type AfterProcessingEventHandler<V extends Record<string, any>> = (context: Context<V>) => void;

type TraceEventHandlerMap<V> = {
  [TraceEvent.BEFORE_PROCESSING]: BeforeProcessingEventHandler<V>[],
  [TraceEvent.AFTER_PROCESSING]: AfterProcessingEventHandler<V>[],
  [TraceEvent.GENERAL]: BeforeProcessingEventHandler<V>[],
};

type _Map<T extends Record<string, any>, K extends TraceType = TraceType> = Map<K, Array<TraceEventHandler<K, T>>>;

export class EventManager<V extends Record<string, any>> {
  private specHandlers: _Map<V>;

  private genHandlers: GeneralTraceEventHandler<V>[];

  private traceEventHandlers: TraceEventHandlerMap<V>;

  constructor() {
    this.specHandlers = new Map();
    const traceTypeVals = Object.keys(TraceType).map((type) => type.toLowerCase()) as TraceType[];
    traceTypeVals.forEach((traceType) => this.specHandlers.set(traceType, []));

    this.genHandlers = [];
    this.traceEventHandlers = {
      [TraceEvent.BEFORE_PROCESSING]: [],
      [TraceEvent.AFTER_PROCESSING]: [],
      [TraceEvent.GENERAL]: [],
    };
  }

  on<T extends TraceType>(event: T, handler: TraceEventHandler<T, V>) {
    this.addHandler(handler, this.specHandlers.get(event)! as TraceEventHandler<T, V>[]);
  }

  off<T extends TraceType>(event: T, handler: TraceEventHandler<T, V>) {
    this.removeHandler(handler, this.specHandlers.get(event)! as TraceEventHandler<T, V>[])
  }

  onAny(handler: GeneralTraceEventHandler<V>) {
    this.addHandler(handler, this.genHandlers);
  }

  offAny(handler: GeneralTraceEventHandler<V>) {
    this.removeHandler(handler, this.genHandlers);
  }

  onBeforeProcessing(handler: BeforeProcessingEventHandler<V>) {
    this.addHandler(handler, this.traceEventHandlers[TraceEvent.BEFORE_PROCESSING]);
  }

  offBeforeProcessing(handler: BeforeProcessingEventHandler<V>) {
    this.removeHandler(handler, this.traceEventHandlers[TraceEvent.BEFORE_PROCESSING]);
  }

  onAfterProcessing(handler: BeforeProcessingEventHandler<V>) {
    this.addHandler(handler, this.traceEventHandlers[TraceEvent.AFTER_PROCESSING]);
  }

  offAfterProcessing(handler: BeforeProcessingEventHandler<V>) {
    this.removeHandler(handler, this.traceEventHandlers[TraceEvent.AFTER_PROCESSING]);
  }

  async handleProcessing<E extends TraceEvent.AFTER_PROCESSING | TraceEvent.BEFORE_PROCESSING>(event: E, context: Context<V>) {
    if (event === TraceEvent.BEFORE_PROCESSING) {
      await Bluebird.each(this.traceEventHandlers[TraceEvent.BEFORE_PROCESSING], async (handler) => {
        await handler(context);
      });
    } else if (event === TraceEvent.AFTER_PROCESSING) {
      await Bluebird.each(this.traceEventHandlers[TraceEvent.AFTER_PROCESSING], async (handler) => {
        await handler(context);
      });
    }
  }

  async handle<T extends TraceType>(trace: TraceMap[T], context: Context<V>) {
    await Bluebird.each(this.specHandlers.get(trace.type)!, async (handler: TraceEventHandler<T, V>) => {
      await handler(trace, context);
    });

    await Bluebird.each(this.genHandlers, async (handler: GeneralTraceEventHandler<V>) => {
      await handler(trace, context);
    });
  }

  private addHandler<H extends Function>(handler: H, handlerList: H[]) {
    handlerList.push(handler);
  }

  private removeHandler<H extends Function>(handler: H, handlerList: H[]) {
    handlerList.splice(handlerList.indexOf(handler), 1);
  }
}

export default EventManager;
