import { BlockTrace, ChoiceTrace, DebugTrace, ExitTrace, FlowTrace, RequestType, SpeakTrace, StreamTrace, TraceType } from '@voiceflow/general-types';
import { TraceStreamAction } from '@voiceflow/general-types/build/nodes/stream';
import { State } from '@voiceflow/runtime';
import _ from 'lodash';

import { AppState } from '@/lib/App/types';
import { InteractRequestBody, InteractResponse } from '@/lib/Client/type';

export const VERSION_ID = 'dummy-version-id';

export const SPEAK_TRACE: SpeakTrace = {
  type: TraceType.SPEAK,
  payload: {
    message: 'Books ought to have to have good endings.',
  },
};
export const BLOCK_TRACE: BlockTrace = {
  type: TraceType.BLOCK,
  payload: {
    blockID: 'some-block-id',
  },
};

export const CHOICE_TRACE: ChoiceTrace = {
  type: TraceType.CHOICE,
  payload: {
    choices: [
      { name: 'Do you have small available?' },
      { name: "I'd like to order a large please" },
      { name: "I'd like the small  thank you very much" },
    ],
  },
};

export const CHOICE_TRACE_WITH_NO_CHOICES: ChoiceTrace = {
  type: TraceType.CHOICE,
  payload: {
    choices: [],
  },
};

export const FLOW_TRACE: FlowTrace = {
  type: TraceType.FLOW,
  payload: {
    diagramID: 'some-diagram-id',
  },
};

export const STREAM_TRACE: StreamTrace = {
  type: TraceType.STREAM,
  payload: {
    src: 'the source-string',
    action: TraceStreamAction.LOOP,
    token: 'some token for the stream',
  },
};

export const DEBUG_TRACE: DebugTrace = {
  type: TraceType.DEBUG,
  payload: {
    message: '*** this is some debugging message ***',
  },
};

export const END_TRACE: ExitTrace = {
  type: TraceType.END,
};

export const VF_APP_INITIAL_STATE: State = {
  stack: [
    {
      programID: 'some-program-id',
      storage: {},
      variables: {},
    },
  ],
  storage: {},
  variables: {
    age: 0,
    name: '',
    gender: '',
  },
};

export const START_REQUEST_BODY: InteractRequestBody = {
  state: VF_APP_INITIAL_STATE,
  request: null,
};

export const VF_APP_NEXT_STATE_1: State = {
  stack: [
    {
      programID: 'some-program-id',
      storage: {
        val1: 12,
      },
      variables: {
        val1: 3,
        val2: 17,
      },
    },
  ],
  storage: {},
  variables: {
    age: 17,
    name: 'Samwise Gamgee',
    gender: 'Male',
  },
};

export const START_RESPONSE_BODY = {
  state: VF_APP_NEXT_STATE_1,
  request: null,
  trace: [SPEAK_TRACE, BLOCK_TRACE, FLOW_TRACE, STREAM_TRACE, DEBUG_TRACE, CHOICE_TRACE],
};

export const START_RESPONSE_BODY_WITH_NO_CHOICES = {
  ...START_RESPONSE_BODY,
  trace: [..._.initial(START_RESPONSE_BODY.trace), CHOICE_TRACE_WITH_NO_CHOICES],
};

export const EXPOSED_VF_APP_NEXT_STATE_1: AppState = {
  state: VF_APP_NEXT_STATE_1,
  trace: [SPEAK_TRACE],
  end: false,
};

export const USER_RESPONSE = 'This is what the user says in response to the voice assistant';

export const SEND_TEXT_REQUEST_BODY: InteractRequestBody = {
  state: VF_APP_NEXT_STATE_1,
  request: {
    type: RequestType.TEXT,
    payload: USER_RESPONSE,
  },
};

export const VF_APP_NEXT_STATE_2: State = {
  stack: [
    {
      programID: 'some-program-id',
      storage: {
        val1: 37,
      },
      variables: {
        val1: -20,
        val2: 55,
      },
    },
  ],
  storage: {},
  variables: {
    age: 34,
    name: 'Frodo Baggins',
    gender: 'Male',
  },
};

export const SEND_TEXT_RESPONSE_BODY: InteractResponse = {
  state: VF_APP_NEXT_STATE_2,
  request: null,
  trace: [SPEAK_TRACE, END_TRACE],
};

export const EXPOSED_VF_APP_NEXT_STATE_2: AppState = {
  state: VF_APP_NEXT_STATE_2,
  trace: [SPEAK_TRACE],
  end: true,
};

export const CHOICES_1 = [
  { name: 'Do you have small available?' },
  { name: "I'd like to order a large please" },
  { name: "I'd like the small  thank you very much" },
];

export const CHOICES_2 = [
  { name: 'Do you have large available?' },
  { name: 'Is there any options for vegans?' },
  { name: 'Is there any options for halal?' },
];

export const CHOICES_3 = [{ name: 'Do you have handicapped parking?' }];

export const START_RESPONSE_BODY_WITH_MULTIPLE_CHOICES: InteractResponse = {
  state: VF_APP_NEXT_STATE_1,
  request: null,
  trace: [
    FLOW_TRACE,
    {
      type: TraceType.CHOICE,
      payload: {
        choices: CHOICES_1,
      },
    },
    STREAM_TRACE,
    DEBUG_TRACE,
    {
      type: TraceType.CHOICE,
      payload: {
        choices: CHOICES_2,
      },
    },
    SPEAK_TRACE,
    BLOCK_TRACE,
    {
      type: TraceType.CHOICE,
      payload: {
        choices: CHOICES_3,
      },
    },
    END_TRACE,
  ],
};
