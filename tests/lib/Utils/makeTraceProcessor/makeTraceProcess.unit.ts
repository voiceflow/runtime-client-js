import { GeneralTrace, SpeakTrace, TraceType, VisualTrace } from '@voiceflow/general-types';
import { invokeBlockHandler } from '@/lib/Utils/makeTraceProcessor/block';
import { invokeChoiceHandler } from '@/lib/Utils/makeTraceProcessor/choice';
import { invokeDebugHandler } from '@/lib/Utils/makeTraceProcessor/debug';
import { invokeEndHandler } from '@/lib/Utils/makeTraceProcessor/end';
import { invokeFlowHandler } from '@/lib/Utils/makeTraceProcessor/flow';
import { invokeSpeakHandler, SpeakTraceHandler, SpeakTraceHandlerMap } from '@/lib/Utils/makeTraceProcessor/speak';
import { invokeStreamHandler } from '@/lib/Utils/makeTraceProcessor/stream';
import { expect } from 'chai';
import sinon from 'sinon';
import { BLOCK_TRACE, CHOICE_TRACE, DEBUG_TRACE, END_TRACE, FAKE_VISUAL_TRACE, FLOW_TRACE, SPEAK_TRACE, SPEAK_TRACE_AUDIO, STREAM_TRACE, VISUAL_TRACE_APL, VISUAL_TRACE_IMAGE } from '../../fixtures';
import { throwNotImplementedException } from '@/lib/Utils/makeTraceProcessor/default';
import { blockHandler, choiceHandler, debugHandler, defaultHandler, endHandler, FAKE_SPEAK_TRACE, flowHandler, RESULT, speakHandlerFunc, speakHandlerMap, streamHandler, TRACE_HANDLER_MAP, UNKNOWN_TRACE_TYPE, visualHandlerFunc, visualHandlerMap } from './fixtures';
import { invokeVisualHandler, VisualTraceHandler } from '@/lib/Utils/makeTraceProcessor/visual';
import makeTraceProcessor from '@/lib/Utils/makeTraceProcessor';

