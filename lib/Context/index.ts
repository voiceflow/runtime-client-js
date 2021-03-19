import { Choice, ResponseContext, TraceType } from '@/lib/types';

import VariableManager from '../Variables';

export class Context<S extends Record<string, any> = Record<string, any>> {
  public variables = new VariableManager<S>(this.toJSON.bind(this), this.setVariables.bind(this));

  constructor(private context: ResponseContext) {}

  getChips(): Choice[] {
    return this.context.trace.reduce<Choice[]>((acc, trace) => (trace.type !== TraceType.CHOICE ? acc : [...acc, ...trace.payload.choices]), []);
  }

  // returns the entire unfiltered list of traces of the context; can configure whether trace data should be sanitized or not
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

  public setStorage(key: string, data: string[]) {
    this.context = {
      ...this.context,
      state: {
        ...this.context.state,
        storage: {
          ...this.context.state.storage,
          [key]: data,
        },
      },
    };
  }

  public clearStorage(key: string) {
    const { storage } = this.context.state;
    this.context = {
      ...this.context,
      state: {
        ...this.context.state,
        storage: Object.keys(storage).reduce<Record<string, any>>((acc, _key) => {
          if (_key !== key) acc[_key] = storage[_key];
          return acc;
        }, {}),
      },
    };
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
