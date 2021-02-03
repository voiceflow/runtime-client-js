import { FlowTrace, TraceType } from '@voiceflow/general-types';

import { DefaultHandler } from './default';

export type FlowTraceHandler = (diagramID: FlowTrace['payload']['diagramID']) => any;

export const invokeFlowHandler = (defaultHandler: DefaultHandler, trace: FlowTrace, handler?: FlowTraceHandler) => {
  const {
    payload: { diagramID },
  } = trace;
  return handler ? handler(diagramID) : defaultHandler(TraceType.FLOW);
};
