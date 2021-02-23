import { AudioTrace, AudioTraceHandler } from '@/lib/types';

export const invokeAudioHandler = (trace: AudioTrace, handler: AudioTraceHandler) => {
  const {
    payload: { message, src },
  } = trace;
  return handler(message, src);
};
export default invokeAudioHandler;
