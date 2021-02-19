import { VFClientError } from '@/lib/Common';
import { GeneralTrace, TraceHandlerMap, TraceMap, TraceType } from '@/lib/types';
import { invokeHandlerMap, makeTraceProcessor } from '@/lib/Utils/makeTraceProcessor/traceProcessor';

export class EventsManager {
  private specHandlers: Record<string ,any>
  private genHandlers: ReturnType<typeof makeTraceProcessor>[];

  constructor() {
    this.specHandlers = {};
    Object.keys(TraceType).forEach((traceType) => {
      this.specHandlers[traceType] = [];
    });
    this.genHandlers = [];
  }

  on<S extends TraceType>(event: S, handler: TraceHandlerMap[S]) {
    this.specHandlers[event].push(handler);
  }

  onAny(handler: ReturnType<typeof makeTraceProcessor>) {
    this.genHandlers.push(handler);
  }

  handle<S extends TraceType>(event: S, trace: TraceMap[S]) {
    this.specHandlers[event].forEach((handler: any) => this.invokeWithHandler(trace, handler));
    this.genHandlers.forEach((handler: any) => handler(trace));
  }

  private invokeWithHandler(trace: GeneralTrace, handler: any) {
    const invokeHandler = invokeHandlerMap.get(trace.type);

    if (!invokeHandler) {
      throw new VFClientError(`invalid trace type "${trace.type}" was passed`);
    }

    return invokeHandler(trace, handler);
  }
}

export default EventsManager;
