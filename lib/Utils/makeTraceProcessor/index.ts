import { GeneralTrace, TraceType } from '@voiceflow/general-types';

import { BlockTraceHandler, invokeBlockHandler } from './block';
import { ChoiceTraceHandler, invokeChoiceHandler } from './choice';
import { DebugTraceHandler, invokeDebugHandler } from './debug';
import { EndTraceHandler, invokeEndHandler } from './end';
import { FlowTraceHandler, invokeFlowHandler } from './flow';
import { invokeSpeakHandler, SpeakTraceHandler } from './speak';
import { invokeStreamHandler, StreamTraceHandler } from './stream';
import { invokeVisualHandler, VisualTraceHandler } from './visual';

export type TraceHandlerMap = Partial<{
  [TraceType.BLOCK]: BlockTraceHandler;
  [TraceType.CHOICE]: ChoiceTraceHandler;
  [TraceType.DEBUG]: DebugTraceHandler;
  [TraceType.END]: EndTraceHandler;
  [TraceType.FLOW]: FlowTraceHandler;
  [TraceType.SPEAK]: SpeakTraceHandler;
  [TraceType.STREAM]: StreamTraceHandler;
  [TraceType.VISUAL]: VisualTraceHandler;
}>;

export type InvokeHandler = (trace: any, handler: any) => any;

const invokeHandlerMap = new Map<TraceType, InvokeHandler>([
  [TraceType.BLOCK, invokeBlockHandler],
  [TraceType.CHOICE, invokeChoiceHandler],
  [TraceType.DEBUG, invokeDebugHandler],
  [TraceType.END, invokeEndHandler],
  [TraceType.FLOW, invokeFlowHandler],
  [TraceType.SPEAK, invokeSpeakHandler],
  [TraceType.STREAM, invokeStreamHandler],
  [TraceType.VISUAL, invokeVisualHandler],
]);

const makeTraceProcessor = (handlers: TraceHandlerMap) => (trace: GeneralTrace) => {
  const invokeHandler = invokeHandlerMap.get(trace.type);

  if (!invokeHandler) {
    throw new Error('VFError: an unknown trace type was passed into makeTraceProcessor');
  }

  const handler = handlers[trace.type];

  if (!handler) {
    throw new Error(`VFError: handler for ${trace.type} was not implemented`);
  }

  return invokeHandler(trace, handlers[trace.type]);
};

export default makeTraceProcessor;
