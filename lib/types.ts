import {
  BlockTrace as BaseBlockTrace,
  ChoiceTrace as BaseChoiceTrace,
  Config,
  DebugTrace as BaseDebugTrace,
  DeviceType,
  Dimensions,
  ExitTrace as BaseEndTrace,
  FlowTrace as BaseFlowTrace,
  GeneralRequest,
  GeneralTrace as BaseGeneralTrace,
  SpeakTrace as BaseSpeakTrace,
  VisualTrace as BaseVisualTrace,
} from '@voiceflow/general-types';
import { CanvasVisibility, ImageStepData } from '@voiceflow/general-types/build/nodes/visual';
import { State } from '@voiceflow/runtime';

export enum TraceType {
  BLOCK = 'block',
  CHOICE = 'choice',
  DEBUG = 'debug',
  END = 'end',
  FLOW = 'flow',
  SPEAK = 'speak',
  AUDIO = 'audio',
  VISUAL = 'visual',
}

export type AdaptTraceType<T extends BaseGeneralTrace, S extends TraceType> = Omit<T, 'type'> & { type: S };

export type BlockTrace = AdaptTraceType<BaseBlockTrace, TraceType.BLOCK>;

export type ChoiceTrace = AdaptTraceType<BaseChoiceTrace, TraceType.CHOICE>;

export type DebugTrace = AdaptTraceType<BaseDebugTrace, TraceType.DEBUG>;

export type EndTrace = AdaptTraceType<BaseEndTrace, TraceType.END>;

export type FlowTrace = AdaptTraceType<BaseFlowTrace, TraceType.FLOW>;

export type AudioTrace = {
  type: TraceType.AUDIO;
  payload: Omit<BaseSpeakTrace['payload'], 'type'>;
};

export type SpeakTrace = {
  type: TraceType.SPEAK;
  payload: Omit<BaseSpeakTrace['payload'], 'type'>;
};
export type VisualTrace = AdaptTraceType<BaseVisualTrace, TraceType.VISUAL> & { payload: ImageStepData };

export type GeneralTrace = BlockTrace | ChoiceTrace | DebugTrace | EndTrace | FlowTrace | AudioTrace | SpeakTrace | VisualTrace;

export type DataConfig = {
  tts?: boolean;
  ssml?: boolean;
};

export type ResponseContext = {
  state: State;
  request: GeneralRequest;
  trace: GeneralTrace[];
};

export type RequestContext = {
  state?: State;
  request: GeneralRequest;
  config?: Config;
};

export type BlockTraceHandler = (blockID: BlockTrace['payload']['blockID']) => any;

export type ChoiceTraceHandler = (choices: ChoiceTrace['payload']['choices']) => any;

export type DebugTraceHandler = (message: DebugTrace['payload']['message']) => any;

export type EndTraceHandler = () => any;

export type FlowTraceHandler = (diagramID: FlowTrace['payload']['diagramID']) => any;

export type SpeakTraceHandler = (message: SpeakTrace['payload']['message'], src: SpeakTrace['payload']['src']) => any;

export type AudioTraceHandler = (src: SpeakTrace['payload']['src']) => any;

export type VisualTraceHandler = (image: string | null, device: DeviceType | null, dimensions: Dimensions | null, visiblity: CanvasVisibility) => any;

export type TraceHandlerMap = {
  [TraceType.BLOCK]: BlockTraceHandler;
  [TraceType.CHOICE]: ChoiceTraceHandler;
  [TraceType.DEBUG]: DebugTraceHandler;
  [TraceType.END]: EndTraceHandler;
  [TraceType.FLOW]: FlowTraceHandler;
  [TraceType.SPEAK]: SpeakTraceHandler;
  [TraceType.AUDIO]: AudioTraceHandler;
  [TraceType.VISUAL]: VisualTraceHandler;
};

export type TraceMap = {
  [TraceType.BLOCK]: BlockTrace;
  [TraceType.CHOICE]: ChoiceTrace;
  [TraceType.DEBUG]: DebugTrace;
  [TraceType.END]: EndTrace;
  [TraceType.FLOW]: FlowTrace;
  [TraceType.SPEAK]: SpeakTrace;
  [TraceType.AUDIO]: AudioTrace;
  [TraceType.VISUAL]: VisualTrace;
};

export const TRACE_EVENT = 'trace';
export type TRACE_EVENT = typeof TRACE_EVENT;

export type Choice = ChoiceTrace['payload']['choices'][number];
