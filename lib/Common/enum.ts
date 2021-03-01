import { TraceEvent, TraceType } from '../types';

export const validTraceTypes = new Set(Object.keys(TraceType));

export const isValidTraceType = (type: string): type is TraceType => validTraceTypes.has(type.toUpperCase());

export const validTraceEvents = new Set(Object.keys(TraceEvent));

export const isValidTraceEvent = (event: string): event is TraceEvent => validTraceEvents.has(event.toUpperCase());

export const isGeneralTraceEvent = (event: string): event is TraceEvent.GENERAL => event === TraceEvent.GENERAL;
