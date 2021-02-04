import { ExitTrace } from '@voiceflow/general-types';

export type EndTraceHandler = () => any;

export const invokeEndHandler = (_: ExitTrace, handler: EndTraceHandler) => handler();
