import { RequestContext } from '@/lib/types';
import { DeviceType, TraceType, VisualTrace } from '@voiceflow/general-types';
import { CanvasVisibility, VisualType } from '@voiceflow/general-types/build/nodes/visual';

import { VF_APP_INITIAL_STATE } from '../Context/fixtures';
import { VFAppVariablesSchema } from '../fixtures';

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
