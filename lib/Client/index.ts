import { AxiosInstance } from "axios";
import { InteractResponse, InteractRequestBody } from "./type";
import { State } from '@voiceflow/runtime';

class Client {
  private axios: AxiosInstance;

  constructor(axios: AxiosInstance) {
    this.axios = axios;
  }

  async getAppInitialState(versionID: string): Promise<State> {
    return this.axios.get(`/interact/${versionID}/state`).then(response => response.data);
  }

  async interact(body: InteractRequestBody, versionID: string): Promise<InteractResponse> {
    return this.axios.post(`/interact/${versionID}`, body).then(response => response.data);
  }
}

export default Client;