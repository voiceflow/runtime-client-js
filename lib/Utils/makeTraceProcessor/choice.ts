import { ChoiceTrace, ChoiceTraceHandler } from '@/lib/types';

export const invokeChoiceHandler = (trace: ChoiceTrace, handler: ChoiceTraceHandler) => handler(trace.payload.choices);
export default invokeChoiceHandler;
