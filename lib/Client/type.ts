import { GeneralRequest, GeneralTrace } from '@voiceflow/general-types';
import { State } from '@voiceflow/runtime';

export type InteractResponse = {
  state: State;
  request: GeneralRequest;
  trace: GeneralTrace[];
};

export type InteractRequestBody = {
  state: State;
  request: GeneralRequest;
};
