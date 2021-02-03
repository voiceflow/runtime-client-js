import { DebugTrace } from '@voiceflow/general-types';

export type DebugTraceHandler = (message: DebugTrace['payload']['message']) => any;

export const invokeDebugHandler = (trace: DebugTrace, handler: DebugTraceHandler) => handler(trace.payload.message);
