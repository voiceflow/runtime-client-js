import { TraceType } from '@voiceflow/general-types';

import { AppContext, Choice, DataConfig } from '@/lib/types';

class Context {
  constructor(private context: AppContext, private dataConfig: DataConfig) {}

  getChips(): Choice[] {
    if (this.context === null) {
      return [];
    }
    return this.context.trace.reduce<Choice[]>((acc, trace) => (trace.type !== TraceType.CHOICE ? acc : [...acc, ...trace.payload.choices]), []);
  }

  get request() {
    return this.context.request;
  }

  get trace() {
    return this.context.trace;
  }

  getJSON() {
    return this.context;
  }

  isEnding(): boolean {
    return this.context.trace.some((trace) => trace.type === TraceType.END);
  }
}

export default Context;
