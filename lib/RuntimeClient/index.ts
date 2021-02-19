import { GeneralRequest, RequestType } from '@voiceflow/general-types';
import { State } from '@voiceflow/runtime';

import Client from '@/lib/Client';
import { VFClientError, VFTypeError } from '@/lib/Common';
import Context from '@/lib/Context';
import { DataConfig, ResponseContext, TraceHandlerMap, TraceType } from '@/lib/types';

import EventsManager from '@/lib/Events';
import { makeRequestBody, resetContext } from './utils';
import { makeTraceProcessor } from '../Utils/makeTraceProcessor';
import { isValidTraceType } from '../DataFilterer/utils';

type OnMethodHandlerArgMap = {
  [K in TraceType]: TraceHandlerMap[K];
} & {
  trace: ReturnType<typeof makeTraceProcessor>;
}

export class RuntimeClient<S extends Record<string, any> = Record<string, any>> {
  private client: Client<S>;

  private dataConfig: DataConfig;

  private context: Context<S>;

  private events: EventsManager;

  constructor(state: State, { client, dataConfig = {} }: { client: Client<S>; dataConfig?: DataConfig }) {
    this.client = client;
    this.dataConfig = dataConfig;
    this.events = new EventsManager();

    this.context = new Context({ request: null, state, trace: [] }, this.dataConfig);
  }

  async start(): Promise<Context<S>> {
    this.context = new Context(resetContext(this.context.toJSON()), this.dataConfig);
    return this.sendRequest(null);
  }

  async sendText(userInput: string): Promise<Context<S>> {
    if (!userInput?.trim?.()) {
      return this.sendRequest(null);
    }
    return this.sendRequest({ type: RequestType.TEXT, payload: userInput });
  }

  async sendRequest(request: GeneralRequest) {
    if (this.context.isEnding()) {
      throw new VFClientError('RuntimeClient.sendText() was called but the conversation has ended');
    }
    this.setContext(await this.client.interact(makeRequestBody(this.context!, request, this.dataConfig)));

    if (this.dataConfig.traceProcessor) {
      this.context!.getResponse().forEach(this.dataConfig.traceProcessor);
    }

    this.context!.getTrace().forEach((trace) => this.events.handle(trace.type, trace));

    return this.context;
  }

  on<S extends TraceType | 'trace'>(event: S, handler: OnMethodHandlerArgMap[S]) {
    if (event === 'trace') {
      return this.events.onAny(handler as ReturnType<typeof makeTraceProcessor>);
    } else if (isValidTraceType(event)){
      return this.events.on(event, handler as any);
    } else {
      throw new VFTypeError(`event "${event}" is not valid`);
    }
  }

  onSpeak(handler: TraceHandlerMap[TraceType.SPEAK]) {
    this.events.on(TraceType.SPEAK, handler);
  }

  onAudio(handler: TraceHandlerMap[TraceType.AUDIO]) {
    this.events.on(TraceType.AUDIO, handler);
  }

  onBlock(handler: TraceHandlerMap[TraceType.BLOCK]) {
    this.events.on(TraceType.BLOCK, handler);
  }

  onDebug(handler: TraceHandlerMap[TraceType.DEBUG]) {
    this.events.on(TraceType.DEBUG, handler);
  }

  onEnd(handler: TraceHandlerMap[TraceType.END]) {
    this.events.on(TraceType.END, handler);
  }

  onFlow(handler: TraceHandlerMap[TraceType.FLOW]) {
    this.events.on(TraceType.FLOW, handler);
  }

  onVisual(handler: TraceHandlerMap[TraceType.VISUAL]) {
    this.events.on(TraceType.VISUAL, handler);
  }

  setContext(contextJSON: ResponseContext) {
    this.context = new Context(contextJSON, this.dataConfig);
  }

  getContext() {
    return this.context;
  }
}

export default RuntimeClient;
