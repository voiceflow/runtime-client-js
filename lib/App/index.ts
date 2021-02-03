import { GeneralRequest, RequestType } from '@voiceflow/general-types';
import { State } from '@voiceflow/runtime';
import axios from 'axios';
import _ from 'lodash';

import Client from '@/lib/Client';
import Context from '@/lib/Context';
import { DataConfig, ResponseContext } from '@/lib/types';

import { DEFAULT_ENDPOINT } from './constants';
import { makeRequestBody } from './utils';

export type AppConfig = {
  versionID: string;
  endpoint?: string;
  dataConfig?: DataConfig;
};

class App {
  private versionID: string; // version ID of the VF project that the SDK communicates with

  private client: Client;

  private dataConfig: DataConfig;

  private cachedInitState: State | null = null;

  private context: Context | null = null;

  constructor({ versionID, endpoint = DEFAULT_ENDPOINT, dataConfig }: AppConfig) {
    this.versionID = versionID;

    const axiosInstance = axios.create({ baseURL: endpoint });
    this.client = new Client(axiosInstance);

    this.dataConfig = {
      tts: false,
      ssml: false,
      includeTypes: [],
      ...dataConfig,
    };
  }

  async start(): Promise<Context> {
    await this.getAppInitialState();
    return this.sendRequest(null);
  }

  async sendText(userInput: string): Promise<Context> {
    if (!userInput?.trim?.()) {
      return this.sendRequest(null);
    }
    return this.sendRequest({ type: RequestType.TEXT, payload: userInput });
  }

  async sendRequest(request: GeneralRequest) {
    if (this.context === null) {
      throw new Error('the context in VFClient.App was not initialized');
    } else if (this.context.isEnding()) {
      throw new Error('VFClient.sendText() was called but the conversation has ended');
    }
    return this.setContext(await this.client.interact(makeRequestBody(this.context!, request, this.dataConfig), this.versionID));
  }

  private async getAppInitialState() {
    if (!this.cachedInitState) {
      this.cachedInitState = await this.client.getAppInitialState(this.versionID);
    }
    this.context = new Context({ request: null, state: this.cachedInitState, trace: [] }, this.dataConfig);
  }

  setContext(contextJSON: ResponseContext): Context {
    this.context = new Context(contextJSON, this.dataConfig);

    return this.context;
  }

  getContext() {
    return this.context;
  }

  getVersion() {
    return this.versionID;
  }
}

export default App;
