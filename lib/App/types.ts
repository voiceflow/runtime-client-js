import { State } from "@voiceflow/runtime";
import { GeneralTrace } from "@voiceflow/general-types";

export type AppConfig = {
    versionID: string;
};

export type AppState = {
    state: State;
    trace: GeneralTrace[];
};
