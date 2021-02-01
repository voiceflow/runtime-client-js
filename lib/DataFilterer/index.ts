import { GeneralTrace, TraceType } from "@voiceflow/general-types";
import { DataConfig } from "../App/types";
import { SSML_TAG_REGEX } from "./constants";

class DataFilterer {
  private dataConfig: DataConfig;
  private validTraceTypes = Object.keys(TraceType);

  constructor(dataConfig: DataConfig) {
    this.dataConfig = dataConfig;

    this.dataConfig.includeTypes!.forEach(includeType => {
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

    if (!this.dataConfig.tts) {
      traces = traces.map(this.stripTTSFromSpeak);
    }

    return traces;
  };

  private stripSSMLFromSpeak(trace: GeneralTrace): GeneralTrace {
    return trace.type !== TraceType.SPEAK
        ? trace
        : {
        ...trace,
        payload: {
            ...trace.payload,
            message: trace.payload.message.replace(SSML_TAG_REGEX, ''),
        }
    };
  }
  
  private stripTTSFromSpeak(trace: GeneralTrace): GeneralTrace {
    if (trace.type !== TraceType.SPEAK) {
        return trace;
    }
    const strippedTrace = {
        ...trace,
        payload: {
            ...trace.payload
        }
    }
    delete strippedTrace.payload.src;
    return strippedTrace;
  }
};

export default DataFilterer;
