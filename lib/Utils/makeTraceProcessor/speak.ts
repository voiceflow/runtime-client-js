import { SpeakTrace, TraceType } from '@voiceflow/general-types';

import { DefaultHandler } from './default';

export type SpeakTraceAudioHandler = (message: SpeakTrace['payload']['message'], src: SpeakTrace['payload']['src']) => any;
export type SpeakTraceTTSHandler = (message: SpeakTrace['payload']['message'], src: SpeakTrace['payload']['src']) => any;
export type SpeakTraceHandler = Partial<{
  handleAudio: SpeakTraceAudioHandler;
  handleTTS: SpeakTraceTTSHandler;
}>;

export const invokeSpeakHandler = (defaultHandler: DefaultHandler, trace: SpeakTrace, speakHandlers?: SpeakTraceHandler) => {
  const {
    payload: { type: speakTraceType, message: speakMessage, src: speakSrc },
  } = trace;

  if (!speakHandlers) {
    return defaultHandler(TraceType.SPEAK);
  }

  if (speakTraceType === 'message') {
    return speakHandlers.handleTTS ? speakHandlers.handleTTS(speakMessage, speakSrc) : defaultHandler(TraceType.SPEAK);
  }
  if (speakTraceType === 'audio') {
    return speakHandlers.handleAudio ? speakHandlers.handleAudio(speakMessage, speakSrc) : defaultHandler(TraceType.SPEAK);
  }
  throw new TypeError("VError: makeTraceProcessor's returned callback received an unknown SpeakTrace subtype");
};
