import { TraceType } from '@voiceflow/general-types';

export const throwNotImplementedException = (type: TraceType) => {
  throw new Error(`VFError: a handler for ${type} was not implemented`);
};

export type DefaultHandler = (trace: TraceType) => any;
