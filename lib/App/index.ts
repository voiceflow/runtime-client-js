import { GeneralRequest, GeneralTrace, RequestType, TraceType } from '@voiceflow/general-types';
import { State } from '@voiceflow/runtime';
import axios from 'axios';
import _ from 'lodash';

import Client from '@/lib/Client';
import { InteractRequestBody } from '@/lib/Client/types';
import DataFilterer from '@/lib/DataFilterer';

import { DeepReadonly } from '../Typings';
import { DEFAULT_ENDPOINT } from './constants';
import { AppConfig, AppState, Choice, DataConfig, InternalAppState } from './types';
import VariableManager from '../VariableManager';

export * from './types';

class App<S extends State['variables']> {
  private versionID: string; // version ID of the VF project that the SDK communicates with

  private client: Client;

  private dataConfig: DataConfig;

  private cachedInitAppState: InternalAppState | null = null;

  private appState: InternalAppState | null = null;

  private initVariables: Partial<S> | undefined;

  public variables = new VariableManager<S>(this.getState.bind(this));

  constructor({ versionID, endpoint = DEFAULT_ENDPOINT, variables }: AppConfig<S>) {
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
    };
    this.dataConfig = Object.assign(this.dataConfig, dataConfig);

    this.dataFilterer = new DataFilterer(this.dataConfig);
  }

  get chips(): DeepReadonly<Choice[]> {
    if (this.appState === null) {
      return [];
    }
    return this.appState.trace.reduce<Choice[]>((acc, trace) => (trace.type !== TraceType.CHOICE ? acc : [...acc, ...trace.payload.choices]), []);
  }

  get version(): string {
    return this.versionID;
  }

  async start(): Promise<AppState> {
    await this.getAppInitialState();

    const { state } = this.appState!;
    return this.updateState(await this.client.interact(this.makeRequestBody(state), this.versionID));
  }

  async sendText(userResponse: string): Promise<AppState> {
    if (this.appState === null) {
      throw new Error('VFError: the appState in VFClient.App was not initialized');
    } else if (this.isConversationEnding(this.appState.trace)) {
      throw new Error('VFError: VFClient.sendText() was called but the conversation has ended');
    }

    const { state } = this.appState;
    return this.updateState(await this.client.interact(this.makeRequestBody(state, userResponse), this.versionID));
  }

  private async getAppInitialState() {
    if (this.cachedInitAppState === null) {
      const { variables, ...restState }: State = await this.client.getAppInitialState(this.versionID);
      this.cachedInitAppState = { 
        state: { 
          ...restState, 
          variables: {
            ...variables,
            ...this.initVariables
          }
        }, 
        trace: [] 
      };
    }
    this.appState = _.cloneDeep(this.cachedInitAppState);
  }

  private updateState({ state, trace }: InternalAppState): AppState {
    this.appState = { state, trace };
    return {
      state,
      trace: this.dataFilterer.filter(trace),
      end: this.isConversationEnding(trace),
    };
  }

  private makeRequestBody(state: State, text?: string): InteractRequestBody {
    return {
      state,
      request: this.makeGeneralRequest(text),
      config: { tts: this.dataConfig.tts },
    };
  }

  private makeGeneralRequest(payload?: string): GeneralRequest {
    if (!payload) return null;
    return { type: RequestType.TEXT, payload };
  }

  private isConversationEnding(trace: GeneralTrace[]): boolean {
    return trace.length !== 0 && trace[trace.length - 1].type === TraceType.END;
  }

  private getState() {
    return this.appState
  }
}

export default App;
