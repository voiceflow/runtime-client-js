import { ChoiceTrace, GeneralTrace } from '@voiceflow/general-types';
import { State } from '@voiceflow/runtime';

import { DeepReadonly } from '@/lib/Typings';

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

export type InternalAppState = {
  state: State;
  trace: GeneralTrace[];
};

export type AppState = DeepReadonly<
  InternalAppState & {
    end: boolean;
  }
>;

export type Choice = ChoiceTrace['payload']['choices'][number];
