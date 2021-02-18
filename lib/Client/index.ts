import { State } from '@voiceflow/runtime';
import axios, { AxiosInstance } from 'axios';
import _cloneDeep from 'lodash/cloneDeep';

import { RequestContext, ResponseContext } from '@/lib/types';

export type ClientConfig<S> = { variables?: Partial<S>; endpoint: string; versionID: string };

class Client<S extends Record<string, any> = Record<string, any>> {
  private axios: AxiosInstance;

  private versionID: string;

  private cachedInitState: State | null = null;

  private initVariables: Partial<S> | undefined;

  constructor({ variables, endpoint, versionID }: ClientConfig<S>) {
    this.axios = axios.create({ baseURL: endpoint });

    this.initVariables = variables;
    this.versionID = versionID;
  }

  async getInitialState(): Promise<State> {
    if (!this.cachedInitState) {
      const { variables, ...restState } = await this.axios.get(`/interact/${this.versionID}/state`).then((response) => response.data);
      this.cachedInitState = {
        ...restState,
        variables: {
          ...variables,
          ...this.initVariables,
        },
      };
    }
    return _cloneDeep(this.cachedInitState!);
  }

  async interact(body: RequestContext): Promise<ResponseContext> {
    return this.axios.post(`/interact/${this.versionID}`, body).then((response) => response.data);
  }

  getVersionID() {
    return this.versionID;
  }
}

export default Client;
