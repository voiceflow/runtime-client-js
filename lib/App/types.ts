import { State } from "@voiceflow/runtime";
import { GeneralTrace } from "@voiceflow/general-types";

export type AppConfig = {
    versionID: string;
};

export type InternalAppState = {
    state: State;
    trace: GeneralTrace[];
};

export type AppState = InternalAppState & {
    end: boolean;
};
