import { GeneralTrace, TraceType } from '@voiceflow/general-types';

import { BlockTraceHandler, invokeBlockHandler } from './block';
import { ChoiceTraceHandler, invokeChoiceHandler } from './choice';
import { DebugTraceHandler, invokeDebugHandler } from './debug';
import { DefaultHandler, throwNotImplementedException } from './default';
import { EndTraceHandler, invokeEndHandler } from './end';
import { FlowTraceHandler, invokeFlowHandler } from './flow';
import { invokeSpeakHandler, SpeakTraceHandler } from './speak';
import { invokeStreamHandler, StreamTraceHandler } from './stream';

export type TraceHandlerMap = Partial<{
  [TraceType.BLOCK]: BlockTraceHandler;
  [TraceType.CHOICE]: ChoiceTraceHandler;
  [TraceType.DEBUG]: DebugTraceHandler;
  [TraceType.END]: EndTraceHandler;
  [TraceType.FLOW]: FlowTraceHandler;
  [TraceType.SPEAK]: SpeakTraceHandler;
  [TraceType.STREAM]: StreamTraceHandler;
}>;

const makeTraceProcessor = (handlers: TraceHandlerMap, defaultHandler: DefaultHandler = throwNotImplementedException) => (trace: GeneralTrace) => {
  switch (trace.type) {
    case TraceType.BLOCK:
      return invokeBlockHandler(defaultHandler, trace, handlers[trace.type]);

    case TraceType.CHOICE:
      return invokeChoiceHandler(defaultHandler, trace, handlers[trace.type]);

    case TraceType.DEBUG:
      return invokeDebugHandler(defaultHandler, trace, handlers[trace.type]);

    case TraceType.END:
      return invokeEndHandler(defaultHandler, trace, handlers[trace.type]);

    case TraceType.FLOW:
      return invokeFlowHandler(defaultHandler, trace, handlers[trace.type]);

    case TraceType.SPEAK:
      return invokeSpeakHandler(defaultHandler, trace, handlers[trace.type]);

    case TraceType.STREAM:
      return invokeStreamHandler(defaultHandler, trace, handlers[trace.type]);

    default:
      throw new TypeError("VError: makeTraceProcessor's returned callback received a unknown trace type");
  }
};

export default makeTraceProcessor;
