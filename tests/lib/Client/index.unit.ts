import baseAxios from 'axios';
import chai, { expect } from 'chai';
import chaiAsPromise from 'chai-as-promised';
import _ from 'lodash';
import sinon from 'sinon';

import Client, { ClientConfig } from '@/lib/Client';
import { DEFAULT_ENDPOINT } from '@/lib/RuntimeClientFactory/constants';

import { SEND_TEXT_REQUEST_BODY, SEND_TEXT_RESPONSE_BODY, VERSION_ID, VF_APP_INITIAL_STATE } from '../Context/fixtures';
import { INTERACT_ENDPOINT, STATE_ENDPOINT } from '../fixtures';
import { VF_APP_CUSTOM_INITIAL_VARIABLES } from './fixtures';

chai.use(chaiAsPromise);

const asHttpResponse = (data: object) => ({ data });

const createClient = <S = any>(config?: Partial<ClientConfig<S>>) => {
  const axiosInstance = {
    get: sinon.stub(),
    post: sinon.stub(),
    put: sinon.stub(),
    patch: sinon.stub(),
    delete: sinon.stub(),
    defaults: {},
  };

  const axiosCreate = sinon.stub(baseAxios, 'create').returns(axiosInstance as any);

  const client = new Client({ versionID: VERSION_ID, endpoint: DEFAULT_ENDPOINT, ...(config as any) });

  return { client, axiosCreate, axiosInstance };
};

describe('Client', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('constructor', () => {
    it('constructor', () => {
      const { axiosCreate } = createClient();

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
      const { axiosCreate, client } = createClient({ versionID, endpoint });

      expect(axiosCreate.callCount).to.eql(1);
      expect(axiosCreate.args[0]).to.eql([
        {
          baseURL: endpoint,
        },
      ]);
      expect(client.getVersionID()).to.eql(versionID);
    });
  });

  describe('interact', () => {
    it('works', async () => {
      const { client, axiosInstance } = createClient({
        variables: VF_APP_CUSTOM_INITIAL_VARIABLES,
      });

      axiosInstance.post.resolves(asHttpResponse(SEND_TEXT_RESPONSE_BODY));

      expect(await client.interact(SEND_TEXT_REQUEST_BODY)).to.eql(SEND_TEXT_RESPONSE_BODY);

      expect(axiosInstance.post.args).to.eql([[INTERACT_ENDPOINT(VERSION_ID), SEND_TEXT_REQUEST_BODY]]);
    });
  });

  describe('getInitialState', () => {
    it('variables', async () => {
      const { client, axiosInstance } = createClient({
        variables: VF_APP_CUSTOM_INITIAL_VARIABLES,
      });

      axiosInstance.get.resolves(asHttpResponse(VF_APP_INITIAL_STATE));

      expect(await client.getInitialState()).to.eql({
        ...VF_APP_INITIAL_STATE,
        variables: { ...VF_APP_INITIAL_STATE.variables, ...VF_APP_CUSTOM_INITIAL_VARIABLES },
      });

      expect(axiosInstance.get.args[0]).to.eql([STATE_ENDPOINT(VERSION_ID)]);
    });

    it('caches', async () => {
      const { client, axiosInstance } = createClient();

      axiosInstance.get.resolves(asHttpResponse(VF_APP_INITIAL_STATE));

      const state1 = await client.getInitialState();
      const state2 = await client.getInitialState();
      const state3 = await client.getInitialState();
      const state4 = await client.getInitialState();

      expect(state1)
        .to.eql(state2)
        .to.eql(state3)
        .to.eql(state4);

      expect(state1)
        .to.not.eq(state2)
        .to.not.eq(state3)
        .to.not.eq(state4);

      expect(axiosInstance.get.callCount).to.eql(1);
      expect(axiosInstance.get.args).to.eql([[STATE_ENDPOINT(VERSION_ID)]]);
    });

    it('deep clones', async () => {
      const { client, axiosInstance } = createClient();

      axiosInstance.get.resolves(asHttpResponse(VF_APP_INITIAL_STATE));

      const state1 = await client.getInitialState();
      state1.variables = { foo: 'bar ' };

      const state2 = await client.getInitialState();
      state2.variables = { foo: 'bar ' };

      expect(state1.variables).to.not.eq(state2.variables);
      expect(state1).to.eql(state2);

      expect(axiosInstance.get.args).to.eql([[STATE_ENDPOINT(VERSION_ID)]]);
    });
  });
});
