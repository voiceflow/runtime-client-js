import { GeneralRequest, RequestType } from '@voiceflow/general-types';
import { State } from '@voiceflow/runtime';
import axios from 'axios';
import _ from 'lodash';

import Client from '@/lib/Client';
import { VFClientError } from '@/lib/Common';
import Context from '@/lib/Context';
import { DataConfig, ResponseContext } from '@/lib/types';

import { validateVarMerge } from '../Variables/utils';
import { DEFAULT_ENDPOINT } from './constants';
import { makeRequestBody } from './utils';

export type AppConfig<S extends State['variables']> = {
  versionID: string;
  endpoint?: string;
  dataConfig?: DataConfig;
  variables?: Partial<S>;
};

/**
 * Represents a Voiceflow application and serves as the primary interface for sending user input
 * to a runtime server and receiving the response.
 */
class RuntimeClient<S extends Record<string, any> = Record<string, any>> {
  /**
   * Version ID of the VF project that the SDK communicates with
   */
  private versionID: string;

  /**
   * Module that handles constructing and sending HTTP requests, as well as receiving and unpackaging HTTP responses
   */
  private client: Client;

  /**
   * Internal copy of the `dataConfig` settings passed in at initialization
   */
  private dataConfig: DataConfig;

  /**
   * Local copy of the initial Voiceflow app state. This is cloned to avoid repeated HTTP requests for the same initial state.
   */
  private cachedInitState: State | null = null;

  /**
   * Local copy of the current VF application context
   */
  private context: Context<S> | null = null;

  /**
   * Internal copy of the `variables` configuration passed in at initialization.
   */
  private initVariables: Partial<S> | undefined;

  /**
   * Constructs a `RuntimeClient` instance
   *
   * @param appConfig Configuration options for the `RuntimeClient` (see [[`AppConfig<S>`]]).
   *
   * @category Constructor
   */
  constructor({ versionID, endpoint = DEFAULT_ENDPOINT, dataConfig, variables }: AppConfig<S>) {
    this.versionID = versionID;

    if (variables) {
      validateVarMerge(variables);
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

  /**
   * Begins a conversation session with the Voiceflow app
   *
   * @returns a [[Context]] object representing the current app state
   *
   * @category Interaction
   */
  async start(): Promise<Context<S>> {
    await this.getAppInitialState();
    return this.sendRequest(null);
  }

  /**
   * Sends the `userInput` to the runtime server and advance the conversation state
   *
   * @param userInput The user's response to the voice app
   *
   * @returns a [[Context]] object representing the current app state
   *
   * @category Interaction
   */
  async sendText(userInput: string): Promise<Context<S>> {
    if (!userInput?.trim?.()) {
      return this.sendRequest(null);
    }
    return this.sendRequest({ type: RequestType.TEXT, payload: userInput });
  }

  /**
   * Sends the `request` to the runtime server and advanced the conversation state.
   *
   * @param request The request object that must be sent to the runtime server
   *
   * @returns a [[Context]] object representing the current app state
   *
   * @category Interaction
   */
  async sendRequest(request: GeneralRequest) {
    if (this.context === null) {
      throw new VFClientError('the context in VFClient.App was not initialized');
    } else if (this.context.isEnding()) {
      throw new VFClientError('VFClient.sendText() was called but the conversation has ended');
    }
    this.setContext(await this.client.interact(makeRequestBody(this.context!, request, this.dataConfig), this.versionID));

    if (this.dataConfig.traceProcessor) {
      this.context.getResponse().forEach(this.dataConfig.traceProcessor);
    }

    return this.context;
  }

  /**
   * Initializes the `RuntimeClient`'s initial Voiceflow app state for the first request to the runtime servers.
   *
   * @category Internal Helper
   */
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

  /**
   * Updates the internal Voiceflow app state to be `contextJSON`
   *
   * @param contextJSON The new app state
   *
   * @category Getter & Setter
   */
  setContext(contextJSON: ResponseContext) {
    this.context = new Context(contextJSON, this.dataConfig);
  }

  /**
   * @returns a [[Context]] object representing the current app state
   *
   * @category Getter & Setter
   */
  getContext() {
    return this.context;
  }

  /**
   * @returns The versionID of the Voiceflow app that is being executed.
   *
   * @category Getter & Setter
   */
  getVersionID() {
    return this.versionID;
  }
}

export default RuntimeClient;
