import chai, { expect } from 'chai';
import chaiAsPromise from 'chai-as-promised';
import sinon from 'sinon';
import baseAxios from 'axios';
import App from '@/lib/App';
import _ from 'lodash';
import { 
    EXPOSED_VF_APP_NEXT_STATE_1,
    EXPOSED_VF_APP_NEXT_STATE_2,
    GENERAL_RUNTIME_ENDPOINT_URL,
    SEND_TEXT_REQUEST_BODY,
    SEND_TEXT_RESPONSE_BODY,
    SEND_TEXT_RESPONSE_BODY_WITH_SSML_AND_TTS,
    START_REQUEST_BODY,
    START_RESPONSE_BODY,
    USER_RESPONSE,
    VERSION_ID,
    VF_APP_INITIAL_STATE
} from "./fixtures"
import { DataConfig } from '@/lib/App/types';

chai.use(chaiAsPromise);

const asHttpResponse = (data: object) => ({ data });

const createVFApp = (dataConfig: DataConfig = {}) => {
  const axiosInstance = {
    get: sinon.stub(),
    post: sinon.stub(),
    put: sinon.stub(),
    patch: sinon.stub(),
    delete: sinon.stub(),
    defaults: {},
  };

  const axiosCreate = sinon.stub(baseAxios, 'create').returns(axiosInstance as any);

  const VFApp = new App({ versionID: VERSION_ID, dataConfig: dataConfig });

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
                baseURL: GENERAL_RUNTIME_ENDPOINT_URL,
            }
        ]);
    });

    it('start', async () => {
        const { VFApp, axiosInstance } = createVFApp();

        axiosInstance.get.resolves(asHttpResponse(VF_APP_INITIAL_STATE));
        axiosInstance.post.resolves(asHttpResponse(START_RESPONSE_BODY));

        const data = await VFApp.start();

        expect(axiosInstance.get.callCount).to.eql(1);
        expect(axiosInstance.get.args[0]).to.eql([`/interact/${VERSION_ID}/state`]);

        expect(axiosInstance.post.callCount).to.eql(1);
        expect(axiosInstance.post.args[0]).to.eql([
            `/interact/${VERSION_ID}`,
            START_REQUEST_BODY
        ]);

        expect(data).to.eql(EXPOSED_VF_APP_NEXT_STATE_1);
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
        expect(axiosInstance.post.args[0]).to.eql([
            `/interact/${VERSION_ID}`,
            START_REQUEST_BODY
        ]);
        expect(axiosInstance.post.args[1]).to.eql([
            `/interact/${VERSION_ID}`,
            START_REQUEST_BODY
        ]);

        expect(data1).to.eql(EXPOSED_VF_APP_NEXT_STATE_1);
        expect(data2).to.eql(EXPOSED_VF_APP_NEXT_STATE_1);
    });

    it('sendText', async () => {
        const { VFApp, axiosInstance } = createVFApp();

        axiosInstance.get.resolves(asHttpResponse(VF_APP_INITIAL_STATE));
        axiosInstance.post.resolves(asHttpResponse(START_RESPONSE_BODY));

        await VFApp.start();

        axiosInstance.post.resolves(asHttpResponse(SEND_TEXT_RESPONSE_BODY));

        const data = await VFApp.sendText(USER_RESPONSE);

        expect(axiosInstance.post.callCount).to.eql(2);
        expect(axiosInstance.post.args[1]).to.eql([
            `/interact/${VERSION_ID}`,
            SEND_TEXT_REQUEST_BODY
        ]);

        expect(data).to.eql(EXPOSED_VF_APP_NEXT_STATE_2);
    });

    it('sendText, start was not previously called', async () => {
        const { VFApp } = createVFApp();

        return expect(VFApp.sendText("call sendText without calling .start() first"))
            .to.be.eventually.be.rejectedWith('the appState in VFClient.App was not initialized')
            .and.be.an.instanceOf(Error);
    });

    it('sendText, called when conversation has ended', async () => {
        const { VFApp, axiosInstance } = createVFApp();

        axiosInstance.get.resolves(asHttpResponse(VF_APP_INITIAL_STATE));
        axiosInstance.post.resolves(asHttpResponse(START_RESPONSE_BODY));

        await VFApp.start();

        axiosInstance.post.resolves(asHttpResponse(SEND_TEXT_RESPONSE_BODY));

        await VFApp.sendText(USER_RESPONSE);

        return expect(VFApp.sendText("call sendText after conversation had ended"))
            .to.be.eventually.be.rejectedWith('VFClient.sendText() was called but the conversation has ended')
            .and.be.an.instanceOf(Error);
    });
        
    it('advanced config', async () => {
        const { VFApp, axiosInstance } = createVFApp({
            hasTTS: false,
            showSSML: true,
            includeTypes: ['debug', 'choice'],
        });

        axiosInstance.get.resolves(asHttpResponse(VF_APP_INITIAL_STATE));
        axiosInstance.post.resolves(asHttpResponse(START_RESPONSE_BODY));

        await VFApp.start();

        axiosInstance.post.resolves(asHttpResponse(SEND_TEXT_RESPONSE_BODY_WITH_SSML_AND_TTS));

        const data = await VFApp.sendText(USER_RESPONSE);

        expect(axiosInstance.post.callCount).to.eql(2);
        expect(axiosInstance.post.args[1]).to.eql([
            `/interact/${VERSION_ID}`,
            SEND_TEXT_REQUEST_BODY
        ]);
        
        expect((data.trace[0] as any).payload.message).to.eql('<voice>Books ought to have to have good endings.</voice>');
        expect((data.trace[0] as any).payload.src).to.eql(undefined);
        expect(data.trace.length).to.eql(2);
    });

    it('advanced config includeTypes error', async () => {
        expect(() => createVFApp({includeTypes: ['fake']})).to.throw();
    });
});