import { GeneralRequest, RequestType } from '@voiceflow/general-types';
import { State } from '@voiceflow/runtime';
import Bluebird from 'bluebird';

import Client from '@/lib/Client';
import { VFClientError, VFTypeError } from '@/lib/Common';
import Context from '@/lib/Context';
import EventManager, { BeforeProcessingEventHandler, GeneralTraceEventHandler, TraceEventHandler, AfterProcessingEventHandler } from '@/lib/Events';
import { DataConfig, GeneralTrace, ResponseContext, TraceType, TraceEvent } from '@/lib/types';

import { isValidTraceType } from '../DataFilterer/utils';
import { makeRequestBody, resetContext } from './utils';

type OnMethodHandlerArgMap<V> = {
  [K in TraceType]: TraceEventHandler<K, V>;
} & {
  [TraceEvent.GENERAL]: GeneralTraceEventHandler<V>;
  [TraceEvent.BEFORE_PROCESSING]: BeforeProcessingEventHandler<V>;
  [TraceEvent.AFTER_PROCESSING]: AfterProcessingEventHandler<V>;
};

export class RuntimeClient<V extends Record<string, any> = Record<string, any>> {
  private client: Client<V>;

  private dataConfig: DataConfig;

  private context: Context<V>;

  private events: EventManager<V>;

  constructor(state: State, { client, dataConfig = {} }: { client: Client<V>; dataConfig?: DataConfig }) {
    this.client = client;
    this.dataConfig = dataConfig;
    this.events = new EventManager();

    this.context = new Context({ request: null, state, trace: [] }, this.dataConfig);
  }

  async start(): Promise<Context<V>> {
    this.context = new Context(resetContext(this.context.toJSON()), this.dataConfig);
    return this.sendRequest(null);
  }

  async sendText(userInput: string): Promise<Context<V>> {
    if (!userInput?.trim?.()) {
      return this.sendRequest(null);
    }
    return this.sendRequest({ type: RequestType.TEXT, payload: userInput });
  }

  async sendIntent(
    name: string,
    entities: {
      name: string;
      value: string;
      query?: string;
    }[] = [],
    query = '',
    confidence?: number
  ): Promise<Context<V>> {
    return this.sendRequest({ type: RequestType.INTENT, payload: { intent: { name }, entities, query, confidence } });
  }

  async sendRequest(request: GeneralRequest) {
    if (this.context.isEnding()) {
      throw new VFClientError('RuntimeClient.sendText() was called but the conversation has ended');
    }

    this.setContext(await this.client.interact(makeRequestBody(this.context!, request, this.dataConfig)));

    new Bluebird(async (resolve) => {
      await this.events.handleProcessing(TraceEvent.BEFORE_PROCESSING, this.context!);

      await Bluebird.each(this.context!.getTrace({ sanitize: this.dataConfig.ssml }), async (trace: GeneralTrace) => {
        await this.events.handle(trace, this.context!);
      });

      await this.events.handleProcessing(TraceEvent.AFTER_PROCESSING, this.context!);

      resolve();
    });

    return this.context;
  }

  on<T extends TraceType | TraceEvent>(event: T, handler: OnMethodHandlerArgMap<V>[T]) {
    if (event === TraceEvent.GENERAL) {
      return this.events.onAny(handler as GeneralTraceEventHandler<V>);
    } else if (event === TraceEvent.BEFORE_PROCESSING) {
      return this.events.onBeforeProcessing(handler as BeforeProcessingEventHandler<V>);
    } else if (event === TraceEvent.AFTER_PROCESSING) {
      return this.events.onAfterProcessing(handler as AfterProcessingEventHandler<V>);
    } else if (isValidTraceType(event)) {
      return this.events.on(event as any, handler as any);
    }
    throw new VFTypeError(`event "${event}" is not valid`);
  }

  off<T extends TraceType | TraceEvent>(event: T, handler: OnMethodHandlerArgMap<V>[T]) {
    if (event === TraceEvent.GENERAL) {
      return this.events.offAny(handler as GeneralTraceEventHandler<V>);
    } else if (event === TraceEvent.BEFORE_PROCESSING) {
      return this.events.offBeforeProcessing(handler as BeforeProcessingEventHandler<V>);
    } else if (event === TraceEvent.AFTER_PROCESSING) {
      return this.events.offAfterProcessing(handler as AfterProcessingEventHandler<V>);
    }
    if (isValidTraceType(event)) {
      return this.events.off(event as any, handler as any);
    }
    throw new VFTypeError(`event "${event}" is not valid`);
  }

  onSpeak(handler: TraceEventHandler<TraceType.SPEAK, V>) {
    this.events.on(TraceType.SPEAK, handler);
  }

  onAudio(handler: TraceEventHandler<TraceType.AUDIO, V>) {
    this.events.on(TraceType.AUDIO, handler);
  }

  onBlock(handler: TraceEventHandler<TraceType.BLOCK, V>) {
    this.events.on(TraceType.BLOCK, handler);
  }

  onDebug(handler: TraceEventHandler<TraceType.DEBUG, V>) {
    this.events.on(TraceType.DEBUG, handler);
  }

  onEnd(handler: TraceEventHandler<TraceType.END, V>) {
    this.events.on(TraceType.END, handler);
  }

  onFlow(handler: TraceEventHandler<TraceType.FLOW, V>) {
    this.events.on(TraceType.FLOW, handler);
  }

  onVisual(handler: TraceEventHandler<TraceType.VISUAL, V>) {
    this.events.on(TraceType.VISUAL, handler);
  }

  onChoice(handler: TraceEventHandler<TraceType.CHOICE, V>) {
    this.events.on(TraceType.CHOICE, handler);
  }

  setContext(contextJSON: ResponseContext) {
    this.context = new Context(contextJSON, this.dataConfig);
  }

  getContext() {
    return this.context;
  }
}

export default RuntimeClient;
