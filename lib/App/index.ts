import Client from "@/lib/Client";
import { AppConfig, AppState } from "./types";
import _ from "lodash"
import { State } from "@voiceflow/runtime";

class App {
    private versionID: string;                      // version ID of the VF project that the SDK communicates with
    private client: Client;
    private cachedInitAppState: AppState | null = null;
    private appState: AppState | null = null;

    constructor({ versionID }: AppConfig) {
        this.versionID = versionID;
        this.client = new Client({
            GENERAL_RUNTIME_ENDPOINT_URL: 'https://localhost:4000'  // $TODO - Add a config system appropriate for production
        });
    }

    async start() {
        await this.initialAppState();
        return this.updateState(
            await this.client.interact(this.makeRequestBody(), this.versionID)
        );
    }

    async sendText(userResponse: string) {
        return this.updateState(
            await this.client.interact(this.makeRequestBody(userResponse), this.versionID)
        );
    }

    private async initialAppState() {
        if (this.cachedInitAppState !== null) return;

        const initialState: State = await this.client.getAppInitialState(this.versionID);
        this.cachedInitAppState = { state: initialState, trace: [] };
        this.appState = _.cloneDeep(this.cachedInitAppState);
    }

    private updateState({ state, trace }: AppState) {
        this.appState = { state, trace: this.filterTraces(trace) };
        return this.appendEndAttribute(this.appState);
    }

    private makeRequestBody(text?: string) {
        if (this.appState === null) throw new Error("this.state in VFClient.App was not set");
        return {
            state: this.appState.state,
            request: this.makeRequest(text)
        };
    }

    private makeRequest(payload?: string) {
        if (!payload) return null;
        return { type: 'text', payload };
    }

    private filterTraces(trace: any[]) {
        return trace.filter(({ type }) => (
            type !== 'flow' && type !== 'block'
        ));
    }

    private appendEndAttribute(newState: AppState) {
        const { trace } = newState;
        return { ...newState, end: trace.length !== 0 && trace[trace.length - 1].type === 'end' }
    }
}

export default App;