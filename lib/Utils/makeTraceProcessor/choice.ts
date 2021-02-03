import { ChoiceTrace, TraceType } from '@voiceflow/general-types';

import { DefaultHandler } from './default';

export type ChoiceTraceHandler = (choices: ChoiceTrace['payload']['choices']) => any;

export const invokeChoiceHandler = (defaultHandler: DefaultHandler, trace: ChoiceTrace, handler?: ChoiceTraceHandler) => {
  const {
    payload: { choices },
  } = trace;
  return handler ? handler(choices) : defaultHandler(TraceType.CHOICE);
};
