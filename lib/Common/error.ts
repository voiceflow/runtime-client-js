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
