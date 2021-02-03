import { GeneralTrace, SpeakTrace, TraceType } from '@voiceflow/general-types';
import { invokeBlockHandler } from '@/lib/Utils/makeTraceProcessor/block';
import { invokeChoiceHandler } from '@/lib/Utils/makeTraceProcessor/choice';
import { invokeDebugHandler } from '@/lib/Utils/makeTraceProcessor/debug';
import { invokeEndHandler } from '@/lib/Utils/makeTraceProcessor/end';
import { invokeFlowHandler } from '@/lib/Utils/makeTraceProcessor/flow';
import { invokeSpeakHandler, SpeakTraceHandler } from '@/lib/Utils/makeTraceProcessor/speak';
import { invokeStreamHandler } from '@/lib/Utils/makeTraceProcessor/stream';
import { expect } from 'chai';
import sinon from 'sinon';
import { BLOCK_TRACE, CHOICE_TRACE, DEBUG_TRACE, END_TRACE, FLOW_TRACE, SPEAK_TRACE, SPEAK_TRACE_AUDIO, STREAM_TRACE } from '../../fixture';
import { throwNotImplementedException } from '@/lib/Utils/makeTraceProcessor/default';
import { blockHandler, choiceHandler, debugHandler, defaultHandler, endHandler, fakeSpeakTrace, flowHandler, RESULT, speakHandler, streamHandler, traceHandlerMap, unknownTraceType } from './fixtures';
import * as Utils from '@/lib/Utils';

describe('makeTraceProcessor', () => {
    afterEach(() => {
      sinon.restore();
    });

    describe('handler invokers', () => {
        it('invokeBlockHandler', () => {
            const result = invokeBlockHandler(defaultHandler, BLOCK_TRACE, blockHandler);
            expect(result).to.eql(BLOCK_TRACE.payload.blockID);
        });

        it('invokeBlockHandler, invokes default handler', () => {
            const result = invokeBlockHandler(defaultHandler, BLOCK_TRACE, undefined);
            expect(result).to.eql(TraceType.BLOCK);
        });

        it('invokeChoiceHandler', () => {
            const result = invokeChoiceHandler(defaultHandler, CHOICE_TRACE, choiceHandler);
            expect(result).to.eql(CHOICE_TRACE.payload.choices);
        });

        it('invokeChoiceHandler, invokes default handler', () => {
            const result = invokeChoiceHandler(defaultHandler, CHOICE_TRACE, undefined);
            expect(result).to.eql(TraceType.CHOICE);
        });

        it('invokeDebugHandler', () => {
            const result = invokeDebugHandler(defaultHandler, DEBUG_TRACE, debugHandler);
            expect(result).to.eql(DEBUG_TRACE.payload.message);
        });

        it('invokeDebugHandler, invokes default handler', () => {
            const result = invokeDebugHandler(defaultHandler, DEBUG_TRACE, undefined);
            expect(result).to.eql(TraceType.DEBUG);
        });

        it('invokeEndHandler', () => {
            const result = invokeEndHandler(defaultHandler, END_TRACE, endHandler);
            expect(result).to.eql(RESULT);
        });

        it('invokeEndHandler, invokes default handler', () => {
            const result = invokeEndHandler(defaultHandler, END_TRACE, undefined);
            expect(result).to.eql(TraceType.END);
        });

        it('invokeFlowHandler', () => {
            const result = invokeFlowHandler(defaultHandler, FLOW_TRACE, flowHandler);
            expect(result).to.eql(FLOW_TRACE.payload.diagramID);
        });

        it('invokeFlowHandler, invokes default handler', () => {
            const result = invokeFlowHandler(defaultHandler, FLOW_TRACE, undefined);
            expect(result).to.eql(TraceType.FLOW);
        });

        it('invokeSpeakHandler, invokes tts handler', () => {
            const handler: SpeakTraceHandler = {
                handleTTS: speakHandler.handleTTS
            }

            const result = invokeSpeakHandler(defaultHandler, SPEAK_TRACE, handler);

            expect(result).to.eql([
                SPEAK_TRACE.payload.message,
                SPEAK_TRACE.payload.src
            ]);
        });

        it('invokeSpeakHandler, invokes audio handler', () => {
            const handler: SpeakTraceHandler = {
                handleAudio: speakHandler.handleAudio
            }

            const result = invokeSpeakHandler(defaultHandler, SPEAK_TRACE_AUDIO, handler);

            expect(result).to.eql([
                SPEAK_TRACE_AUDIO.payload.message,
                SPEAK_TRACE_AUDIO.payload.src
            ]);
        });

        it('invokeSpeakHandler, invokes default handler', () => {
            const result = invokeSpeakHandler(defaultHandler, SPEAK_TRACE, undefined);
            expect(result).to.eql(TraceType.SPEAK);
        });

        it('invokeSpeakHandler, invokes default tts handler', () => {
            const result = invokeSpeakHandler(defaultHandler, SPEAK_TRACE, {});
            expect(result).to.eql(TraceType.SPEAK);
        });

        it('invokeSpeakHandler, invokes default audio handler', () => {
            const result = invokeSpeakHandler(defaultHandler, SPEAK_TRACE_AUDIO, {});
            expect(result).to.eql(TraceType.SPEAK);
        });

        it('invokeSpeakHandler, unknown speak subtype', () => {
            const callback = () => invokeSpeakHandler(defaultHandler, fakeSpeakTrace as SpeakTrace, speakHandler)
            expect(callback).to.throw("VError: makeTraceProcessor's returned callback received an unknown SpeakTrace subtype");
        });

        it('invokeStreamHandler', () => {
            const result = invokeStreamHandler(defaultHandler, STREAM_TRACE, streamHandler);

            expect(result).to.eql([
                STREAM_TRACE.payload.src,
                STREAM_TRACE.payload.action,
                STREAM_TRACE.payload.token,
            ]);
        });

        it('invokeStreamHandler, invokes default handler', () => {
            const result = invokeStreamHandler(defaultHandler, STREAM_TRACE, undefined);
            expect(result).to.eql(TraceType.STREAM);
        });
    });

    describe('default handler', () => {
        it('throwNotImplementedException', () => {
            const callback = () => throwNotImplementedException(TraceType.BLOCK);
            expect(callback).to.throw(`VFError: a handler for "${TraceType.BLOCK}" was not implemented`)
        });
    });

    describe('makeTraceProcessor', () => {
        it('makeTraceProcessor', () => {
            const traceProcessor = Utils.makeTraceProcessor(traceHandlerMap);
        
            const data = traceProcessor(BLOCK_TRACE);

            expect(data).to.eql(BLOCK_TRACE.payload.blockID);
        });

        it('makeTraceProcessor, exception', () => {
            const traceProcessor = Utils.makeTraceProcessor(traceHandlerMap);
        
            const callback = () => traceProcessor(unknownTraceType as GeneralTrace);

            expect(callback).to.throw('VFError: an unknown trace type was passed into makeTraceProcessor')
        });
    });
});