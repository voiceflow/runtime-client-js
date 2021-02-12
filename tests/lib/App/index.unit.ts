import baseAxios from 'axios';
import chai, { expect } from 'chai';
import chaiAsPromise from 'chai-as-promised';
import _ from 'lodash';
import sinon from 'sinon';

import RuntimeClient, { AppConfig } from '@/lib/App';
import { DEFAULT_ENDPOINT } from '@/lib/App/constants';

import {
  CHOICE_TRACE,
  CHOICES_1,
  CHOICES_2,
  CHOICES_3,
  SEND_TEXT_REQUEST_BODY,
  SEND_TEXT_REQUEST_BODY_TTS_ON,
  SEND_TEXT_RESPONSE_BODY,
  SEND_TEXT_RESPONSE_BODY_WITH_SSML_AND_TTS,
  START_REQUEST_BODY,
  START_RESPONSE_BODY,
  START_RESPONSE_BODY_WITH_MULTIPLE_CHOICES,
  START_RESPONSE_BODY_WITH_NO_CHOICES,
  USER_RESPONSE,
  VERSION_ID,
  VF_APP_INITIAL_STATE,
} from '../Context/fixtures';
import { STATE_REQUEST_BODY_WITH_CUSTOM_VARIABLES, VF_APP_CUSTOM_INITIAL_VARIABLES } from './fixtures';
import { INTERACT_ENDPOINT, STATE_ENDPOINT } from '../fixtures';
import { makeTraceProcessor } from '@/lib/Utils';
import { TraceType } from '@voiceflow/general-types';
import { DEBUG_TRACE, SPEAK_TRACE } from '../fixtures';

chai.use(chaiAsPromise);

const asHttpResponse = (data: object) => ({ data });

const createVFApp = <T = any>(appConfig?: Partial<AppConfig<T>>) => {
  const axiosInstance = {
    get: sinon.stub(),
    post: sinon.stub(),
    put: sinon.stub(),
    patch: sinon.stub(),
    delete: sinon.stub(),
    defaults: {},
  };

  const axiosCreate = sinon.stub(baseAxios, 'create').returns(axiosInstance as any);

  const VFApp = new RuntimeClient({ versionID: VERSION_ID, ...appConfig });

  return { VFApp, axiosCreate, axiosInstance };
};

