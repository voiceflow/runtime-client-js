import { GeneralTrace as DBGeneralTrace, SpeakTrace, TraceType } from '@voiceflow/general-types';
import { SpeakType } from '@voiceflow/general-types/build/nodes/speak';
import htmlParse from 'html-parse-stringify';

import { DBResponseContext } from './types';

/**
 * WORK-AROUND function to deal with bug where enabling `tts` will cause the Audio Step's audio
 * file url to not generate. Better solution is to decouple the TTS and audio handlers in our
 * backend and remove `parseAudioStepSrc` and `adaptResponseContext`
 */
export const parseAudioStepSrc = (trace: DBGeneralTrace): DBGeneralTrace => {
  if (trace.type !== TraceType.SPEAK) {
    return trace;
  }

  const node = htmlParse.parse(trace.payload.message)[0];

  if (!node || node.name !== 'audio') {
    return {
      ...trace,
      payload: {
        ...trace.payload,
        type: SpeakType.MESSAGE,
      },
    } as SpeakTrace;
  }

  const audioSrc = node.attrs.src;

  return {
    ...trace,
    payload: {
      ...trace.payload,
      type: SpeakType.AUDIO,
      src: audioSrc,
    },
  };
};

/**
 * WORK-AROUND function, see `parseAudioStepSrc` above
 */
export const adaptResponseContext = (context: DBResponseContext): DBResponseContext => ({
  ...context,
  trace: context.trace.map(parseAudioStepSrc),
});
