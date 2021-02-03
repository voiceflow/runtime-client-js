import { BlockTrace } from '@voiceflow/general-types';

export type BlockTraceHandler = (blockID: BlockTrace['payload']['blockID']) => any;

export const invokeBlockHandler = (trace: BlockTrace, handler: BlockTraceHandler) => handler(trace.payload.blockID);
