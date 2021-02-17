import { GeneralTrace, TraceType } from '@voiceflow/general-types';

import { VFTypeError } from '@/lib/Common';
import { DataConfig } from '@/lib/types';

import { isValidTraceType, stripSSMLFromSpeak } from './utils';

class DataFilterer {
  private includeTypes = new Set<TraceType>([TraceType.SPEAK]);

  private traceFilters: ((trace: GeneralTrace) => GeneralTrace)[] = [];

  constructor(dataConfig?: DataConfig) {
    dataConfig?.includeTypes?.forEach((includeType) => {
      if (!isValidTraceType(includeType)) {
        throw new VFTypeError(`includeType type '${includeType}' is not a valid trace type`);
      }
      this.includeTypes.add(includeType);
    });

    // strip ssml tags from speak steps by default
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
