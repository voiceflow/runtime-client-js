import DataFilterer from '@/lib/DataFilterer';
import { Choice, DataConfig, ResponseContext, TraceType } from '@/lib/types';

import VariableManager from '../Variables';

export type GetTraceOptions = {
  sanitize?: boolean;
};

export class Context<S extends Record<string, any> = Record<string, any>> {
  private dataFilterer: DataFilterer;

  public variables = new VariableManager<S>(this.toJSON.bind(this), this.setVariables.bind(this));

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

  // returns the entire unfiltered list of traces of the context; can configure whether trace data should be sanitized or not
  getTrace(options: GetTraceOptions = {}) {
    const { sanitize = true } = options;

    let result = this.context.trace;
    if (sanitize) result = this.dataFilterer.sanitizeTraces(result);

    return result;
  }

  // returns the raw context object
  toJSON() {
    return this.context;
  }

  isEnding(): boolean {
    return this.context.trace.some((trace) => trace.type === TraceType.END);
  }

  private setVariables(newValues: Partial<S>) {
    this.context = {
      ...this.context,
      state: {
        ...this.context.state,
        variables: {
          ...this.context.state.variables,
          ...newValues,
        },
      },
    };
  }
}

export default Context;
