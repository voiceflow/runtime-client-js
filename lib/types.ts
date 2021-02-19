import { 
  BlockTrace,
  ChoiceTrace, 
  Config, 
  DebugTrace, 
  DeviceType, 
  Dimensions, 
  FlowTrace, 
  GeneralRequest, 
  GeneralTrace, 
  SpeakTrace, 
  VisualTrace as CombinedVisualTrace 
} from '@voiceflow/general-types';
import { CanvasVisibility, ImageStepData } from '@voiceflow/general-types/build/nodes/visual';
import { State } from '@voiceflow/runtime';

export type VisualTrace = CombinedVisualTrace & { payload: ImageStepData };

export type DataConfig = {
  tts?: boolean;
  ssml?: boolean;
  includeTypes?: string[];
  traceProcessor?: (trace: GeneralTrace) => any;
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

export type AudioTraceHandler = (message: SpeakTrace['payload']['message'], src: SpeakTrace['payload']['src']) => any;

export type VisualTraceHandler = (image: string | null, device: DeviceType | null, dimensions: Dimensions | null, visiblity: CanvasVisibility) => any;

export type TraceHandlerMap = {
  block: BlockTraceHandler;
  choice: ChoiceTraceHandler;
  debug: DebugTraceHandler;
  end: EndTraceHandler;
  flow: FlowTraceHandler;
  speak: SpeakTraceHandler;
  audio: AudioTraceHandler;
  visual: VisualTraceHandler;
};

export type RuntimeClientEvent = keyof TraceHandlerMap;

export type Choice = ChoiceTrace['payload']['choices'][number];
