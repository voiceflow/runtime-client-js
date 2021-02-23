import { State } from '@voiceflow/runtime';
import { AxiosRequestConfig } from 'axios';

import Client from '@/lib/Client';
import RuntimeClient from '@/lib/RuntimeClient';
import { DataConfig } from '@/lib/types';

import { validateVarMerge } from '../Variables/utils';
import { DEFAULT_ENDPOINT } from './constants';

export type FactoryConfig<S extends State['variables']> = {
  versionID: string;
  endpoint?: string;
  dataConfig?: DataConfig;
  variables?: Partial<S>;
  axiosConfig?: AxiosRequestConfig;
};

export class RuntimeClientFactory<S extends Record<string, any> = Record<string, any>> {
  public client: Client<S>;

  private dataConfig: DataConfig;

  private defaultState: State;

  constructor({ versionID, endpoint = DEFAULT_ENDPOINT, dataConfig, variables, axiosConfig }: FactoryConfig<S>) {
    if (variables) {
      validateVarMerge(variables);
    }

    this.client = new Client({ variables, endpoint, versionID, axiosConfig });
    this.defaultState = { stack: [], storage: {}, variables: { ...variables } };

    this.dataConfig = {
      tts: false,
      ssml: false,
      includeTypes: [],
      ...dataConfig,
    };
  }

  createClient(state: State = this.defaultState) {
    return new RuntimeClient<S>(state, { client: this.client, dataConfig: this.dataConfig });
  }
}

export default RuntimeClientFactory;
