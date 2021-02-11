import { ExitTrace } from '../../../node_modules/@voiceflow/general-types';

export type EndTraceHandler = () => any;

export const invokeEndHandler = (_: ExitTrace, handler: EndTraceHandler) => handler();
