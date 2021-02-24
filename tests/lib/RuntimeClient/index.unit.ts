import chai, { expect } from 'chai';
import chaiAsPromise from 'chai-as-promised';
import _ from 'lodash';
import sinon from 'sinon';

import RuntimeClient from '@/lib/RuntimeClient';
import { DataConfig, GeneralTrace, TraceType, TRACE_EVENT } from '@/lib/types';

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
} from '../Context/fixtures';
import { API_KEY, AUDIO_TRACE, BLOCK_TRACE, DEBUG_TRACE, END_TRACE, FLOW_TRACE, SPEAK_TRACE, SPEAK_TRACE_UNSANITIZED } from '../fixtures';

chai.use(chaiAsPromise);

const createRuntimeClient = (apiKey: string = API_KEY, dataConfig?: DataConfig) => {
  const state = VF_APP_INITIAL_STATE;
  const client = {
    getInitialState: sinon.stub(state),
    interact: sinon.stub(),
  };

  const agent = new RuntimeClient(state, client as any, { apiKey, dataConfig });

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

    it('invalid API key', () => {
      expect(() => new RuntimeClient(VF_APP_INITIAL_STATE, {} as any, { apiKey: undefined as any })).to.throw('Invalid API key');
      expect(() => new RuntimeClient(VF_APP_INITIAL_STATE, {} as any, { apiKey: 'hello' as any })).to.throw('Invalid API key');
      expect(() => new RuntimeClient(VF_APP_INITIAL_STATE, {} as any, { apiKey: 'VF.' as any })).to.throw('Invalid API key');
      expect(() => new RuntimeClient(VF_APP_INITIAL_STATE, {} as any, { apiKey: 'VF.xxxxxxxx' as any })).to.throw('Invalid API key');
      expect(() => new RuntimeClient(VF_APP_INITIAL_STATE, {} as any, { apiKey: 'VF.xxxxxxxx.xxxxxxxx' as any })).not.to.throw();
    });
  });

  it('start', async () => {
    const { agent, client } = createRuntimeClient();

    client.interact.resolves(START_RESPONSE_BODY);

    const data = await agent.start();

    expect(client.interact.callCount).to.eql(1);
    expect(client.interact.args).to.eql([[{ ...START_REQUEST_BODY, state: { ...START_REQUEST_BODY.state, stack: [] } }, API_KEY]]);

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
    expect(client.interact.args[1]).to.eql([SEND_TEXT_REQUEST_BODY,  API_KEY]);

    expect(data.toJSON()).to.eql(SEND_TEXT_RESPONSE_BODY);
  });

  it('sendIntent', async () => {
    const { agent, client } = createRuntimeClient();

    client.interact.resolves(START_RESPONSE_BODY);

    await agent.start();

    client.interact.resolves(SEND_TEXT_RESPONSE_BODY);

    const data = await agent.sendIntent(INTENT_RESPONSE.intent.name, INTENT_RESPONSE.entities, INTENT_RESPONSE.query, INTENT_RESPONSE.confidence);

    expect(client.interact.callCount).to.eql(2);
    expect(client.interact.args[1]).to.eql([SEND_INTENT_REQUEST_BODY, API_KEY]);

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
      API_KEY
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
    expect(client.interact.args[1]).to.eql([{ ...SEND_TEXT_REQUEST_BODY, request: null }, API_KEY]);

    expect(data.toJSON()).to.eql(SEND_TEXT_RESPONSE_BODY);
  });

  it('sendText, invalid object', async () => {
    const { agent, client } = createRuntimeClient();

    client.interact.resolves(START_RESPONSE_BODY);

    await agent.start();

    client.interact.resolves(SEND_TEXT_RESPONSE_BODY);

    await agent.sendText({} as any);

    expect(client.interact.callCount).to.eql(2);
    expect(client.interact.args[1]).to.eql([{ ...SEND_TEXT_REQUEST_BODY, request: null }, API_KEY]);
  });

  it('sendText, falsy', async () => {
    const { agent, client } = createRuntimeClient();

    client.interact.resolves(START_RESPONSE_BODY);

    await agent.start();

    client.interact.resolves(SEND_TEXT_RESPONSE_BODY);

    await agent.sendText(undefined as any);

    expect(client.interact.callCount).to.eql(2);
    expect(client.interact.args[1]).to.eql([{ ...SEND_TEXT_REQUEST_BODY, request: null }, API_KEY]);
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
    const { agent, client } = createRuntimeClient(API_KEY, {
      tts: true,
      ssml: true,
    });

    client.interact.resolves(START_RESPONSE_BODY);

    await agent.start();

    client.interact.resolves(SEND_TEXT_RESPONSE_BODY_WITH_SSML_AND_TTS);

    const context = await agent.sendText(USER_RESPONSE);
    const response = context.getTrace();

    expect(client.interact.callCount).to.eql(2);
    expect(client.interact.args[1]).to.eql([SEND_TEXT_REQUEST_BODY_TTS_ON, API_KEY]);

    expect((response[0] as any).payload.message).to.eql('<voice>Books ought to have to have good endings.</voice>');
    expect((response[0] as any).payload.src).to.eql('data:audio/mpeg;base64,SUQzBAAAAAAA');
  });

  it('advanced config, SSML set to false', async () => {
    const { agent, client } = createRuntimeClient(API_KEY, {
      tts: true,
      ssml: false,
    });

    client.interact.resolves(START_RESPONSE_BODY);

    await agent.start();

    client.interact.resolves(SEND_TEXT_RESPONSE_BODY_WITH_SSML_AND_TTS);

    const context = await agent.sendText(USER_RESPONSE);
    const response = context.getTrace();

    expect(client.interact.callCount).to.eql(2);
    expect(client.interact.args[1]).to.eql([SEND_TEXT_REQUEST_BODY_TTS_ON, API_KEY]);

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
      agent.on(TRACE_EVENT, (trace, context) => {
        result2.push(trace, context);
      });

      client.interact.resolves(START_RESPONSE_BODY);

      const context = await agent.start();

      expect(result1).to.eql([SPEAK_TRACE, context]);
      expect(result2).to.eql([
        SPEAK_TRACE,
        context,
        BLOCK_TRACE,
        context,
        FLOW_TRACE,
        context,
        AUDIO_TRACE,
        context,
        DEBUG_TRACE,
        context,
        CHOICE_TRACE,
        context,
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
      
      const result1: any[] = [];
      const result2: any[] = [];

      const toRemove1 = (trace: GeneralTrace, context: any) => {
        result1.push(trace, context);
      };
      const toRemove2 = (trace: GeneralTrace, context: any) => {
        result2.push(trace, context);
      };
      agent.on(TraceType.SPEAK, toRemove1);
      agent.on(TRACE_EVENT, toRemove2);

      client.interact.resolves(START_RESPONSE_BODY);

      const context1 = await agent.start();

      agent.off(TraceType.SPEAK, toRemove1);
      agent.off(TRACE_EVENT, toRemove2);

      await agent.start();

      expect(result1).to.eql([
        SPEAK_TRACE, context1,
      ]);
      expect(result2).to.eql([
        SPEAK_TRACE, context1,
        BLOCK_TRACE, context1,
        FLOW_TRACE, context1,
        AUDIO_TRACE, context1,
        DEBUG_TRACE, context1,
        CHOICE_TRACE, context1
      ]);
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

      client.interact.resolves(START_RESPONSE_BODY);

      const context1 = await agent.start();

      client.interact.resolves(SEND_TEXT_RESPONSE_BODY);

      const context2 = await agent.sendText('some nonsense');

      expect(results[TraceType.SPEAK]).to.eql([SPEAK_TRACE, context1, SPEAK_TRACE, context2]);

      expect(results[TraceType.VISUAL]).to.eql([]);

      expect(results[TraceType.FLOW]).to.eql([FLOW_TRACE, context1]);

      expect(results[TraceType.END]).to.eql([END_TRACE, context2]);

      expect(results[TraceType.DEBUG]).to.eql([DEBUG_TRACE, context1]);

      expect(results[TraceType.CHOICE]).to.eql([CHOICE_TRACE, context1]);

      expect(results[TraceType.BLOCK]).to.eql([BLOCK_TRACE, context1]);

      expect(results[TraceType.AUDIO]).to.eql([AUDIO_TRACE, context1]);
    });

    it('config, no ssml in events', async () => {
      const { agent, client } = createRuntimeClient(API_KEY, {
        ssml: false
      });
      
      const result: GeneralTrace[] = [];
  
      agent.on(TraceType.SPEAK, (trace) => {
        result.push(trace)
      });
  
      client.interact.resolves(START_RESPONSE_BODY_UNSANITIZED);
  
      await agent.start();
  
      expect(result).to.eql([SPEAK_TRACE_UNSANITIZED])
    });
  });
});