describe('makeTraceProcessor', () => {
    afterEach(() => {
      sinon.restore();
    });

    describe('invokeBlockHandler', () => {
        it('normal call', () => {
            const result = invokeBlockHandler(defaultHandler, BLOCK_TRACE, blockHandler);
            expect(result).to.eql(BLOCK_TRACE.payload.blockID);
        });

        it('callback to default handler', () => {
            const result = invokeBlockHandler(defaultHandler, BLOCK_TRACE, undefined);
            expect(result).to.eql(TraceType.BLOCK);
        });

    });

    describe('invokeChoiceHandler', () => {
        it('normal call', () => {
            const result = invokeChoiceHandler(defaultHandler, CHOICE_TRACE, choiceHandler);
            expect(result).to.eql(CHOICE_TRACE.payload.choices);
        });

        it('fallback to default handler', () => {
            const result = invokeChoiceHandler(defaultHandler, CHOICE_TRACE, undefined);
            expect(result).to.eql(TraceType.CHOICE);
        });
    });

    describe('invokeDebugHandler', () => {
        it('normal call', () => {
            const result = invokeDebugHandler(defaultHandler, DEBUG_TRACE, debugHandler);
            expect(result).to.eql(DEBUG_TRACE.payload.message);
        });

        it('fallback to default handler', () => {
            const result = invokeDebugHandler(defaultHandler, DEBUG_TRACE, undefined);
            expect(result).to.eql(TraceType.DEBUG);
        });
    });

    describe('invokeEndHandler', () => {
        it('normal call', () => {
            const result = invokeEndHandler(defaultHandler, END_TRACE, endHandler);
            expect(result).to.eql(RESULT);
        });

        it('fallback to default handler', () => {
            const result = invokeEndHandler(defaultHandler, END_TRACE, undefined);
            expect(result).to.eql(TraceType.END);
        });
    });

    describe('invokeFlowHandler', () => {
        it('normal call', () => {
            const result = invokeFlowHandler(defaultHandler, FLOW_TRACE, flowHandler);
            expect(result).to.eql(FLOW_TRACE.payload.diagramID);
        });

        it('fallback to default handler', () => {
            const result = invokeFlowHandler(defaultHandler, FLOW_TRACE, undefined);
            expect(result).to.eql(TraceType.FLOW);
        });
    });

    describe('invokeStreamHandler', () => {
        it('normal call', () => {
            const result = invokeStreamHandler(defaultHandler, STREAM_TRACE, streamHandler);

            expect(result).to.eql([
                STREAM_TRACE.payload.src,
                STREAM_TRACE.payload.action,
                STREAM_TRACE.payload.token,
            ]);
        });
        
        it('fallback to default handler', () => {
            const result = invokeStreamHandler(defaultHandler, STREAM_TRACE, undefined);
            expect(result).to.eql(TraceType.STREAM);
        });
    });

    describe('invokeSpeakHandler', () => {
        it('function handler', () => {
            const result = invokeSpeakHandler(defaultHandler, SPEAK_TRACE, speakHandlerFunc);

            expect(result).to.eql([
                SPEAK_TRACE.payload.message,
                SPEAK_TRACE.payload.src,
                SPEAK_TRACE.payload.type
            ]);
        });

        it('invokes tts handler', () => {
            const handler: SpeakTraceHandlerMap = {
                handleTTS: speakHandlerMap.handleTTS
            }

            const result = invokeSpeakHandler(defaultHandler, SPEAK_TRACE, handler);

            expect(result).to.eql([
                SPEAK_TRACE.payload.message,
                SPEAK_TRACE.payload.src
            ]);
        });

        it('invokes audio handler', () => {
            const handler: SpeakTraceHandler = {
                handleAudio: speakHandlerMap.handleAudio
            }

            const result = invokeSpeakHandler(defaultHandler, SPEAK_TRACE_AUDIO, handler);

            expect(result).to.eql([
                SPEAK_TRACE_AUDIO.payload.message,
                SPEAK_TRACE_AUDIO.payload.src
            ]);
        });

        it('invokes default handler', () => {
            const result = invokeSpeakHandler(defaultHandler, SPEAK_TRACE, undefined);
            expect(result).to.eql(TraceType.SPEAK);
        });

        it('invokes default tts handler', () => {
            const result = invokeSpeakHandler(defaultHandler, SPEAK_TRACE, {});
            expect(result).to.eql(TraceType.SPEAK);
        });

        it('invokes default audio handler', () => {
            const result = invokeSpeakHandler(defaultHandler, SPEAK_TRACE_AUDIO, {});
            expect(result).to.eql(TraceType.SPEAK);
        });

        it('unknown speak subtype', () => {
            const callback = () => invokeSpeakHandler(defaultHandler, FAKE_SPEAK_TRACE as SpeakTrace, speakHandlerMap)
            expect(callback).to.throw("VError: makeTraceProcessor's returned callback received an unknown SpeakTrace subtype");
        });
    });

    describe('invokeVisualHandler', () => {
        it('function handler', () => {
            const result = invokeVisualHandler(defaultHandler, VISUAL_TRACE_APL, visualHandlerFunc);

            const { visualType, ...rest } = VISUAL_TRACE_APL.payload;
            expect(result).to.eql([
                rest,
                visualType
            ]);
        });

        it('invokes apl handler', () => {
            const handler: VisualTraceHandler = {
                handleAPL: visualHandlerMap.handleAPL
            };

            const result = invokeVisualHandler(defaultHandler, VISUAL_TRACE_APL, handler);

            const { visualType, ...restPayload } = VISUAL_TRACE_APL.payload;
            expect(result).to.eql(restPayload);
        });

        it('invokes image handler', () => {
            const handler: VisualTraceHandler = {
                handleImage: visualHandlerMap.handleImage
            };

            const result = invokeVisualHandler(defaultHandler, VISUAL_TRACE_IMAGE, handler);

            const { visualType, ...restPayload } = VISUAL_TRACE_IMAGE.payload;
            expect(result).to.eql(restPayload);
        });

        it('invokeVisualHandler, invokes default handler', () => {
            const result = invokeVisualHandler(defaultHandler, VISUAL_TRACE_IMAGE, undefined);
            expect(result).to.eql(TraceType.VISUAL);
        });

        it('invokeVisualHandler, invokes default apl handler', () => {
            const result = invokeVisualHandler(defaultHandler, VISUAL_TRACE_APL, {});
            expect(result).to.eql(TraceType.VISUAL);
        });

        it('invokeVisualHandler, invokes default image handler', () => {
            const result = invokeVisualHandler(defaultHandler, VISUAL_TRACE_IMAGE, {});
            expect(result).to.eql(TraceType.VISUAL);
        });

        it('invokeVisualHandler, unknown visual subtype', () => {
            const callback = () => invokeVisualHandler(defaultHandler, FAKE_VISUAL_TRACE as VisualTrace, visualHandlerMap)
            expect(callback).to.throw("VError: makeTraceProcessor's returned callback received an unknown SpeakTrace subtype");
        });
    });

    describe('default handler', () => {
        it('throwNotImplementedException', () => {
            const callback = () => throwNotImplementedException(TraceType.BLOCK);
            expect(callback).to.throw(`VFError: a handler for "${TraceType.BLOCK}" was not implemented`);
        });
    });

    describe('makeTraceProcessor', () => {
        it('makeTraceProcessor', () => {
            const traceProcessor = makeTraceProcessor(TRACE_HANDLER_MAP);
        
            const data = traceProcessor(BLOCK_TRACE);

            expect(data).to.eql(BLOCK_TRACE.payload.blockID);
        });

        it('makeTraceProcessor, exception', () => {
            const traceProcessor = makeTraceProcessor(TRACE_HANDLER_MAP);
        
            const callback = () => traceProcessor(UNKNOWN_TRACE_TYPE as GeneralTrace);

            expect(callback).to.throw('VFError: an unknown trace type was passed into makeTraceProcessor')
        });
    });
});