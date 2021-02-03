import { ChoiceTrace, GeneralRequest, GeneralTrace } from '@voiceflow/general-types';
import { State } from '@voiceflow/runtime';

export type AppConfig = {
  versionID: string;
  endpoint?: string;
  dataConfig?: DataConfig;
};

export type DataConfig = {
  tts?: boolean;
  ssml?: boolean;
  includeTypes?: string[];
};

export type AppContext = {
  request: GeneralRequest;
  state: State;
  trace: GeneralTrace[];
};

export type Choice = ChoiceTrace['payload']['choices'][number];
