import axios from "axios";
import { ClientConfig } from "./type";
import { State } from '@voiceflow/runtime';

class Client {
  private GENERAL_RUNTIME_ENDPOINT_URL: string = '';

  constructor({ GENERAL_RUNTIME_ENDPOINT_URL }: ClientConfig) {
    this.GENERAL_RUNTIME_ENDPOINT_URL = GENERAL_RUNTIME_ENDPOINT_URL;
  }

  async getAppInitialState(versionID: string): Promise<State> {
    return axios.get(`${this.GENERAL_RUNTIME_ENDPOINT_URL}/interact/${versionID}/state`)
      .then(response => response.data);
  }

  async interact(body: { state: State, request: any }, versionID: string) {
    return axios.post(
      `${this.GENERAL_RUNTIME_ENDPOINT_URL}/interact/${versionID}`,
      body,
    ).then(response => response.data);
  }
}

export default Client;