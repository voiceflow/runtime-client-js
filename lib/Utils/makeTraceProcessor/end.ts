import { EndTrace, EndTraceHandler } from '@/lib/types';

export const invokeEndHandler = (_: EndTrace, handler: EndTraceHandler) => handler();
export default invokeEndHandler;
