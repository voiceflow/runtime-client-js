import { FlowTrace } from '@voiceflow/general-types';

export type FlowTraceHandler = (diagramID: FlowTrace['payload']['diagramID']) => any;

export const invokeFlowHandler = (trace: FlowTrace, handler: FlowTraceHandler) => handler(trace.payload.diagramID);
