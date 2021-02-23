import { DataConfig, GeneralTrace } from '@/lib/types';

import { stripSSMLFromSpeak } from './utils';

class DataFilterer {
  private traceFilters: ((trace: GeneralTrace) => GeneralTrace)[] = [];

  constructor(dataConfig?: DataConfig) {
    // strip ssml tags from speak steps by default
    if (!dataConfig?.ssml) {
      this.traceFilters.push(stripSSMLFromSpeak);
    }
  }

  sanitizeTraces(traces: GeneralTrace[]): GeneralTrace[] {
    return traces.map((trace) => {
      this.traceFilters.forEach((filter) => {
        trace = filter(trace);
      });
      return trace;
    });
  }

  filterTraces(traces: GeneralTrace[]): GeneralTrace[] {
    return this.sanitizeTraces(traces);
  }
}

export default DataFilterer;
