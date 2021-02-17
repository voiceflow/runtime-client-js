import { GeneralTrace, SpeakTrace, TraceType } from '@voiceflow/general-types';
import { SpeakType } from '@voiceflow/general-types/build/nodes/speak';
import { parse } from 'html-parse-stringify';

import { validTraceTypes } from '../Common';

export const SSML_TAG_REGEX = /<\/?[^>]+(>|$)/g;

export const isValidTraceType = (type: string): type is TraceType => validTraceTypes.has(type.toUpperCase());

export const stripSSMLFromSpeak = (trace: GeneralTrace): GeneralTrace => {
  return trace.type !== TraceType.SPEAK || trace.payload.type !== SpeakType.MESSAGE
    ? trace
    : {
      ...trace,
      payload: {
        ...trace.payload,
        message: trace.payload.message.replace(SSML_TAG_REGEX, ''),
      },
    };
};

/**
 * WORK-AROUND function to deal with the backend's tight coupling of TTS and audio src extraction.
 * Better, long-term solution is to decouple TTS and audio in our backend.
 */
export const parseAudioStepSrc = (trace: GeneralTrace): GeneralTrace => {
  if (trace.type !== TraceType.SPEAK) {
    return trace;
  }

  const node = parse(trace.payload.message)[0];

  if (!node || node.name !== 'audio') {
    return {
      ...trace,
      payload: {
        ...trace.payload,
        type: SpeakType.MESSAGE
      }
    } as SpeakTrace;
  }

  const audioSrc = node.attrs.src;

  return {
    ...trace,
    payload: {
      ...trace.payload,
      type: SpeakType.AUDIO,
      src: audioSrc,
    }
  };
}
