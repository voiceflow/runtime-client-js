import { State } from "@voiceflow/runtime";
import { GeneralRequest, GeneralTrace } from "@voiceflow/general-types";

export type InteractResponse = {
    state: State;
    request: GeneralRequest;
    trace: GeneralTrace[];
};

export type InteractRequestBody = { 
    state: State;
    request: GeneralRequest 
};
