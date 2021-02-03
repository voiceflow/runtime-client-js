import { TraceType, VisualTrace } from '@voiceflow/general-types';
import { VisualType } from '@voiceflow/general-types/build/nodes/visual';
import _ from 'lodash';

import { DefaultHandler } from './default';

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

export const invokeVisualHandler = (defaultHandler: DefaultHandler, trace: VisualTrace, visualHandler?: VisualTraceHandler) => {
  const {
    payload: { visualType, ...rest },
  } = trace;

  if (!visualHandler) {
    return defaultHandler(TraceType.VISUAL);
  }

  if (_.isFunction(visualHandler)) {
    return visualHandler(rest, visualType);
  }

  if (visualType === VisualType.APL) {
    return visualHandler.handleAPL ? visualHandler.handleAPL(rest as APLPayload) : defaultHandler(TraceType.VISUAL);
  }
  if (visualType === VisualType.IMAGE) {
    return visualHandler.handleImage ? visualHandler.handleImage(rest as ImagePayload) : defaultHandler(TraceType.VISUAL);
  }
  throw new TypeError("VError: makeTraceProcessor's returned callback received an unknown SpeakTrace subtype");
};
