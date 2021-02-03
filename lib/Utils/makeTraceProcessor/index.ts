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

export type InvokeHandler = (DefaultHandler: DefaultHandler, trace: any, handler: any) => void;

const invokeHandlerMap = new Map<TraceType, InvokeHandler>([
  [TraceType.BLOCK, invokeBlockHandler],
  [TraceType.CHOICE, invokeChoiceHandler],
  [TraceType.DEBUG, invokeDebugHandler],
  [TraceType.END, invokeEndHandler],
  [TraceType.FLOW, invokeFlowHandler],
  [TraceType.SPEAK, invokeSpeakHandler],
  [TraceType.STREAM, invokeStreamHandler],
]);

const makeTraceProcessor = (handlers: TraceHandlerMap, defaultHandler: DefaultHandler = throwNotImplementedException) => (trace: GeneralTrace) => {
  const invokeHandler = invokeHandlerMap.get(trace.type);
  
  if (!invokeHandler) {
    throw new Error("VFError: an unknown trace type was passed into makeTraceProcessor");
  }

  return invokeHandler(defaultHandler, trace, handlers[trace.type]);
};

export default makeTraceProcessor;
