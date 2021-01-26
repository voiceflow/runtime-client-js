import { State } from "@voiceflow/runtime";

export type AppConfig = {
    versionID: string;
};

export type AppState = {
    state: State;
    trace: any[];
};
