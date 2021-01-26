import { State } from "@voiceflow/runtime";
import { GeneralRequest, GeneralTrace } from "@voiceflow/general-types";

export type ClientConfig = {
    GENERAL_RUNTIME_ENDPOINT_URL: string;
};

export type InteractResponse = {
    state: State;
    request: GeneralRequest;
    trace: GeneralTrace[];
};
