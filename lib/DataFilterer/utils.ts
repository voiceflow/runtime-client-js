import { GeneralTrace, TraceType } from '@/lib/types';

export const SSML_TAG_REGEX = /<\/?[^>]+(>|$)/g;

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
