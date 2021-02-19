import { FlowTrace, FlowTraceHandler } from '@/lib/types';

export const invokeFlowHandler = (trace: FlowTrace, handler: FlowTraceHandler) => handler(trace.payload.diagramID);
export default invokeFlowHandler;
