import sinon from 'sinon';
import { expect } from 'chai';
import EventManager from "@/lib/Events";
import { TraceType } from '@/lib/types';
import { DEBUG_TRACE, SPEAK_TRACE, VISUAL_TRACE } from '../fixtures';

const createEventManager = <V extends Record<string, any> = Record<string, any>>() => {
    const evManager = new EventManager<V>();
    return { evManager };
}

describe('EventManager', () => {
    afterEach(() => {
        sinon.restore();
    });

    it('on', async () => {
        const { evManager } = createEventManager()

        const result: any[] = [];
        const context1 = { a: 1 };
        const context2 = { b: 2 };
        const context3 = { c: 3 };

        evManager.onTraceType(TraceType.SPEAK, (object, context) => {
            result.push(object);
            result.push(context);
        });
        evManager.onTraceType(TraceType.DEBUG, async (object, context) => {
            await new Promise(res => setTimeout(res, 20));
            result.push(object);
            result.push(context);
        });
        
        await evManager.handleTrace(DEBUG_TRACE, context3 as any);
        await evManager.handleTrace(SPEAK_TRACE, context1 as any);
        await evManager.handleTrace(VISUAL_TRACE, context2 as any);

        expect(result).to.eql([
            DEBUG_TRACE,
            context3,
            SPEAK_TRACE,
            context1,
        ]);
    });

    it('onAny', async () => {
        const { evManager } = createEventManager()

        const result: any[] = [];
        const context1 = { a: 1 };
        const context2 = { b: 2 };

        evManager.onGeneral((object, context) => {
            result.push(object);
            result.push(context);
        });
        
        await evManager.handleTrace(SPEAK_TRACE, context1 as any);
        await evManager.handleTrace(VISUAL_TRACE, context2 as any);

        expect(result).to.eql([
            SPEAK_TRACE,
            context1,
            VISUAL_TRACE,
            context2
        ]);
    });
});