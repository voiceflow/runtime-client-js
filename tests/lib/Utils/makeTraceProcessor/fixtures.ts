import { TraceType } from '@voiceflow/general-types';
import { TraceHandlerMap } from '@/lib/Utils/makeTraceProcessor';
import { BlockTraceHandler } from '@/lib/Utils/makeTraceProcessor/block';
import { ChoiceTraceHandler } from '@/lib/Utils/makeTraceProcessor/choice';
import { DebugTraceHandler } from '@/lib/Utils/makeTraceProcessor/debug';
import { EndTraceHandler } from '@/lib/Utils/makeTraceProcessor/end';
import { FlowTraceHandler } from '@/lib/Utils/makeTraceProcessor/flow';
import { SpeakTraceHandlerFunction, SpeakTraceHandlerMap } from '@/lib/Utils/makeTraceProcessor/speak';
import { StreamTraceHandler } from '@/lib/Utils/makeTraceProcessor/stream';
import { VisualTraceHandlerFunction, VisualTraceHandlerMap } from '@/lib/Utils/makeTraceProcessor/visual';

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

export const speakHandlerMap: SpeakTraceHandlerMap = {
    handleSpeech: (message, src) => {
        return [message, src];
    },
    handleAudio: (message, src) => {
        return [message, src];
    }
};

export const visualHandlerMap: VisualTraceHandlerMap = {
    handleAPL: (aplPayload) => {
        return aplPayload;
    },
    handleImage: (imgPayload) => {
        return imgPayload;
    }
}

export const speakHandlerFunc: SpeakTraceHandlerFunction = (message, src, type) => [message, src, type];

export const visualHandlerFunc: VisualTraceHandlerFunction = (payload, type) => [payload, type];

export const streamHandler: StreamTraceHandler = (src, action, token) => {
    return [src, action, token];
}

export const TRACE_HANDLER_MAP: TraceHandlerMap = {
    [TraceType.BLOCK]: blockHandler,
    [TraceType.CHOICE]: choiceHandler,
    [TraceType.DEBUG]: debugHandler,
    [TraceType.END]: endHandler,
    [TraceType.FLOW]: flowHandler,
    [TraceType.SPEAK]: speakHandlerMap,
    [TraceType.STREAM]: streamHandler,
};
