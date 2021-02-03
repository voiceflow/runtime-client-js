import { GeneralTrace, TraceType } from '@voiceflow/general-types';

export const SSML_TAG_REGEX = /<\/?[^>]+(>|$)/g;

export const validTraceTypes = new Set(Object.keys(TraceType));

export const isValidTraceType = (type: string): type is TraceType => validTraceTypes.has(type);

export const stripSSMLFromSpeak = (trace: GeneralTrace): GeneralTrace => {
  return trace.type !== TraceType.SPEAK
    ? trace
    : {
        ...trace,
        payload: {
          ...trace.payload,
          message: trace.payload.message.replace(SSML_TAG_REGEX, ''),
        },
      };
};
