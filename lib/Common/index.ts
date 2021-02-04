import { TraceType } from '@voiceflow/general-types';

export const validTraceTypes = new Set(Object.keys(TraceType));

export const VFError = (message: string) => new Error(`VFError: ${message}`);

export default {
  validTraceTypes,
  VFError,
};
