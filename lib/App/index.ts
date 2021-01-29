import { GeneralRequest, GeneralTrace, RequestType, SpeakTrace, TraceType } from '@voiceflow/general-types';
import { State } from '@voiceflow/runtime';
import axios from 'axios';
import _ from 'lodash';

import Client from '@/lib/Client';
import { InteractRequestBody } from '@/lib/Client/type';

import { DeepReadonly } from '../Typings';
import { SSML_TAG_REGEX } from './constants';
import { AppConfig, AppState, Choice, InternalAppState } from './types';

class App {
  private versionID: string; // version ID of the VF project that the SDK communicates with

  private client: Client;

  private cachedInitAppState: InternalAppState | null = null;

  private appState: InternalAppState | null = null;

  constructor({ versionID }: AppConfig) {
    this.versionID = versionID;

    const axiosInstance = axios.create({ baseURL: 'https://localhost:4000' });
    this.client = new Client(axiosInstance);
  }

  get chips(): DeepReadonly<Choice[]> {
    if (this.appState === null) {
      return [];
    }
    return this.appState.trace.reduce<Choice[]>((acc, trace) => (trace.type !== TraceType.CHOICE ? acc : [...acc, ...trace.payload.choices]), []);
  }

  async start(): Promise<AppState> {
    await this.getAppInitialState();

    const { state } = this.appState!;
    return this.updateState(await this.client.interact(this.makeRequestBody(state), this.versionID));
  }

  async sendText(userResponse: string): Promise<AppState> {
    if (this.appState === null) {
      throw new Error('the appState in VFClient.App was not initialized');
    } else if (this.isConversationEnding(this.appState.trace)) {
      throw new Error('VFClient.sendText() was called but the conversation has ended');
    }

    const { state } = this.appState;
    return this.updateState(await this.client.interact(this.makeRequestBody(state, userResponse), this.versionID));
  }

  private async getAppInitialState() {
    if (this.cachedInitAppState === null) {
      const initialState: State = await this.client.getAppInitialState(this.versionID);
      this.cachedInitAppState = { state: initialState, trace: [] };
    }
    this.appState = _.cloneDeep(this.cachedInitAppState);
  }

  private updateState({ state, trace }: InternalAppState): AppState {
    this.appState = { state, trace };
    return {
      state,
      trace: this.filterTraces(trace).map(this.stripSSMLFromSpeak),
      end: this.isConversationEnding(trace),
    };
  }

  private makeRequestBody(state: State, text?: string): InteractRequestBody {
    return {
      state,
      request: this.makeGeneralRequest(text),
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
      },
    };
  }

  private isConversationEnding(trace: GeneralTrace[]): boolean {
    return trace.length !== 0 && trace[trace.length - 1].type === TraceType.END;
  }
}

export default App;
