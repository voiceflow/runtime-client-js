import { TraceType } from '@/../general-types/build';
import { TraceHandlerMap } from '@/lib/Utils/makeTraceProcessor';
import { BlockTraceHandler } from '@/lib/Utils/makeTraceProcessor/block';
import { ChoiceTraceHandler } from '@/lib/Utils/makeTraceProcessor/choice';
import { DebugTraceHandler } from '@/lib/Utils/makeTraceProcessor/debug';
import { EndTraceHandler } from '@/lib/Utils/makeTraceProcessor/end';
import { FlowTraceHandler } from '@/lib/Utils/makeTraceProcessor/flow';
import { SpeakTraceHandler } from '@/lib/Utils/makeTraceProcessor/speak';
import { StreamTraceHandler } from '@/lib/Utils/makeTraceProcessor/stream';

export const fakeSpeakTrace = {
    type: TraceType.SPEAK,
    payload: {
        type: 'unknown'
    }
};

export const unknownTraceType = {
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

export const speakHandler: SpeakTraceHandler = {
    handleTTS: (message, src) => {
        return [message, src];
    },
    handleAudio: (message, src) => {
        return [message, src];
    }
};

export const streamHandler: StreamTraceHandler = (src, action, token) => {
    return [src, action, token];
}

export const traceHandlerMap: TraceHandlerMap = {
    [TraceType.BLOCK]: blockHandler,
    [TraceType.CHOICE]: choiceHandler,
    [TraceType.DEBUG]: debugHandler,
    [TraceType.END]: endHandler,
    [TraceType.FLOW]: flowHandler,
    [TraceType.SPEAK]: speakHandler,
    [TraceType.STREAM]: streamHandler,
};
