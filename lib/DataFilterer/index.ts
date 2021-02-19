import { GeneralTrace, TraceType } from '@voiceflow/general-types';

import { VFTypeError } from '@/lib/Common';
import { DataConfig } from '@/lib/types';

import { isValidTraceType, stripSSMLFromSpeak } from './utils';

class DataFilterer {
  private filterTypes = new Set<TraceType>([TraceType.SPEAK, TraceType.VISUAL]);

  private traceFilters: ((trace: GeneralTrace) => GeneralTrace)[] = [];

  constructor(dataConfig?: DataConfig) {
    dataConfig?.includeTypes?.forEach((includeType) => {
      if (!isValidTraceType(includeType)) {
        throw new VFTypeError(`includeType type '${includeType}' is not a valid trace type`);
      }
      this.filterTypes.add(includeType);
    });
    dataConfig?.excludeTypes?.forEach((excludeType) => {
      if (isValidTraceType(excludeType)) {
        this.filterTypes.delete(excludeType);
      }
    });

    // strip ssml tags from speak steps by default
    if (!dataConfig?.ssml) {
      this.traceFilters.push(stripSSMLFromSpeak);
    }
  }

  filterTraces(traces: GeneralTrace[]): GeneralTrace[] {
    return traces
      .filter(({ type }) => this.filterTypes!.has(type))
      .map((trace) => {
        this.traceFilters.forEach((filter) => {
          trace = filter(trace);
        });
        return trace;
      });
  }
}

export default DataFilterer;
