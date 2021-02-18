import { GeneralRequest, RequestType } from '@voiceflow/general-types';
import { State } from '@voiceflow/runtime';

import Client from '@/lib/Client';
import { VFClientError } from '@/lib/Common';
import Context from '@/lib/Context';
import { DataConfig, ResponseContext } from '@/lib/types';

import { makeRequestBody } from '../Client/utils';

export class RuntimeClient<S extends Record<string, any> = Record<string, any>> {
  private client: Client;

  private dataConfig: DataConfig;

  private context: Context<S>;

  constructor(state: State, { client, dataConfig = {} }: { client: Client<S>; dataConfig?: DataConfig }) {
    this.client = client;
    this.dataConfig = dataConfig;

    this.context = new Context({ request: null, state, trace: [] }, this.dataConfig);
  }

  async start(): Promise<Context<S>> {
    this.context.toJSON().state.stack = [];
    this.context.toJSON().trace = [];
    return this.sendRequest(null);
  }

  async sendText(userInput: string): Promise<Context<S>> {
    if (!userInput?.trim?.()) {
      return this.sendRequest(null);
    }
    return this.sendRequest({ type: RequestType.TEXT, payload: userInput });
  }

  async sendRequest(request: GeneralRequest) {
    if (this.context.isEnding()) {
      throw new VFClientError('RuntimeClient.sendText() was called but the conversation has ended');
    }
    this.setContext(await this.client.interact(makeRequestBody(this.context!, request, this.dataConfig)));

    if (this.dataConfig.traceProcessor) {
      this.context!.getResponse().forEach(this.dataConfig.traceProcessor);
    }

    return this.context;
  }

  setContext(contextJSON: ResponseContext) {
    this.context = new Context(contextJSON, this.dataConfig);
  }

  getContext() {
    return this.context;
  }
}

export default RuntimeClient;
