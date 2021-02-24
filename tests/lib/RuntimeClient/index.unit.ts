import chai, { expect } from 'chai';
import chaiAsPromise from 'chai-as-promised';
import _ from 'lodash';
import sinon from 'sinon';

import RuntimeClient from '@/lib/RuntimeClient';
import { DataConfig, GeneralTrace, TraceEvent, TraceType } from '@/lib/types';

import {
  CHOICE_TRACE,
  CHOICES_1,
  CHOICES_2,
  CHOICES_3,
  INTENT_RESPONSE,
  SEND_INTENT_REQUEST_BODY,
  SEND_TEXT_REQUEST_BODY,
  SEND_TEXT_REQUEST_BODY_TTS_ON,
  SEND_TEXT_RESPONSE_BODY,
  SEND_TEXT_RESPONSE_BODY_WITH_SSML_AND_TTS,
  START_REQUEST_BODY,
  START_RESPONSE_BODY,
  START_RESPONSE_BODY_WITH_MULTIPLE_CHOICES,
  START_RESPONSE_BODY_WITH_NO_CHOICES,
  USER_RESPONSE,
  VF_APP_INITIAL_STATE,
  START_RESPONSE_BODY_UNSANITIZED,
  START_RESPONSE_BODY_ALL_TRACES,
} from '../Context/fixtures';
import { AUDIO_TRACE, BLOCK_TRACE, DEBUG_TRACE, END_TRACE, FLOW_TRACE, SPEAK_TRACE, SPEAK_TRACE_UNSANITIZED, VISUAL_TRACE } from '../fixtures';

chai.use(chaiAsPromise);

const createRuntimeClient = (dataConfig?: DataConfig) => {
  const state = VF_APP_INITIAL_STATE;
  const client = {
    getInitialState: sinon.stub(state),
    interact: sinon.stub(),
  };

  const agent = new RuntimeClient(state, { client: client as any, dataConfig });

  return { agent, client };
};

