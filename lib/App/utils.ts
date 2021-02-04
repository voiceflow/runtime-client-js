import { Config, GeneralRequest } from '@voiceflow/general-types';

import Context from '@/lib/Context';
import { RequestContext } from '@/lib/types';

import { DataConfig } from '../types';

export const configAdapter = ({ tts = false }: DataConfig = {}): Config => ({
  tts,
});

export const makeRequestBody = <S>(context: Context<S>, request: GeneralRequest = null, dataConfig?: DataConfig): RequestContext => {
  const { state } = context.toJSON();
  return {
    state,
    request,
    config: configAdapter(dataConfig),
  };
};
