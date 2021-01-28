import { GeneralTrace, TraceType } from "@voiceflow/general-types";

class DataFilterer {
  private validTraceTypes = Object.keys(TraceType);
  private includeTypes: string[];

  constructor(includeTypes: string[]) {
    this.includeTypes = includeTypes;

    this.includeTypes.forEach(includeType => {
      if (!this.validTraceTypes.includes(includeType.toUpperCase())) {
          throw new TypeError(`includeType type '${includeType}' does not match valid trace type`);
      }
    });

    if (!this.includeTypes.includes(TraceType.SPEAK)) {
      this.includeTypes.push(TraceType.SPEAK);
    }
  }

  filter(traces: GeneralTrace[]): GeneralTrace[] {
    return traces.filter(({ type }) => this.includeTypes.includes(type));
  };
};

export default DataFilterer;