describe('RuntimeClient', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('constructor', () => {
    it('constructor', () => {
      const { agent } = createRuntimeClient();

      expect(agent.getContext().toJSON()).to.eql({ state: VF_APP_INITIAL_STATE, request: null, trace: [] });
    });
  });

  it('start', async () => {
    const { agent, client } = createRuntimeClient();

    client.interact.resolves(START_RESPONSE_BODY);

    const data = await agent.start();

    expect(client.interact.callCount).to.eql(1);
    expect(client.interact.args).to.eql([[{ ...START_REQUEST_BODY, state: { ...START_REQUEST_BODY.state, stack: [] } }]]);

    expect(data.toJSON()).to.eql(START_RESPONSE_BODY);
    expect(agent.getContext()?.toJSON()).to.eql(START_RESPONSE_BODY);
  });

  it('sendText', async () => {
    const { agent, client } = createRuntimeClient();

    client.interact.resolves(START_RESPONSE_BODY);

    await agent.start();

    client.interact.resolves(SEND_TEXT_RESPONSE_BODY);

    const data = await agent.sendText(USER_RESPONSE);

    expect(client.interact.callCount).to.eql(2);
    expect(client.interact.args[1]).to.eql([SEND_TEXT_REQUEST_BODY]);

    expect(data.toJSON()).to.eql(SEND_TEXT_RESPONSE_BODY);
  });

  it('sendIntent', async () => {
    const { agent, client } = createRuntimeClient();

    client.interact.resolves(START_RESPONSE_BODY);

    await agent.start();

    client.interact.resolves(SEND_TEXT_RESPONSE_BODY);

    const data = await agent.sendIntent(INTENT_RESPONSE.intent.name, INTENT_RESPONSE.entities, INTENT_RESPONSE.query, INTENT_RESPONSE.confidence);

    expect(client.interact.callCount).to.eql(2);
    expect(client.interact.args[1]).to.eql([SEND_INTENT_REQUEST_BODY]);

    expect(data.toJSON()).to.eql(SEND_TEXT_RESPONSE_BODY);
  });

  it('sendIntent, empty', async () => {
    const { agent, client } = createRuntimeClient();

    client.interact.resolves(START_RESPONSE_BODY);

    await agent.start();

    client.interact.resolves(SEND_TEXT_RESPONSE_BODY);

    const data = await agent.sendIntent(INTENT_RESPONSE.intent.name);

    expect(client.interact.callCount).to.eql(2);
    expect(client.interact.args[1]).to.eql([
      {
        ...SEND_INTENT_REQUEST_BODY,
        request: {
          ...SEND_INTENT_REQUEST_BODY.request,
          payload: { intent: { name: INTENT_RESPONSE.intent.name }, entities: [], query: '', confidence: undefined },
        },
      },
    ]);

    expect(data.toJSON()).to.eql(SEND_TEXT_RESPONSE_BODY);
  });

  it('sendText, empty', async () => {
    const { agent, client } = createRuntimeClient();

    client.interact.resolves(START_RESPONSE_BODY);

    await agent.start();

    client.interact.resolves(SEND_TEXT_RESPONSE_BODY);

    const data = await agent.sendText('');

    expect(client.interact.callCount).to.eql(2);
    expect(client.interact.args[1]).to.eql([{ ...SEND_TEXT_REQUEST_BODY, request: null }]);

    expect(data.toJSON()).to.eql(SEND_TEXT_RESPONSE_BODY);
  });

  it('sendText, invalid object', async () => {
    const { agent, client } = createRuntimeClient();

    client.interact.resolves(START_RESPONSE_BODY);

    await agent.start();

    client.interact.resolves(SEND_TEXT_RESPONSE_BODY);

    await agent.sendText({} as any);

    expect(client.interact.callCount).to.eql(2);
    expect(client.interact.args[1]).to.eql([{ ...SEND_TEXT_REQUEST_BODY, request: null }]);
  });

  it('sendText, falsy', async () => {
    const { agent, client } = createRuntimeClient();

    client.interact.resolves(START_RESPONSE_BODY);

    await agent.start();

    client.interact.resolves(SEND_TEXT_RESPONSE_BODY);

    await agent.sendText(undefined as any);

    expect(client.interact.callCount).to.eql(2);
    expect(client.interact.args[1]).to.eql([{ ...SEND_TEXT_REQUEST_BODY, request: null }]);
  });

  it('sendText, called when conversation has ended', async () => {
    const { agent, client } = createRuntimeClient();

    client.interact.resolves(START_RESPONSE_BODY);

    await agent.start();

    client.interact.resolves(SEND_TEXT_RESPONSE_BODY);

    await agent.sendText(USER_RESPONSE);

    return expect(agent.sendText('call sendText after conversation had ended'))
      .to.be.eventually.be.rejectedWith('VFError: RuntimeClient.sendText() was called but the conversation has ended')
      .and.be.an.instanceOf(Error);
  });

  it('get chips', async () => {
    const { agent, client } = createRuntimeClient();

    client.interact.resolves(START_RESPONSE_BODY);

    const context = await agent.start();
    const chips = context.getChips();

    expect(chips).to.eql(CHOICE_TRACE.payload.choices);
  });

  it("get chips, returns empty arr if trace doesn't end with ChoiceTrace", async () => {
    const { agent, client } = createRuntimeClient();

    client.interact.resolves(START_RESPONSE_BODY);

    await agent.start();

    client.interact.resolves(SEND_TEXT_RESPONSE_BODY);

    const context = await agent.sendText(USER_RESPONSE);
    const chips = context.getChips();

    expect(chips).to.eql([]);
  });

  it('get chips, return empty arr if choice trace has no choices', async () => {
    const { agent, client } = createRuntimeClient();

    client.interact.resolves(START_RESPONSE_BODY_WITH_NO_CHOICES);

    const context = await agent.start();
    const chips = context.getChips();

    expect(chips).to.eql([]);
  });

  it('get chips, handles data with multiple choice blocks', async () => {
    const { agent, client } = createRuntimeClient();

    client.interact.resolves(START_RESPONSE_BODY_WITH_MULTIPLE_CHOICES);

    const context = await agent.start();
    const chips = context.getChips();

    expect(chips).to.eql([...CHOICES_1, ...CHOICES_2, ...CHOICES_3]);
  });

  it('advanced config, SSML set to true', async () => {
    const { agent, client } = createRuntimeClient({
      tts: true,
      ssml: true,
    });

    client.interact.resolves(START_RESPONSE_BODY);

    await agent.start();

    client.interact.resolves(SEND_TEXT_RESPONSE_BODY_WITH_SSML_AND_TTS);

    const context = await agent.sendText(USER_RESPONSE);
    const response = context.getTrace();

    expect(client.interact.callCount).to.eql(2);
    expect(client.interact.args[1]).to.eql([SEND_TEXT_REQUEST_BODY_TTS_ON]);

    expect((response[0] as any).payload.message).to.eql('<voice>Books ought to have to have good endings.</voice>');
    expect((response[0] as any).payload.src).to.eql('data:audio/mpeg;base64,SUQzBAAAAAAA');
  });

  it('advanced config, SSML set to false', async () => {
    const { agent, client } = createRuntimeClient({
      tts: true,
      ssml: false,
    });

    client.interact.resolves(START_RESPONSE_BODY);

    await agent.start();

    client.interact.resolves(SEND_TEXT_RESPONSE_BODY_WITH_SSML_AND_TTS);

    const context = await agent.sendText(USER_RESPONSE);
    const response = context.getTrace();

    expect(client.interact.callCount).to.eql(2);
    expect(client.interact.args[1]).to.eql([SEND_TEXT_REQUEST_BODY_TTS_ON]);

    expect((response[0] as any).payload.message).to.eql('Books ought to have to have good endings.');
    expect((response[0] as any).payload.src).to.eql('data:audio/mpeg;base64,SUQzBAAAAAAA');
  });

  describe('events', () => {
    it('on', async () => {
      const { agent, client } = createRuntimeClient();

      const result1: any[] = [];
      const result2: any[] = [];

      agent.on(TraceType.SPEAK, (trace, context) => {
        result1.push(trace, context);
      });
      agent.on(TraceEvent.GENERAL, (trace, context) => {
        result2.push(trace, context);
      });

      client.interact.resolves(START_RESPONSE_BODY_ALL_TRACES);

      const context = await agent.start();

      expect(result1).to.eql([SPEAK_TRACE, context]);
      expect(result2).to.eql([
        SPEAK_TRACE,
        context,
        BLOCK_TRACE,
        context,
        FLOW_TRACE,
        context,
        VISUAL_TRACE,
        context,
        AUDIO_TRACE,
        context,
        DEBUG_TRACE,
        context,
        CHOICE_TRACE,
        context,
        END_TRACE,
        context
      ]);
    });

    it('on, bad trace type', () => {
      const { agent } = createRuntimeClient();

      const BAD_TRACE_TYPE = 'bad' as TraceType;

      const callback = () => {
        agent.on(BAD_TRACE_TYPE, () => {});
      };

      expect(callback).to.throw();
    });

    it('off', async () => {
      const { agent, client } = createRuntimeClient();
      
      const result: any[] = [];

      const toRemove1 = (trace: GeneralTrace, context: any) => {
        result.push(trace, context);
      };
      const toRemove2 = (context: any) => {
        result.push('AFTER', context);
      }

      agent.on(TraceType.SPEAK, toRemove1);
      agent.on(TraceEvent.GENERAL, toRemove1);
      agent.on(TraceEvent.AFTER_PROCESSING, toRemove2);

      agent.off(TraceType.SPEAK, toRemove1);
      agent.off(TraceEvent.GENERAL, toRemove1);
      agent.off(TraceEvent.AFTER_PROCESSING, toRemove2);

      client.interact.resolves(START_RESPONSE_BODY_ALL_TRACES);

      await agent.start();

      expect(result).to.eql([]);
    });

    it('off, bad trace type', () => {
      const { agent } = createRuntimeClient();

      const BAD_TRACE_TYPE = 'bad' as TraceType;

      const callback = () => {
        agent.off(BAD_TRACE_TYPE, () => {});
      }

      expect(callback).to.throw();
    });
  
    it('onEvent', async () => {
      const { agent, client } = createRuntimeClient();

      const results: any = {};
      Object.keys(TraceType)
        .map((trace) => trace.toLowerCase())
        .forEach((trace) => {
          results[trace] = [];
        });

      const insertToResults = (trace: any, context: any) => {
        results[trace.type].push(trace, context);
      };

      agent.onAudio(insertToResults);
      agent.onBlock(insertToResults);
      agent.onDebug(insertToResults);
      agent.onEnd(insertToResults);
      agent.onChoice(insertToResults);
      agent.onFlow(insertToResults);
      agent.onSpeak(insertToResults);
      agent.onVisual(insertToResults);

      client.interact.resolves(START_RESPONSE_BODY_ALL_TRACES);

      const context = await agent.start();

      expect(results[TraceType.SPEAK]).to.eql([SPEAK_TRACE, context]);
      expect(results[TraceType.VISUAL]).to.eql([VISUAL_TRACE, context]);
      expect(results[TraceType.FLOW]).to.eql([FLOW_TRACE, context]);
      expect(results[TraceType.END]).to.eql([END_TRACE, context]);
      expect(results[TraceType.DEBUG]).to.eql([DEBUG_TRACE, context]);
      expect(results[TraceType.CHOICE]).to.eql([CHOICE_TRACE, context]);
      expect(results[TraceType.BLOCK]).to.eql([BLOCK_TRACE, context]);
      expect(results[TraceType.AUDIO]).to.eql([AUDIO_TRACE, context]);
    });

    it('before and after', async () => {
      const { agent, client } = createRuntimeClient({
        ssml: false
      });
      
      const result: any[] = [];
      const BEFORE = 'BEFORE';
      const AFTER = 'AFTER';

      agent.on(TraceEvent.BEFORE_PROCESSING, (context) => {
        result.push(BEFORE);
        result.push(context);
      });
      agent.on(TraceType.SPEAK, (trace) => {
        result.push(trace)
      });
      agent.on(TraceEvent.AFTER_PROCESSING, (context) => {
        result.push(AFTER);
        result.push(context);
      });
      
      client.interact.resolves(START_RESPONSE_BODY);

      const context = await agent.start();

      expect(result).to.eql([
        BEFORE,
        context,
        SPEAK_TRACE,
        AFTER,
        context
      ]);
    });

    it('config, no ssml in events', async () => {
      const { agent, client } = createRuntimeClient({
        ssml: false
      });
      
      const result: GeneralTrace[] = [];

      agent.on(TraceType.SPEAK, (trace) => {
        result.push(trace)
      });
      
      client.interact.resolves(START_RESPONSE_BODY_UNSANITIZED);

      await agent.start();

      expect(result).to.eql([SPEAK_TRACE_UNSANITIZED]);
    });
  });
});