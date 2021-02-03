import { VisualTrace } from '@voiceflow/general-types';
import { VisualType } from '@voiceflow/general-types/build/nodes/visual';
import _ from 'lodash';

type APLPayload = Omit<VisualTrace['payload'] & { visualType: VisualType.APL }, 'visualType'>;
type ImagePayload = Omit<VisualTrace['payload'] & { visualType: VisualType.IMAGE }, 'visualType'>;
export type VisualTraceAPLHandler = (aplPayload: APLPayload) => any;
export type VisualTraceImageHandler = (imgPayload: ImagePayload) => any;
export type VisualTraceHandlerFunction = (payload: APLPayload | ImagePayload, visualType: VisualType) => any;
export type VisualTraceHandlerMap = Partial<{
  handleAPL: VisualTraceAPLHandler;
  handleImage: VisualTraceImageHandler;
}>;
export type VisualTraceHandler = VisualTraceHandlerFunction | VisualTraceHandlerMap;

export const invokeVisualHandler = (trace: VisualTrace, visualHandler: VisualTraceHandler) => {
  const {
    payload: { visualType, ...rest },
  } = trace;

  if (_.isFunction(visualHandler)) {
    return visualHandler(rest, visualType);
  }

  if (visualType === VisualType.APL) {
    if (!visualHandler.handleAPL) {
      throw new Error("VFError: missing handler for VisualTrace's apl subtype");
    }
    return visualHandler.handleAPL(rest as APLPayload);
  }
  if (visualType === VisualType.IMAGE) {
    if (!visualHandler.handleImage) {
      throw new Error("VFError: missing handler for VisualTrace's image subtype");
    }
    return visualHandler.handleImage(rest as ImagePayload);
  }
  throw new TypeError("VFError: makeTraceProcessor's returned callback received an unknown VisualTrace subtype");
};
