import { GeneralTrace as DBGeneralTrace, TraceType as DBTraceType } from '@voiceflow/general-types';
import { SpeakType } from '@voiceflow/general-types/build/nodes/speak';

import { GeneralTrace, ResponseContext, TraceType } from '@/lib/types';

export const extractAudioStep = (context: Omit<ResponseContext, 'trace'> & { trace: DBGeneralTrace[] }) => ({
  ...context,
  trace: context.trace.map((trace) => {
    if (trace.type !== DBTraceType.SPEAK) {
      return (trace as unknown) as GeneralTrace;
    }
    const { type, ...payload } = trace.payload;

    return ({
      type: type === SpeakType.MESSAGE ? TraceType.SPEAK : TraceType.AUDIO,
      payload,
    } as unknown) as GeneralTrace;
  }),
});

export default extractAudioStep;
