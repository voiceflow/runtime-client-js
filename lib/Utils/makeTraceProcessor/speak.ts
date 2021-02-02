import { SpeakTrace, TraceType } from '@voiceflow/general-types';

import { DefaultHandler } from './default';

export type SpeakTraceAudioHandler = (message: SpeakTrace['payload']['message'], src: SpeakTrace['payload']['src']) => void;
export type SpeakTraceTTSHandler = (message: SpeakTrace['payload']['message'], src: SpeakTrace['payload']['src']) => void;
export type SpeakTraceHandler = {
  handleAudio: SpeakTraceAudioHandler;
  handleTTS: SpeakTraceTTSHandler;
};

export const invokeSpeakHandler = (defaultHandler: DefaultHandler, trace: SpeakTrace, speakHandlers?: SpeakTraceHandler) => {
  const {
    payload: { type: speakTraceType },
  } = trace;

  if (!speakHandlers) {
    return defaultHandler(TraceType.SPEAK);
  }

  const {
    payload: { message: speakMessage, src: speakSrc },
  } = trace;

  if (speakTraceType === 'message') {
    return speakHandlers.handleTTS ? speakHandlers.handleTTS(speakMessage, speakSrc) : defaultHandler(TraceType.SPEAK);
  }
  if (speakTraceType === 'audio') {
    return speakHandlers.handleAudio ? speakHandlers.handleAudio(speakMessage, speakSrc) : defaultHandler(TraceType.SPEAK);
  }
  throw new TypeError("VError: makeTraceProcessor's returned callback received an unknown SpeakTrace subtype");
};
