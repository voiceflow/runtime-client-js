import { State } from '@voiceflow/runtime';

import Agent from '@/lib/Agent';
import Client from '@/lib/Client';
import { DataConfig } from '@/lib/types';

import { validateVarMerge } from '../Variables/utils';
import { DEFAULT_ENDPOINT } from './constants';

export type AppConfig<S extends State['variables']> = {
  versionID: string;
  endpoint?: string;
  dataConfig?: DataConfig;
  variables?: Partial<S>;
};

export class App<S extends Record<string, any> = Record<string, any>> {
  public client: Client;

  private dataConfig: DataConfig;

  constructor({ versionID, endpoint = DEFAULT_ENDPOINT, dataConfig, variables }: AppConfig<S>) {
    if (variables) {
      validateVarMerge(variables);
    }

    this.client = new Client<S>({ variables, endpoint, versionID });

    this.dataConfig = {
      tts: false,
      ssml: false,
      includeTypes: [],
      ...dataConfig,
    };
  }

  async createAgent(state?: State) {
    if (!state) {
      state = await this.client.getInitialState();
    }
    return new Agent(state, { client: this.client, dataConfig: this.dataConfig });
  }
}

export default App;
