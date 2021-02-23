import { AudioTrace, AudioTraceHandler } from '@/lib/types';

export const invokeAudioHandler = (trace: AudioTrace, handler: AudioTraceHandler) => {
  return handler(trace.payload.src);
};
export default invokeAudioHandler;
