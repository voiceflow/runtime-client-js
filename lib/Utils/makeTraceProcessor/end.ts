import { ExitTrace, TraceType } from '@voiceflow/general-types';

import { DefaultHandler } from './default';

export type EndTraceHandler = () => void;

export const invokeEndHandler = (defaultHandler: DefaultHandler, _: ExitTrace, handler?: EndTraceHandler) => {
  return handler ? handler() : defaultHandler(TraceType.END);
};
