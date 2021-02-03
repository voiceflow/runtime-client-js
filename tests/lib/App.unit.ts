import baseAxios from 'axios';
import chai, { expect } from 'chai';
import chaiAsPromise from 'chai-as-promised';
import _ from 'lodash';
import sinon from 'sinon';

import App, { AppConfig } from '@/lib/App';
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
} from './fixtures';

chai.use(chaiAsPromise);

const asHttpResponse = (data: object) => ({ data });

const createVFApp = (appConfig?: AppConfig) => {
  const axiosInstance = {
    get: sinon.stub(),
    post: sinon.stub(),
    put: sinon.stub(),
    patch: sinon.stub(),
    delete: sinon.stub(),
    defaults: {},
  };

  const axiosCreate = sinon.stub(baseAxios, 'create').returns(axiosInstance as any);

  const VFApp = new App({ versionID: VERSION_ID, ...appConfig });

  return { VFApp, axiosCreate, axiosInstance };
};

describe('App', () => {
  afterEach(() => {
    sinon.restore();
  });

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

    expect(VFApp.getVersion()).to.eql(versionID);
  });

  it('start', async () => {
    const { VFApp, axiosInstance } = createVFApp();

    axiosInstance.get.resolves(asHttpResponse(VF_APP_INITIAL_STATE));
    axiosInstance.post.resolves(asHttpResponse(START_RESPONSE_BODY));

    const data = await VFApp.start();

    expect(axiosInstance.get.callCount).to.eql(1);
    expect(axiosInstance.get.args[0]).to.eql([`/interact/${VERSION_ID}/state`]);

    expect(axiosInstance.post.callCount).to.eql(1);
    expect(axiosInstance.post.args[0]).to.eql([`/interact/${VERSION_ID}`, START_REQUEST_BODY]);

    expect(data.getJSON()).to.eql(START_RESPONSE_BODY);
  });

  it('start, pulls the cached initial state', async () => {
    const { VFApp, axiosInstance } = createVFApp();

    axiosInstance.get.resolves(asHttpResponse(VF_APP_INITIAL_STATE));
    axiosInstance.post.resolves(asHttpResponse(START_RESPONSE_BODY));

    const data1 = await VFApp.start();

    axiosInstance.post.resolves(asHttpResponse(START_RESPONSE_BODY));

    const data2 = await VFApp.start();

    expect(axiosInstance.get.callCount).to.eql(1);
    expect(axiosInstance.get.args[0]).to.eql([`/interact/${VERSION_ID}/state`]);

    expect(axiosInstance.post.callCount).to.eql(2);
    expect(axiosInstance.post.args[0]).to.eql([`/interact/${VERSION_ID}`, START_REQUEST_BODY]);
    expect(axiosInstance.post.args[1]).to.eql([`/interact/${VERSION_ID}`, START_REQUEST_BODY]);

    expect(data1.getJSON()).to.eql(START_RESPONSE_BODY);
    expect(data2.getJSON()).to.eql(START_RESPONSE_BODY);
  });

  it('sendText', async () => {
    const { VFApp, axiosInstance } = createVFApp();

    axiosInstance.get.resolves(asHttpResponse(VF_APP_INITIAL_STATE));
    axiosInstance.post.resolves(asHttpResponse(START_RESPONSE_BODY));

    await VFApp.start();

    axiosInstance.post.resolves(asHttpResponse(SEND_TEXT_RESPONSE_BODY));

    const data = await VFApp.sendText(USER_RESPONSE);

    expect(axiosInstance.post.callCount).to.eql(2);
    expect(axiosInstance.post.args[1]).to.eql([`/interact/${VERSION_ID}`, SEND_TEXT_REQUEST_BODY]);

    expect(data.getJSON()).to.eql(SEND_TEXT_RESPONSE_BODY);
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

    const { chips } = await VFApp.start();

    expect(chips).to.eql(CHOICE_TRACE.payload.choices);
  });

  it("get chips, returns empty arr if trace doesn't end with ChoiceTrace", async () => {
    const { VFApp, axiosInstance } = createVFApp();

    axiosInstance.get.resolves(asHttpResponse(VF_APP_INITIAL_STATE));
    axiosInstance.post.resolves(asHttpResponse(START_RESPONSE_BODY));

    await VFApp.start();

    axiosInstance.post.resolves(asHttpResponse(SEND_TEXT_RESPONSE_BODY));

    const { chips } = await VFApp.sendText(USER_RESPONSE);

    expect(chips).to.eql([]);
  });

  it('get chips, return empty arr if choice trace has no choices', async () => {
    const { VFApp, axiosInstance } = createVFApp();

    axiosInstance.get.resolves(asHttpResponse(VF_APP_INITIAL_STATE));
    axiosInstance.post.resolves(asHttpResponse(START_RESPONSE_BODY_WITH_NO_CHOICES));

    const { chips } = await VFApp.start();

    expect(chips).to.eql([]);
  });

  it('get chips, handles data with multiple choice blocks', async () => {
    const { VFApp, axiosInstance } = createVFApp();

    axiosInstance.get.resolves(asHttpResponse(VF_APP_INITIAL_STATE));
    axiosInstance.post.resolves(asHttpResponse(START_RESPONSE_BODY_WITH_MULTIPLE_CHOICES));

    const { chips } = await VFApp.start();

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

    const { response } = await VFApp.sendText(USER_RESPONSE);

    expect(axiosInstance.post.callCount).to.eql(2);
    expect(axiosInstance.post.args[1]).to.eql([`/interact/${VERSION_ID}`, SEND_TEXT_REQUEST_BODY_TTS_ON]);

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

    const { response } = await VFApp.sendText(USER_RESPONSE);

    expect(axiosInstance.post.callCount).to.eql(2);
    expect(axiosInstance.post.args[1]).to.eql([`/interact/${VERSION_ID}`, SEND_TEXT_REQUEST_BODY_TTS_ON]);

    expect((response[0] as any).payload.message).to.eql('Books ought to have to have good endings.');
    expect((response[0] as any).payload.src).to.eql('data:audio/mpeg;base64,SUQzBAAAAAAA');
    expect(response.length).to.eql(2);
  });
});
