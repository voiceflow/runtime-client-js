import { Config, GeneralRequest } from '@voiceflow/general-types';

import Context from '@/lib/Context';
import { RequestContext } from '@/lib/types';

import { DataConfig, ResponseContext } from '../types';

export const configAdapter = ({ tts = false, stripSSML = true }: DataConfig = {}): Config => ({
  tts,
  stripSSML,
});

export const makeRequestBody = <S>(context: Context<S>, request: GeneralRequest = null, dataConfig?: DataConfig): RequestContext => {
  const { state } = context.toJSON();
  return {
    state,
    request,
    config: configAdapter(dataConfig),
  };
};

// eslint-disable-next-line import/prefer-default-export
export const resetContext = (context: ResponseContext): ResponseContext => ({
  ...context,
  state: {
    ...context.state,
    stack: [],
  },
  trace: [],
});
