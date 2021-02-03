import { TraceType } from '@voiceflow/general-types';

import DataFilterer from '@/lib/DataFilterer';
import { Choice, DataConfig, ResponseContext } from '@/lib/types';

class Context {
  private dataFilterer: DataFilterer;

  constructor(private context: ResponseContext, dataConfig?: DataConfig) {
    this.dataFilterer = new DataFilterer(dataConfig);
  }

  getChips(): Choice[] {
    return this.context.trace.reduce<Choice[]>((acc, trace) => (trace.type !== TraceType.CHOICE ? acc : [...acc, ...trace.payload.choices]), []);
  }

  // returns the filtered trace
  getResponse() {
    return this.dataFilterer.filterTraces(this.context.trace);
  }

  // returns the entire raw trace of the context
  getTrace() {
    return this.context.trace;
  }

  // returns the raw context object
  toJSON() {
    return this.context;
  }

  isEnding(): boolean {
    return this.context.trace.some((trace) => trace.type === TraceType.END);
  }
}

export default Context;
