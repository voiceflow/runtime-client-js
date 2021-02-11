import { StreamTrace } from '../../../node_modules/@voiceflow/general-types';

export type StreamTraceHandler = (
  src: StreamTrace['payload']['src'],
  action: StreamTrace['payload']['action'],
  token: StreamTrace['payload']['token']
) => any;

export const invokeStreamHandler = (trace: StreamTrace, handler: StreamTraceHandler) => {
  const {
    payload: { src, action, token },
  } = trace;
  return handler(src, action, token);
};
