import { RequestContext } from "@/lib/types";
import { VF_APP_INITIAL_STATE } from "../Context/fixtures";

export type VFAppVariablesSchema = {
    age: number | 0;
    name: string | 0;
    gender: 'M' | 'F' | 'Other' | 0;
};
  
export const VF_APP_CUSTOM_INITIAL_VARIABLES: Partial<VFAppVariablesSchema> = {
    age: 337,
    name: 'Gandalf the White'
}

export const STATE_REQUEST_BODY_WITH_CUSTOM_VARIABLES: RequestContext = {
    config: {
      tts: false,
    },
    state: {
      ...VF_APP_INITIAL_STATE,
      variables: {
        ...VF_APP_INITIAL_STATE.variables,
        ...VF_APP_CUSTOM_INITIAL_VARIABLES
      }
    },
    request: null,
}
  