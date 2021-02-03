import { BlockTrace, TraceType } from '@voiceflow/general-types';

import { DefaultHandler } from './default';

export type BlockTraceHandler = (blockID: BlockTrace['payload']['blockID']) => any;

export const invokeBlockHandler = (defaultHandler: DefaultHandler, trace: BlockTrace, handler?: BlockTraceHandler) => {
  const {
    payload: { blockID },
  } = trace;
  return handler ? handler(blockID) : defaultHandler(TraceType.BLOCK);
};
