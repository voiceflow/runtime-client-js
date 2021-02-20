import { TraceType } from '../types';

export const validTraceTypes = new Set(Object.keys(TraceType));

export class VFClientError extends Error {
  constructor(message: string) {
    super(`VFError: ${message}`);
  }
}

export class VFTypeError extends VFClientError {
  constructor(message: string) {
    super(message);
  }
}

export default {
  validTraceTypes,
  VFClientError,
  VFTypeError,
};
