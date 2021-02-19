import { BlockTrace, BlockTraceHandler } from '@/lib/types';

export const invokeBlockHandler = (trace: BlockTrace, handler: BlockTraceHandler) => handler(trace.payload.blockID);
export default invokeBlockHandler;
