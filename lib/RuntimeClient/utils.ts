import { Config as DataConfig } from '@voiceflow/general-types';

import Context from '@/lib/Context';
import { GeneralRequest, RequestContext } from '@/lib/types';

import { ResponseContext } from '../types';

export const configAdapter = ({ tts = false, stripSSML = true, stopTypes }: DataConfig = {}): DataConfig => ({
  tts,
  stripSSML,
  stopTypes,
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
