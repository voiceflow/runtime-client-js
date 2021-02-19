import { VFClientError } from '@/lib/Common';
import {
  AudioTraceHandler,
  BlockTraceHandler,
  ChoiceTraceHandler,
  DebugTraceHandler,
  EndTraceHandler,
  FlowTraceHandler,
  GeneralTrace,
  SpeakTraceHandler,
  TraceType,
  VisualTraceHandler,
} from '@/lib/types';

import { invokeAudioHandler } from './audio';
import { invokeBlockHandler } from './block';
import { invokeChoiceHandler } from './choice';
import { invokeDebugHandler } from './debug';
import { invokeEndHandler } from './end';
import { invokeFlowHandler } from './flow';
import { invokeSpeakHandler } from './speak';
import { invokeVisualHandler } from './visual';

export type TraceProcessorMap = Partial<{
  [TraceType.BLOCK]: BlockTraceHandler;
  [TraceType.CHOICE]: ChoiceTraceHandler;
  [TraceType.DEBUG]: DebugTraceHandler;
  [TraceType.END]: EndTraceHandler;
  [TraceType.FLOW]: FlowTraceHandler;
  [TraceType.SPEAK]: SpeakTraceHandler;
  [TraceType.AUDIO]: AudioTraceHandler;
  [TraceType.VISUAL]: VisualTraceHandler;
}>;

export type InvokeHandler = (trace: any, handler: any) => any;

export const invokeHandlerMap = new Map<TraceType, InvokeHandler>([
  [TraceType.BLOCK, invokeBlockHandler],
  [TraceType.CHOICE, invokeChoiceHandler],
  [TraceType.DEBUG, invokeDebugHandler],
  [TraceType.END, invokeEndHandler],
  [TraceType.FLOW, invokeFlowHandler],
  [TraceType.SPEAK, invokeSpeakHandler],
  [TraceType.AUDIO, invokeAudioHandler],
  [TraceType.VISUAL, invokeVisualHandler],
]);

export const makeTraceProcessor = (handlers: TraceProcessorMap) => (trace: GeneralTrace) => {
  const invokeHandler = invokeHandlerMap.get(trace.type);

  if (!invokeHandler) {
    throw new VFClientError(`invalid trace type "${trace.type}" was passed into makeTraceProcessor`);
  }

  const handler = handlers[trace.type];

  if (!handler) {
    throw new VFClientError(`handler for "${trace.type}" was not implemented`);
  }

  return invokeHandler(trace, handlers[trace.type]);
};
