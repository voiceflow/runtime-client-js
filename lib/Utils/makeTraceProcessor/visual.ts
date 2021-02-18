import { DeviceType, Dimensions, VisualTrace as CombinedVisualTrace } from '@voiceflow/general-types';
import { CanvasVisibility, ImageStepData } from '@voiceflow/general-types/build/nodes/visual';

export type VisualTrace = CombinedVisualTrace & { payload: ImageStepData };
export type VisualTraceHandler = (image: string | null, device: DeviceType | null, dimensions: Dimensions | null, visiblity: CanvasVisibility) => any;

export const invokeVisualHandler = (trace: VisualTrace, handler: VisualTraceHandler) => {
  const {
    payload: { image, device, dimensions, canvasVisibility },
  } = trace;
  return handler(image, device, dimensions, canvasVisibility);
};
