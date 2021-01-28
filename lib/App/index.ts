import Client from "@/lib/Client";
import { AppConfig, AppState, InternalAppState } from "./types";
import _ from "lodash"
import { State } from "@voiceflow/runtime";
import { TraceType, GeneralTrace, GeneralRequest, RequestType, SpeakTrace } from "@voiceflow/general-types";
import { InteractRequestBody } from "@/lib/Client/type";
import { SSML_TAG_REGEX } from "./constants";
import axios from "axios";

class App {
    private versionID: string;                      // version ID of the VF project that the SDK communicates with
    private client: Client;
    private cachedInitAppState: InternalAppState | null = null;
    private appState: InternalAppState | null = null;

    constructor({ versionID }: AppConfig) {
        this.versionID = versionID;

        const axiosInstance = axios.create({ baseURL: 'https://localhost:4000' });
        this.client = new Client(axiosInstance);
    }

    async start(): Promise<AppState> {
        await this.getAppInitialState();
        return this.updateState(
            await this.client.interact(this.makeRequestBody(), this.versionID)
        );
    }

    async sendText(userResponse: string): Promise<AppState> {
        return this.updateState(
            await this.client.interact(this.makeRequestBody(userResponse), this.versionID)
        );
    }

    private async getAppInitialState() {
        if (this.cachedInitAppState === null) {
            const initialState: State = await this.client.getAppInitialState(this.versionID);
            this.cachedInitAppState = { state: initialState, trace: [] }; 
        }
        this.appState = _.cloneDeep(this.cachedInitAppState);
    }

    private updateState({ state, trace }: InternalAppState): AppState {
        this.appState = { state, trace: this.filterTraces(trace).map(this.stripSSMLFromSpeak) };
        return { ...this.appState, end: this.isConversationEnding(trace) }
    }

    private makeRequestBody(text?: string): InteractRequestBody {
        if (this.appState === null) {
            throw new Error("the appState in VFClient.App was not initialized");
        }

        return {
            state: this.appState.state,
            request: this.makeGeneralRequest(text)
        };
    }

    private makeGeneralRequest(payload?: string): GeneralRequest {
        if (!payload) return null;
        return { type: RequestType.TEXT, payload };
    }

    private filterTraces(traces: GeneralTrace[]) {
        return traces.filter(({ type }) => type === TraceType.SPEAK) as SpeakTrace[];
    }

    private stripSSMLFromSpeak(trace: SpeakTrace): GeneralTrace {
        return {
            ...trace,
            payload: {
                ...trace.payload,
                message: trace.payload.message.replace(SSML_TAG_REGEX, ''),
            }
        };
    }

    private isConversationEnding(trace: GeneralTrace[]): boolean {
        return trace.length !== 0 && trace[trace.length - 1].type === TraceType.END;
    }
}

export default App;