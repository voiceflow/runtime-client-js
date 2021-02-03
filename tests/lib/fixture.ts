import { BlockTrace, ChoiceTrace, DebugTrace, ExitTrace, FlowTrace, SpeakTrace, StreamTrace, TraceType } from "@voiceflow/general-types";
import { TraceStreamAction } from "@voiceflow/general-types/lib/nodes/stream";

export const SPEAK_TRACE: SpeakTrace = {
  type: TraceType.SPEAK,
  payload: {
    type: 'message',
    message: 'Books ought to have to have good endings.',
    src: 'data:audio/mpeg:some-large-tts-audio-file',
  },
};

export const SPEAK_TRACE_AUDIO: SpeakTrace = {
  type: TraceType.SPEAK,
  payload: {
    type: 'audio',
    message: '<audio src=\"http://localhost:8000/audio.local/1612307079557-mixaund-tech-corporate.mp3\"/>',
    src: 'http://localhost:8000/audio.local/1612307079557-mixaund-tech-corporate.mp3'
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
