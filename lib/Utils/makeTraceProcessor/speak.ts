import { SpeakTrace, TraceType } from '@voiceflow/general-types';
import _ from 'lodash';
import { DefaultHandler } from './default';

export type SpeakTraceAudioHandler = (message: SpeakTrace['payload']['message'], src: SpeakTrace['payload']['src']) => any;
export type SpeakTraceTTSHandler = (message: SpeakTrace['payload']['message'], src: SpeakTrace['payload']['src']) => any;
export type SpeakTraceHandlerFunction = (message: SpeakTrace['payload']['message'], src: SpeakTrace['payload']['src'], type: SpeakTrace['payload']['type']) => any;
export type SpeakTraceHandlerMap = Partial<{
  handleAudio: SpeakTraceAudioHandler;
  handleTTS: SpeakTraceTTSHandler;
}>;
export type SpeakTraceHandler = SpeakTraceHandlerFunction | SpeakTraceHandlerMap;

export const invokeSpeakHandler = (defaultHandler: DefaultHandler, trace: SpeakTrace, speakHandler?: SpeakTraceHandler) => {
  const {
    payload: { type: speakTraceType, message: speakMessage, src: speakSrc },
  } = trace;

  if (!speakHandler) {
    return defaultHandler(TraceType.SPEAK);
  }

  if (_.isFunction(speakHandler)) {
    return speakHandler(speakMessage, speakSrc, speakTraceType);
  }

  if (speakTraceType === 'message') {
    return speakHandler.handleTTS ? speakHandler.handleTTS(speakMessage, speakSrc) : defaultHandler(TraceType.SPEAK);
  }
  if (speakTraceType === 'audio') {
    return speakHandler.handleAudio ? speakHandler.handleAudio(speakMessage, speakSrc) : defaultHandler(TraceType.SPEAK);
  }
  throw new TypeError("VError: makeTraceProcessor's returned callback received an unknown SpeakTrace subtype");
};
