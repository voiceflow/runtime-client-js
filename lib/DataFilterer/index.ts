import { GeneralTrace, TraceType } from '@voiceflow/general-types';

import { DataConfig } from '../App/types';
import { SSML_TAG_REGEX } from './constants';

class DataFilterer {
  private dataConfig: DataConfig;

  private validTraceTypes = Object.keys(TraceType);

  constructor(dataConfig: DataConfig) {
    this.dataConfig = dataConfig;

    this.dataConfig.includeTypes!.forEach((includeType) => {
      if (!this.validTraceTypes.includes(includeType.toUpperCase())) {
        throw new TypeError(`includeType type '${includeType}' does not match valid trace type`);
      }
    });

    if (!this.dataConfig.includeTypes!.includes(TraceType.SPEAK)) {
      this.dataConfig.includeTypes!.push(TraceType.SPEAK);
    }
  }

  filter(traces: GeneralTrace[]): GeneralTrace[] {
    traces = traces.filter(({ type }) => this.dataConfig.includeTypes!.includes(type));

    if (!this.dataConfig.ssml) {
      traces = traces.map(this.stripSSMLFromSpeak);
    }

    return traces;
  }

  private stripSSMLFromSpeak(trace: GeneralTrace): GeneralTrace {
    return trace.type !== TraceType.SPEAK
      ? trace
      : {
          ...trace,
          payload: {
            ...trace.payload,
            message: trace.payload.message.replace(SSML_TAG_REGEX, ''),
          },
        };
  }
}

export default DataFilterer;
