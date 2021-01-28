import Client from "@/lib/Client";
import { AppConfig, AppState, DataConfig, InternalAppState } from "./types";
import _ from "lodash"
import { State } from "@voiceflow/runtime";
import { TraceType, GeneralTrace, GeneralRequest, RequestType } from "@voiceflow/general-types";
import { InteractRequestBody } from "@/lib/Client/type";
import { SSML_TAG_REGEX } from "./constants";
import axios from "axios";
import DataFilterer from '@/lib/DataFilterer'

class App {
    private versionID: string;                      // version ID of the VF project that the SDK communicates with
    private dataConfig: DataConfig;
    private client: Client;
    private cachedInitAppState: InternalAppState | null = null;
    private appState: InternalAppState | null = null;
    private dataFilterer: DataFilterer;

    constructor({ versionID, dataConfig }: AppConfig) {
        this.versionID = versionID;
        this.dataConfig = {
            hasTTS: true,
            showSSML: false,
        };
        this.dataConfig = Object.assign(this.dataConfig, dataConfig);
        
        this.dataFilterer = new DataFilterer(this.dataConfig.includeTypes ? this.dataConfig.includeTypes : []);

        const axiosInstance = axios.create({ baseURL: 'https://localhost:4000' });
        this.client = new Client(axiosInstance);
    }

    async start(): Promise<AppState> {
        await this.getAppInitialState();

        const { state } = this.appState!;
        return this.updateState(
            await this.client.interact(this.makeRequestBody(state), this.versionID)
        );
    }

    async sendText(userResponse: string): Promise<AppState> {
        if (this.appState === null) {
            throw new Error("the appState in VFClient.App was not initialized");
        } else if (this.isConversationEnding(this.appState.trace)) {
            throw new Error("VFClient.sendText() was called but the conversation has ended");
        }

        const { state } = this.appState;
        return this.updateState(
            await this.client.interact(this.makeRequestBody(state, userResponse), this.versionID)
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
        this.appState = { state, trace: this.filterTraces(trace) };
        if (!this.dataConfig.showSSML) {
            this.appState.trace = this.appState.trace.map(this.stripSSMLFromSpeak);
        }

        if (!this.dataConfig.hasTTS) {
            this.appState.trace = this.appState.trace.map(this.stripTTSFromSpeak);
        }

        return { ...this.appState, end: this.isConversationEnding(trace) }
    }
    
    private makeRequestBody(state: State, text?: string): InteractRequestBody {
        return {
            state,
            request: this.makeGeneralRequest(text)
        };
    }

    private makeGeneralRequest(payload?: string): GeneralRequest {
        if (!payload) return null;
        return { type: RequestType.TEXT, payload };
    }

    private filterTraces(traces: GeneralTrace[]) {
        return this.dataFilterer.filter(traces);
    }

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

    private isConversationEnding(trace: GeneralTrace[]): boolean {
        return trace.length !== 0 && trace[trace.length - 1].type === TraceType.END;
    }
}

export default App;