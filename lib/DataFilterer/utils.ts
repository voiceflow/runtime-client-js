import { GeneralTrace, TraceType } from '@voiceflow/general-types';

import { validTraceTypes } from '@/lib/Common';

export const SSML_TAG_REGEX = /<\/?[^>]+(>|$)/g;

export const isValidTraceType = (type: string): type is TraceType => validTraceTypes.has(type.toUpperCase());

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
