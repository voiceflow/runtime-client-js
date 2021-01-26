import Client from "@/lib/Client";
import { AppConfig, AppState, InternalAppState } from "./types";
import _ from "lodash"
import { State } from "@voiceflow/runtime";
import { GeneralTrace, GeneralRequest, RequestType } from "@voiceflow/general-types";
import { InteractRequestBody } from "../Client/type";

class App {
    private versionID: string;                      // version ID of the VF project that the SDK communicates with
    private client: Client;
    private cachedInitAppState: InternalAppState | null = null;
    private appState: InternalAppState | null = null;

    constructor({ versionID }: AppConfig) {
        this.versionID = versionID;
        this.client = new Client({
            GENERAL_RUNTIME_ENDPOINT_URL: 'https://localhost:4000'  // $TODO - Add a config system appropriate for production
        });
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

    private async getAppInitialState(forcePull = false) {
        if (forcePull || this.cachedInitAppState === null) {
            const initialState: State = await this.client.getAppInitialState(this.versionID);
            this.cachedInitAppState = { state: initialState, trace: [] }; 
        };
        this.appState = _.cloneDeep(this.cachedInitAppState);
    }

    private updateState({ state, trace }: InternalAppState): AppState {
        this.appState = { state, trace: this.filterTraces(trace) };
        return { ...this.appState, end: this.isConversationEnding(trace) }
    }

    private makeRequestBody(text?: string): InteractRequestBody {
        if (this.appState === null) {
            throw new Error("this.state in VFClient.App was not set");
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

    private filterTraces(trace: GeneralTrace[]): GeneralTrace[] {
        return trace.filter(({ type }) => (
            type !== 'flow' && type !== 'block' && type !== 'end'
        ));
    }

    private isConversationEnding(trace: GeneralTrace[]): boolean {
        return trace.length !== 0 && trace[trace.length - 1].type === 'end';
    }
}

export default App;