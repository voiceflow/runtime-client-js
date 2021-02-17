import { State } from '@voiceflow/runtime';
import { AxiosInstance } from 'axios';

import { RequestContext, ResponseContext } from '@/lib/types';
import { adaptResponseContext } from "./adapters";

class Client {
  private axios: AxiosInstance;

  constructor(axios: AxiosInstance) {
    this.axios = axios;
  }

  async getAppInitialState(versionID: string): Promise<State> {
    return this.axios.get(`/interact/${versionID}/state`).then((response) => response.data);
  }

  async interact(body: RequestContext, versionID: string): Promise<ResponseContext> {
    return this.axios.post(`/interact/${versionID}`, body)
      .then((response) => response.data)
      .then((context) => adaptResponseContext(context));
  }
}

export default Client;
