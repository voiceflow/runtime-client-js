import { SpeakTrace, SpeakTraceHandler } from '@/lib/types';

export const invokeSpeakHandler = (trace: SpeakTrace, handler: SpeakTraceHandler) => {
  const {
    payload: { message, src },
  } = trace;
  return handler(message, src);
};
export default invokeSpeakHandler;
