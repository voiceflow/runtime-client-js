import { ChoiceTrace } from '@voiceflow/general-types';

export type ChoiceTraceHandler = (choices: ChoiceTrace['payload']['choices']) => any;

export const invokeChoiceHandler = (trace: ChoiceTrace, handler: ChoiceTraceHandler) => handler(trace.payload.choices);
