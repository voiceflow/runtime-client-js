import { DebugTrace, DebugTraceHandler } from '@/lib/types';

export const invokeDebugHandler = (trace: DebugTrace, handler: DebugTraceHandler) => handler(trace.payload.message);
export default invokeDebugHandler;
