import { ExitTrace, TraceType } from '@voiceflow/general-types';

import { DefaultHandler } from './default';

export type EndTraceHandler = () => any;

export const invokeEndHandler = (defaultHandler: DefaultHandler, _: ExitTrace, handler?: EndTraceHandler) => {
  return handler ? handler() : defaultHandler(TraceType.END);
};
