import { Config, GeneralRequest } from '@voiceflow/general-types';

import { InteractRequestBody } from '@/lib/Client/type';
import Context from '@/lib/Context';

import { DataConfig } from '../types';

export const configAdapter = ({ tts = false }: DataConfig): Config => ({
  tts,
});

export const makeRequestBody = (context: Context, request: GeneralRequest, dataConfig: DataConfig): InteractRequestBody => {
  return {
    ...context.getJSON(),
    request,
    config: configAdapter(dataConfig),
  };
};
