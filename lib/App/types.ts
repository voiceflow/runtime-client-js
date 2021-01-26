import { State } from "@voiceflow/runtime";
import { GeneralTrace } from "@voiceflow/general-types";
import { DeepReadonly } from "../Typings";

export type AppConfig = {
    versionID: string;
};

export type InternalAppState = {
    state: State;
    trace: GeneralTrace[];
};

export type AppState = DeepReadonly<InternalAppState & {
    end: boolean;
}>;
