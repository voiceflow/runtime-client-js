import { State } from '@voiceflow/runtime';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import _cloneDeep from 'lodash/cloneDeep';
import VError from '@voiceflow/verror';

import { RequestContext, ResponseContext } from '@/lib/types';

import { adaptResponseContext, extractAudioStep } from './adapters';

export type ClientConfig<S> = { variables?: Partial<S>; endpoint: string; versionID: string; apiKey: string; axiosConfig?: AxiosRequestConfig };

export class Client<S extends Record<string, any> = Record<string, any>> {
  private axios: AxiosInstance;

  private versionID: string;

  private cachedInitState: State | null = null;

  private initVariables: Partial<S> | undefined;

  constructor({ variables, endpoint, versionID, apiKey, axiosConfig }: ClientConfig<S>) {
    if (!Client.isAPIKey(apiKey)) {
      throw new VError('Invalid API key', VError.HTTP_STATUS.UNAUTHORIZED);
    }

    this.axios = axios.create({ ...axiosConfig, baseURL: endpoint, headers: { authorization: apiKey } });

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
    return this.axios
      .post(`/interact/${this.versionID}`, body)
      .then((response) => response.data)
      .then((context) => adaptResponseContext(context))
      .then((context) => extractAudioStep(context));
  }

  getVersionID() {
    return this.versionID;
  }

  static isAPIKey(authorization?: string): boolean {
    return !!authorization && authorization.startsWith('VF.') && authorization.match(/\./g)!.length === 2;
  }
}

export default Client;
