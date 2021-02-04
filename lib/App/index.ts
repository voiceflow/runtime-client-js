import { GeneralRequest, RequestType } from '@voiceflow/general-types';
import { State } from '@voiceflow/runtime';
import axios from 'axios';
import _ from 'lodash';

import Client from '@/lib/Client';
import Context from '@/lib/Context';
import { DataConfig, ResponseContext } from '@/lib/types';
import { VFClientError } from "@/lib/Common"

import VariableManager from '../Variables';
import { DEFAULT_ENDPOINT } from './constants';
import { makeRequestBody } from './utils';

export type AppConfig<S extends State['variables']> = {
  versionID: string;
  endpoint?: string;
  dataConfig?: DataConfig;
  variables?: Partial<S>;
};

class App<S extends State['variables']> {
  private versionID: string; // version ID of the VF project that the SDK communicates with

  private client: Client;

  private dataConfig: DataConfig;

  private cachedInitState: State | null = null;

  private context: Context | null = null;

  public variables = new VariableManager<S>(this.internalGetState.bind(this));

  private initVariables: Partial<S> | undefined;

  constructor({ versionID, endpoint = DEFAULT_ENDPOINT, dataConfig, variables }: AppConfig<S>) {
    this.versionID = versionID;

    if (variables) {
      this.variables.validateInitialVars(variables);
    }
    this.initVariables = variables;

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
      throw new VFClientError('the context in VFClient.App was not initialized');
    } else if (this.context.isEnding()) {
      throw new VFClientError('VFClient.sendText() was called but the conversation has ended');
    }
    return this.setContext(await this.client.interact(makeRequestBody(this.context!, request, this.dataConfig), this.versionID));
  }

  private async getAppInitialState() {
    if (!this.cachedInitState) {
      const { variables, ...restState } = await this.client.getAppInitialState(this.versionID);
      this.cachedInitState = {
        ...restState,
        variables: {
          ...variables,
          ...this.initVariables,
        },
      };
    }
    this.context = new Context({ request: null, state: _.cloneDeep(this.cachedInitState), trace: [] }, this.dataConfig);
  }

  setContext(contextJSON: ResponseContext): Context {
    this.context = new Context(contextJSON, this.dataConfig);

    return this.context;
  }

  getContext() {
    return this.context;
  }

  getVersionID() {
    return this.versionID;
  }

  private internalGetState() {
    return this.context?.toJSON() ?? null;
  }
}

export default App;
