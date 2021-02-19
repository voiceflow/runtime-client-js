import { VFClientError } from '../Common';
import { GeneralTrace, TraceType } from '../types';
import { invokeHandlerMap } from '../Utils/makeTraceProcessor/traceProcessor';

export class EventsManager {
  private handlers: Partial<Record<string, any>>;

  constructor() {
    this.handlers = {};
  }

  on(event: TraceType, handler: any) {
    if (!this.handlers[event]) {
      this.handlers[event] = [];
    }
    const handlers = this.handlers[event];
    handlers.push(handler);
  }

  handle(event: TraceType, trace: GeneralTrace) {
    if (!this.handlers[event]) {
      this.handlers[event] = [];
    }
    this.handlers[event].forEach((handler: any) => this.invokeWithHandler(trace, handler));
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
