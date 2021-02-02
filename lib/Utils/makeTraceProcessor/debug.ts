import { DebugTrace, TraceType } from '@voiceflow/general-types';

import { DefaultHandler } from './default';

export type DebugTraceHandler = (message: DebugTrace['payload']['message']) => void;

export const invokeDebugHandler = (defaultHandler: DefaultHandler, trace: DebugTrace, handler?: DebugTraceHandler) => {
  const {
    payload: { message },
  } = trace;
  return handler ? handler(message) : defaultHandler(TraceType.DEBUG);
};
