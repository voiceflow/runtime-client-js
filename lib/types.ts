import { ChoiceTrace, Config, GeneralRequest, GeneralTrace } from '@voiceflow/general-types';
import { State } from '@voiceflow/runtime';

export type DataConfig = {
  tts?: boolean;
  ssml?: boolean;
  includeTypes?: string[];
};

export type ResponseContext = {
  state: State;
  request: GeneralRequest;
  trace: GeneralTrace[];
};

export type RequestContext = {
  state: State;
  request: GeneralRequest;
  config?: Config;
};

export type Choice = ChoiceTrace['payload']['choices'][number];