describe('App', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('constructor', () => {
    it('constructor', () => {
      const { axiosCreate } = createVFApp();

      expect(axiosCreate.callCount).to.eql(1);
      expect(axiosCreate.args[0]).to.eql([
        {
          baseURL: DEFAULT_ENDPOINT,
        },
      ]);
    });

    it('options', () => {
      const versionID = 'customVersionID';
      const endpoint = 'customEndpoint';
      const { axiosCreate, VFApp } = createVFApp({ versionID, endpoint });

      expect(axiosCreate.callCount).to.eql(1);
      expect(axiosCreate.args[0]).to.eql([
        {
          baseURL: endpoint,
        },
      ]);
      expect(VFApp.getVersionID()).to.eql(versionID);
    });

    it('variables', async () => {
      const { VFApp, axiosInstance } = createVFApp({
        variables: VF_APP_CUSTOM_INITIAL_VARIABLES 
      });

      axiosInstance.get.resolves(asHttpResponse(VF_APP_INITIAL_STATE));
      axiosInstance.post.resolves(asHttpResponse(START_RESPONSE_BODY));

      await VFApp.start();

      expect(axiosInstance.post.args[0]).to.eql([
        INTERACT_ENDPOINT(VERSION_ID),
        STATE_REQUEST_BODY_WITH_CUSTOM_VARIABLES
      ]);
    });
  });

  it('options, traceProcessor', async () => {
    const result: string[] = [];

    const traceProcessor = makeTraceProcessor({
      [TraceType.SPEAK]: (message) => {
        result.push(message)
      },
      [TraceType.DEBUG]: (message) => {
        result.push(message);
      }
    });

    const { VFApp, axiosInstance } = createVFApp({
      dataConfig: {
        traceProcessor,
        includeTypes: ['debug']
      }
    });

    axiosInstance.get.resolves(asHttpResponse(VF_APP_INITIAL_STATE));
    axiosInstance.post.resolves(asHttpResponse(START_RESPONSE_BODY_WITH_MULTIPLE_CHOICES));

    await VFApp.start();

    expect(result).to.eql([
      DEBUG_TRACE.payload.message,
      SPEAK_TRACE.payload.message
    ]);
  });

  it('start', async () => {
    const { VFApp, axiosInstance } = createVFApp();

    axiosInstance.get.resolves(asHttpResponse(VF_APP_INITIAL_STATE));
    axiosInstance.post.resolves(asHttpResponse(START_RESPONSE_BODY));

    const data = await VFApp.start();

    expect(axiosInstance.get.callCount).to.eql(1);
    expect(axiosInstance.get.args[0]).to.eql([STATE_ENDPOINT(VERSION_ID)]);

    expect(axiosInstance.post.callCount).to.eql(1);
    expect(axiosInstance.post.args[0]).to.eql([INTERACT_ENDPOINT(VERSION_ID), START_REQUEST_BODY]);

    expect(data.toJSON()).to.eql(START_RESPONSE_BODY);
    expect(VFApp.getContext()?.toJSON()).to.eql(START_RESPONSE_BODY);
  });

  it('start, pulls the cached initial state', async () => {
    const { VFApp, axiosInstance } = createVFApp();

    axiosInstance.get.resolves(asHttpResponse(VF_APP_INITIAL_STATE));
    axiosInstance.post.resolves(asHttpResponse(START_RESPONSE_BODY));

    const data1 = await VFApp.start();

    axiosInstance.post.resolves(asHttpResponse(START_RESPONSE_BODY));

    const data2 = await VFApp.start();

    expect(axiosInstance.get.callCount).to.eql(1);
    expect(axiosInstance.get.args[0]).to.eql([STATE_ENDPOINT(VERSION_ID)]);

    expect(axiosInstance.post.callCount).to.eql(2);
    expect(axiosInstance.post.args[0]).to.eql([INTERACT_ENDPOINT(VERSION_ID), START_REQUEST_BODY]);
    expect(axiosInstance.post.args[1]).to.eql([INTERACT_ENDPOINT(VERSION_ID), START_REQUEST_BODY]);

    expect(data1.toJSON()).to.eql(START_RESPONSE_BODY);
    expect(data2.toJSON()).to.eql(START_RESPONSE_BODY);
  });

  it('sendText', async () => {
    const { VFApp, axiosInstance } = createVFApp();

    axiosInstance.get.resolves(asHttpResponse(VF_APP_INITIAL_STATE));
    axiosInstance.post.resolves(asHttpResponse(START_RESPONSE_BODY));

    await VFApp.start();

    axiosInstance.post.resolves(asHttpResponse(SEND_TEXT_RESPONSE_BODY));

    const data = await VFApp.sendText(USER_RESPONSE);

    expect(axiosInstance.post.callCount).to.eql(2);
    expect(axiosInstance.post.args[1]).to.eql([INTERACT_ENDPOINT(VERSION_ID), SEND_TEXT_REQUEST_BODY]);

    expect(data.toJSON()).to.eql(SEND_TEXT_RESPONSE_BODY);
  });

  it('sendText, empty', async () => {
    const { VFApp, axiosInstance } = createVFApp();

    axiosInstance.get.resolves(asHttpResponse(VF_APP_INITIAL_STATE));
    axiosInstance.post.resolves(asHttpResponse(START_RESPONSE_BODY));

    await VFApp.start();

    axiosInstance.post.resolves(asHttpResponse(SEND_TEXT_RESPONSE_BODY));

    const data = await VFApp.sendText('');

    expect(axiosInstance.post.callCount).to.eql(2);
    expect(axiosInstance.post.args[1]).to.eql([INTERACT_ENDPOINT(VERSION_ID), { ...SEND_TEXT_REQUEST_BODY, request: null }]);

    expect(data.toJSON()).to.eql(SEND_TEXT_RESPONSE_BODY);
  });

  it('sendText, invalid object', async () => {
    const { VFApp, axiosInstance } = createVFApp();

    axiosInstance.get.resolves(asHttpResponse(VF_APP_INITIAL_STATE));
    axiosInstance.post.resolves(asHttpResponse(START_RESPONSE_BODY));

    await VFApp.start();

    axiosInstance.post.resolves(asHttpResponse(SEND_TEXT_RESPONSE_BODY));

    await VFApp.sendText({} as any);

    expect(axiosInstance.post.callCount).to.eql(2);
    expect(axiosInstance.post.args[1]).to.eql([INTERACT_ENDPOINT(VERSION_ID), { ...SEND_TEXT_REQUEST_BODY, request: null }]);
  });

  it('sendText, falsy', async () => {
    const { VFApp, axiosInstance } = createVFApp();

    axiosInstance.get.resolves(asHttpResponse(VF_APP_INITIAL_STATE));
    axiosInstance.post.resolves(asHttpResponse(START_RESPONSE_BODY));

    await VFApp.start();

    axiosInstance.post.resolves(asHttpResponse(SEND_TEXT_RESPONSE_BODY));

    await VFApp.sendText(undefined as any);

    expect(axiosInstance.post.callCount).to.eql(2);
    expect(axiosInstance.post.args[1]).to.eql([INTERACT_ENDPOINT(VERSION_ID), { ...SEND_TEXT_REQUEST_BODY, request: null }]);
  });

  it('sendText, start was not previously called', async () => {
    const { VFApp } = createVFApp();

    return expect(VFApp.sendText('call sendText without calling .start() first'))
      .to.be.eventually.be.rejectedWith('the context in VFClient.App was not initialized')
      .and.be.an.instanceOf(Error);
  });

  it('sendText, called when conversation has ended', async () => {
    const { VFApp, axiosInstance } = createVFApp();

    axiosInstance.get.resolves(asHttpResponse(VF_APP_INITIAL_STATE));
    axiosInstance.post.resolves(asHttpResponse(START_RESPONSE_BODY));

    await VFApp.start();

    axiosInstance.post.resolves(asHttpResponse(SEND_TEXT_RESPONSE_BODY));

    await VFApp.sendText(USER_RESPONSE);

    return expect(VFApp.sendText('call sendText after conversation had ended'))
      .to.be.eventually.be.rejectedWith('VFClient.sendText() was called but the conversation has ended')
      .and.be.an.instanceOf(Error);
  });

  it('get chips', async () => {
    const { VFApp, axiosInstance } = createVFApp();

    axiosInstance.get.resolves(asHttpResponse(VF_APP_INITIAL_STATE));
    axiosInstance.post.resolves(asHttpResponse(START_RESPONSE_BODY));

    const context = await VFApp.start();
    const chips = context.getChips();

    expect(chips).to.eql(CHOICE_TRACE.payload.choices);
  });

  it("get chips, returns empty arr if trace doesn't end with ChoiceTrace", async () => {
    const { VFApp, axiosInstance } = createVFApp();

    axiosInstance.get.resolves(asHttpResponse(VF_APP_INITIAL_STATE));
    axiosInstance.post.resolves(asHttpResponse(START_RESPONSE_BODY));

    await VFApp.start();

    axiosInstance.post.resolves(asHttpResponse(SEND_TEXT_RESPONSE_BODY));

    const context = await VFApp.sendText(USER_RESPONSE);
    const chips = context.getChips();

    expect(chips).to.eql([]);
  });

  it('get chips, return empty arr if choice trace has no choices', async () => {
    const { VFApp, axiosInstance } = createVFApp();

    axiosInstance.get.resolves(asHttpResponse(VF_APP_INITIAL_STATE));
    axiosInstance.post.resolves(asHttpResponse(START_RESPONSE_BODY_WITH_NO_CHOICES));

    const context = await VFApp.start();
    const chips = context.getChips();

    expect(chips).to.eql([]);
  });

  it('get chips, handles data with multiple choice blocks', async () => {
    const { VFApp, axiosInstance } = createVFApp();

    axiosInstance.get.resolves(asHttpResponse(VF_APP_INITIAL_STATE));
    axiosInstance.post.resolves(asHttpResponse(START_RESPONSE_BODY_WITH_MULTIPLE_CHOICES));

    const context = await VFApp.start();
    const chips = context.getChips();

    expect(chips).to.eql([...CHOICES_1, ...CHOICES_2, ...CHOICES_3]);
  });

  it('advanced config, SSML set to true', async () => {
    const { VFApp, axiosInstance } = createVFApp({
      versionID: VERSION_ID,
      dataConfig: {
        tts: true,
        ssml: true,
        includeTypes: ['debug', 'choice'],
      },
    });

    axiosInstance.get.resolves(asHttpResponse(VF_APP_INITIAL_STATE));
    axiosInstance.post.resolves(asHttpResponse(START_RESPONSE_BODY));

    await VFApp.start();

    axiosInstance.post.resolves(asHttpResponse(SEND_TEXT_RESPONSE_BODY_WITH_SSML_AND_TTS));

    const context = await VFApp.sendText(USER_RESPONSE);
    const response = context.getResponse();

    expect(axiosInstance.post.callCount).to.eql(2);
    expect(axiosInstance.post.args[1]).to.eql([INTERACT_ENDPOINT(VERSION_ID), SEND_TEXT_REQUEST_BODY_TTS_ON]);

    expect((response[0] as any).payload.message).to.eql('<voice>Books ought to have to have good endings.</voice>');
    expect((response[0] as any).payload.src).to.eql('data:audio/mpeg;base64,SUQzBAAAAAAA');
    expect(response.length).to.eql(2);
  });

  it('advanced config, SSML set to false', async () => {
    const { VFApp, axiosInstance } = createVFApp({
      versionID: VERSION_ID,
      dataConfig: {
        tts: true,
        ssml: false,
        includeTypes: ['speak', 'debug', 'choice'],
      },
    });

    axiosInstance.get.resolves(asHttpResponse(VF_APP_INITIAL_STATE));
    axiosInstance.post.resolves(asHttpResponse(START_RESPONSE_BODY));

    await VFApp.start();

    axiosInstance.post.resolves(asHttpResponse(SEND_TEXT_RESPONSE_BODY_WITH_SSML_AND_TTS));

    const context = await VFApp.sendText(USER_RESPONSE);
    const response = context.getResponse();

    expect(axiosInstance.post.callCount).to.eql(2);
    expect(axiosInstance.post.args[1]).to.eql([INTERACT_ENDPOINT(VERSION_ID), SEND_TEXT_REQUEST_BODY_TTS_ON]);

    expect((response[0] as any).payload.message).to.eql('Books ought to have to have good endings.');
    expect((response[0] as any).payload.src).to.eql('data:audio/mpeg;base64,SUQzBAAAAAAA');
    expect(response.length).to.eql(2);
  });
});
