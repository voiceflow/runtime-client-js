import Client from "@/lib/Client";
import { AppConfig } from "./types";
import { State } from '@voiceflow/runtime';
import _ from "lodash"

class App {
    private versionID: string;                      // version ID of the VF project that the SDK communicates with
    private client: Client;
    private cachedInitialState: State | null = null;
    // private state: State | null = null;

    constructor({ versionID }: AppConfig) {
        this.versionID = versionID;
        this.client = new Client({
            GENERAL_RUNTIME_ENDPOINT_URL: 'https://localhost:4000'  // $TODO - Add a config system appropriate for production
        });
    }

    async start() {
        await this.initializeDiagramID();
    }

    private async initializeDiagramID() {
        if (this.cachedInitialState === null) {
            this.cachedInitialState = await this.client.getAppInitialState(this.versionID);
        };
        // this.state = _.cloneDeep(this.cachedInitialState);
    }
}

export default App;