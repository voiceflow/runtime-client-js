import { RequestContext } from "@/lib/types";
import { VF_APP_INITIAL_STATE } from "../Context/fixtures";
import { VFAppVariablesSchema } from "../fixtures";
  
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
  