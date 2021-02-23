import { VisualTrace, VisualTraceHandler } from '@/lib/types';

export const invokeVisualHandler = (trace: VisualTrace, handler: VisualTraceHandler) => {
  const {
    payload: { image, device, dimensions, canvasVisibility },
  } = trace;
  return handler(image, device, dimensions, canvasVisibility);
};
export default invokeVisualHandler;
