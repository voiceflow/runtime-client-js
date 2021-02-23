import invokeBlockHandler from '@/lib/Utils/makeTraceProcessor/block';
import invokeChoiceHandler from '@/lib/Utils/makeTraceProcessor/choice';
import invokeDebugHandler from '@/lib/Utils/makeTraceProcessor/debug';
import invokeEndHandler from '@/lib/Utils/makeTraceProcessor/end';
import { GeneralTrace, TraceType } from '@/lib/types';
import { expect } from 'chai';
import sinon from 'sinon';
import { AUDIO_TRACE, BLOCK_TRACE, CHOICE_TRACE, DEBUG_TRACE, END_TRACE, FLOW_TRACE, SPEAK_TRACE, VISUAL_TRACE } from '../../fixtures';
import { audioHandler, blockHandler, choiceHandler, debugHandler, endHandler, flowHandler, RESULT, speakHandler, TRACE_HANDLER_MAP, UNKNOWN_TRACE_TYPE, visualHandler } from './fixtures';
import invokeFlowHandler from '@/lib/Utils/makeTraceProcessor/flow';
import invokeVisualHandler from '@/lib/Utils/makeTraceProcessor/visual';
import invokeSpeakHandler from '@/lib/Utils/makeTraceProcessor/speak';
import invokeAudioHandler from '@/lib/Utils/makeTraceProcessor/audio';
import { makeTraceProcessor } from '@/lib/Utils/makeTraceProcessor';

describe('makeTraceProcessor', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('invokeBlockHandler', () => {
        const result = invokeBlockHandler(BLOCK_TRACE, blockHandler);
        expect(result).to.eql(BLOCK_TRACE.payload.blockID);
    });

    it('invokeChoiceHandler', () => {
        const result = invokeChoiceHandler(CHOICE_TRACE, choiceHandler);
        expect(result).to.eql(CHOICE_TRACE.payload.choices);
    });

    it('invokeDebugHandler', () => {
        const result = invokeDebugHandler(DEBUG_TRACE, debugHandler);
        expect(result).to.eql(DEBUG_TRACE.payload.message);
    });

    it('invokeEndHandler', () => {
        const result = invokeEndHandler(END_TRACE, endHandler);
        expect(result).to.eql(RESULT);
    });

    it('invokeFlowHandler', () => {
        const result = invokeFlowHandler(FLOW_TRACE, flowHandler);
        expect(result).to.eql(FLOW_TRACE.payload.diagramID);
    });

    it('invokeVisualHandler', () => {
        const result = invokeVisualHandler(VISUAL_TRACE, visualHandler);

        expect(result).to.eql([
            VISUAL_TRACE.payload.image,
            VISUAL_TRACE.payload.device,
            VISUAL_TRACE.payload.dimensions,
            VISUAL_TRACE.payload.canvasVisibility
        ]);
    });

    it('invokeSpeakHandler', () => {
        const result = invokeSpeakHandler(SPEAK_TRACE, speakHandler);

        expect(result).to.eql([
            SPEAK_TRACE.payload.message,
            SPEAK_TRACE.payload.src,
        ]);
    });

    it('invokeAudioHandler', () => {
        const result = invokeAudioHandler(AUDIO_TRACE, audioHandler);

        expect(result).to.eql([AUDIO_TRACE.payload.src]);
    });

    describe('makeTraceProcessor', () => {
        it('makeTraceProcessor', () => {
            const traceProcessor = makeTraceProcessor(TRACE_HANDLER_MAP);
        
            const data = traceProcessor(BLOCK_TRACE);

            expect(data).to.eql(BLOCK_TRACE.payload.blockID);
        });

        it('makeTraceProcessor, unknown trace type', () => {
            const traceProcessor = makeTraceProcessor(TRACE_HANDLER_MAP);
        
            const callback = () => traceProcessor(UNKNOWN_TRACE_TYPE as GeneralTrace);

            expect(callback).to.throw(`VFError: invalid trace type "invalid" was passed into makeTraceProcessor`)
        });

        it('makeTraceProcessor, unimplemented handler', () => {
            const traceProcessor = makeTraceProcessor({});
        
            const callback = () => traceProcessor(SPEAK_TRACE);

            expect(callback).to.throw(`VFError: handler for "${TraceType.SPEAK}" was not implemented`)
        });
    });
});