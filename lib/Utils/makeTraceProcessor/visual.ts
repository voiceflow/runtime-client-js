import { TraceType, VisualTrace } from '@voiceflow/general-types';
import { VisualType } from '@voiceflow/general-types/build/nodes/visual';

import { DefaultHandler } from './default';

type APLPayload = Omit<VisualTrace['payload'] & { visualType: VisualType.APL }, 'visualType'>;
type ImagePayload = Omit<VisualTrace['payload'] & { visualType: VisualType.IMAGE }, 'visualType'>;
export type VisualTraceAPLHandler = (aplPayload: APLPayload) => any;
export type VisualTraceImageHandler = (imgPayload: ImagePayload) => any;
export type VisualTraceHandler = Partial<{
  handleAPL: VisualTraceAPLHandler;
  handleImage: VisualTraceImageHandler;
}>;

export const invokeVisualHandler = (defaultHandler: DefaultHandler, trace: VisualTrace, visualHandlers?: VisualTraceHandler) => {
  const {
    payload: { visualType, ...rest },
  } = trace;

  if (!visualHandlers) {
    return defaultHandler(TraceType.VISUAL);
  }

  if (visualType === VisualType.APL) {
    return visualHandlers.handleAPL ? visualHandlers.handleAPL(rest as APLPayload) : defaultHandler(TraceType.VISUAL);
  }
  if (visualType === VisualType.IMAGE) {
    return visualHandlers.handleImage ? visualHandlers.handleImage(rest as ImagePayload) : defaultHandler(TraceType.VISUAL);
  }
  throw new TypeError("VError: makeTraceProcessor's returned callback received an unknown SpeakTrace subtype");
};
