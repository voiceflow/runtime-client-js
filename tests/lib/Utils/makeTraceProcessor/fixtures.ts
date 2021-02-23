import { AudioTraceHandler, BlockTraceHandler, ChoiceTraceHandler, DebugTraceHandler, EndTraceHandler, FlowTraceHandler, SpeakTraceHandler, TraceHandlerMap, TraceType, VisualTraceHandler } from "@/lib/types";

export const FAKE_SPEAK_TRACE = {
    type: TraceType.SPEAK,
    payload: {
        type: 'unknown'
    }
};

export const UNKNOWN_TRACE_TYPE = {
    type: 'invalid'
};

export const defaultHandler = (type: TraceType) => type;

export const blockHandler: BlockTraceHandler = (blockID) => {
    return blockID;
}

export const choiceHandler: ChoiceTraceHandler = (choices) => {
    return choices;
}

export const debugHandler: DebugTraceHandler = (message) => {
    return message;
}

export const RESULT = 'returned nothing!'
export const endHandler: EndTraceHandler = () => {
    return RESULT;
}

export const flowHandler: FlowTraceHandler = (diagramID: string) => {
    return diagramID;
}
export const speakHandler: SpeakTraceHandler = (message, src) => [message, src];
export const audioHandler: AudioTraceHandler = (message, src) => [message, src];
export const visualHandler: VisualTraceHandler = (image, device, dimensions, visiblity) => [image, device, dimensions, visiblity];

export const TRACE_HANDLER_MAP: TraceHandlerMap = {
    [TraceType.BLOCK]: blockHandler,
    [TraceType.CHOICE]: choiceHandler,
    [TraceType.DEBUG]: debugHandler,
    [TraceType.END]: endHandler,
    [TraceType.FLOW]: flowHandler,
    [TraceType.SPEAK]: speakHandler,
    [TraceType.AUDIO]: audioHandler,
    [TraceType.VISUAL]: visualHandler
};
