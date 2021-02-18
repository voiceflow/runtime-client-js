import { State } from '@voiceflow/runtime';

import RuntimeClient from '@/lib/RuntimeClient';
import Client from '@/lib/Client';
import { DataConfig } from '@/lib/types';

import { validateVarMerge } from '../Variables/utils';
import { DEFAULT_ENDPOINT } from './constants';

export type FactoryConfig<S extends State['variables']> = {
  versionID: string;
  endpoint?: string;
  dataConfig?: DataConfig;
  variables?: Partial<S>;
};

export class RuntimeClientFactory<S extends Record<string, any> = Record<string, any>> {
  public client: Client;

  private dataConfig: DataConfig;

  private defaultState: State;

  constructor({ versionID, endpoint = DEFAULT_ENDPOINT, dataConfig, variables }: FactoryConfig<S>) {
    if (variables) {
      validateVarMerge(variables);
    }

    this.client = new Client<S>({ variables, endpoint, versionID });
    this.defaultState = { stack: [], storage: {}, variables: { ...variables } };

    this.dataConfig = {
      tts: false,
      ssml: false,
      includeTypes: [],
      ...dataConfig,
    };
  }

  createClient(state: State = this.defaultState) {
    return new RuntimeClient(state, { client: this.client, dataConfig: this.dataConfig });
  }
}

export default RuntimeClientFactory;
