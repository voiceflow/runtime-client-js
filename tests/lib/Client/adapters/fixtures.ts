import { TraceType } from "@voiceflow/general-types";
import { SpeakType } from "@voiceflow/general-types/build/nodes/speak";
import { AUDIO_TRACE, SPEAK_TRACE } from "../../fixtures";

export const MALFORMED_SPEAK_TRACE = {
    ...SPEAK_TRACE,
    payload: {
      ...SPEAK_TRACE.payload,
      type: SpeakType.MESSAGE
    }
  };
  
export const MALFORMED_AUDIO_TRACE = {
    type: TraceType.SPEAK,
    payload: {
        ...AUDIO_TRACE.payload,
        type: SpeakType.AUDIO
    }
}