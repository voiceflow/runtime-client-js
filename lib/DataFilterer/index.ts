import { GeneralTrace, TraceType } from '@voiceflow/general-types';

import { DataConfig } from '@/lib/types';

import { isValidTraceType, stripSSMLFromSpeak } from './utils';

class DataFilterer {
  private includeTypes = new Set<TraceType>([TraceType.SPEAK]);

  private traceFilters: ((trace: GeneralTrace) => GeneralTrace)[] = [];

  constructor(dataConfig?: DataConfig) {
    dataConfig?.includeTypes!.forEach((includeType) => {
      if (!isValidTraceType(includeType)) {
        throw new TypeError(`includeType type '${includeType}' is not a valid trace type`);
      }
      this.includeTypes.add(includeType);
    });

    if (!dataConfig?.ssml) {
      this.traceFilters.push(stripSSMLFromSpeak);
    }
  }

  filterTraces(traces: GeneralTrace[]): GeneralTrace[] {
    return traces
      .filter(({ type }) => this.includeTypes!.has(type))
      .map((trace) => {
        this.traceFilters.forEach((filter) => {
          trace = filter(trace);
        });
        return trace;
      });
  }
}

export default DataFilterer;
