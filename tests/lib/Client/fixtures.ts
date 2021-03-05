import { RequestContext } from '@/lib/types';
import { SpeakTrace as BaseSpeakTrace, ExitTrace as BaseEndTrace, GeneralTrace as BaseGeneralTrace, DeviceType, TraceType, VisualTrace } from '@voiceflow/general-types';
import { SpeakType } from '@voiceflow/general-types/build/nodes/speak';
import { CanvasVisibility, VisualType } from '@voiceflow/general-types/build/nodes/visual';

import { ResponseContext } from '@/lib/types';
import { VF_APP_INITIAL_STATE, VF_APP_NEXT_STATE_2 } from '../Context/fixtures';
import { SPEAK_TRACE, VFAppVariablesSchema } from '../fixtures';

export const DB_VISUAL_TRACE: VisualTrace = {
  type: TraceType.VISUAL,
  payload: {
    visualType: VisualType.IMAGE,
    image: 'the-image.url',
    device: DeviceType.DESKTOP,
    dimensions: {
      height: 100,
      width: 200,
    },
    canvasVisibility: CanvasVisibility.CROPPED
  }
}

export const VF_APP_CUSTOM_INITIAL_VARIABLES: Partial<VFAppVariablesSchema> = {
  age: 337,
  name: 'Gandalf the White',
};

export const STATE_REQUEST_BODY_WITH_CUSTOM_VARIABLES: RequestContext = {
  config: {
    tts: false,
  },
  state: {
    ...VF_APP_INITIAL_STATE,
    variables: {
      ...VF_APP_INITIAL_STATE.variables,
      ...VF_APP_CUSTOM_INITIAL_VARIABLES,
    },
  },
  request: null,
};

export const BASE_SPEAK_TRACE: BaseSpeakTrace = {
  type: TraceType.SPEAK,
  payload: {
    ...SPEAK_TRACE.payload,
    type: SpeakType.MESSAGE,
  }, 
}

export const BASE_END_TRACE: BaseEndTrace = {
  type: TraceType.END,
}

export const INTERACT_AXIOS_POST_RESPONSE_BODY: Omit<ResponseContext, 'trace'> & { trace: BaseGeneralTrace[] } = {
  state: VF_APP_NEXT_STATE_2,
  request: null,
  trace: [BASE_SPEAK_TRACE, BASE_END_TRACE],
};
