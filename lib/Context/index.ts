import { TraceType } from '@voiceflow/general-types';

import DataFilterer from '@/lib/DataFilterer';
import { AppContext, Choice, DataConfig } from '@/lib/types';

class Context {
  dataFilterer: DataFilterer;

  constructor(private context: AppContext, dataConfig?: DataConfig) {
    this.dataFilterer = new DataFilterer(dataConfig);
  }

  get chips(): Choice[] {
    if (this.context === null) {
      return [];
    }
    return this.context.trace.reduce<Choice[]>((acc, trace) => (trace.type !== TraceType.CHOICE ? acc : [...acc, ...trace.payload.choices]), []);
  }

  // returns the filtered trace
  get response() {
    return this.dataFilterer.filterTraces(this.context.trace);
  }

  // returns the entire raw trace of the context
  get trace() {
    return this.context.trace;
  }

  get end(): boolean {
    return this.context.trace.some((trace) => trace.type === TraceType.END);
  }

  // returns the raw context object
  getJSON() {
    return this.context;
  }

  isEnding(): boolean {
    return this.end;
  }
}

export default Context;
