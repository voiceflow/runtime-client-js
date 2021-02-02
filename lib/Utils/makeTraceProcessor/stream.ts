import { StreamTrace, TraceType } from '@voiceflow/general-types';

import { DefaultHandler } from './default';

export type StreamTraceHandler = (
  src: StreamTrace['payload']['src'],
  action: StreamTrace['payload']['action'],
  token: StreamTrace['payload']['token']
) => void;

export const invokeStreamHandler = (defaultHandler: DefaultHandler, trace: StreamTrace, handler?: StreamTraceHandler) => {
  const {
    payload: { src, action, token },
  } = trace;
  return handler ? handler(src, action, token) : defaultHandler(TraceType.STREAM);
};
