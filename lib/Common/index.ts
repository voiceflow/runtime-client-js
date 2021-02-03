import { TraceType } from '@voiceflow/general-types';

export const validTraceTypes = new Set(Object.keys(TraceType));

export default {
  validTraceTypes,
};
