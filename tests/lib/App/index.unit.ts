import chai, { expect } from 'chai';
import chaiAsPromise from 'chai-as-promised';
import sinon from 'sinon';

import * as Agent from '@/lib/RuntimeClient';
import App, { FactoryConfig } from '@/lib/RuntimeClientFactory';
import { DEFAULT_ENDPOINT } from '@/lib/RuntimeClientFactory/constants';
import * as Client from '@/lib/Client';

import { VERSION_ID } from '../Context/fixtures';

chai.use(chaiAsPromise);

const CLIENT = { interact: 'foo' };
const AGENT = { sendRequest: 'bar' };

const createApp = (factoryConfig?: Partial<FactoryConfig<any>>) => {
  const client = sinon.stub(Client, 'default').returns(CLIENT);
  const agent = sinon.stub(Agent, 'default').returns(AGENT);

  const app = new App({ versionID: VERSION_ID, ...factoryConfig });

  return { client, agent, app };
};

describe('App', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('constructor', () => {
    it('constructor', () => {
      const { client } = createApp();

      expect(client.args).to.eql([[{ versionID: VERSION_ID, endpoint: DEFAULT_ENDPOINT, variables: undefined }]]);
    });

    it('variables', () => {
      const { client } = createApp({ variables: 'foo' as any });

      expect(client.args).to.eql([[{ versionID: VERSION_ID, endpoint: DEFAULT_ENDPOINT, variables: 'foo' }]]);
    });

    it('optional', () => {
      const { client } = createApp({ variables: 'foo' as any, versionID: 'bar', endpoint: 'x', dataConfig: 'y' as any });

      expect(client.args).to.eql([[{ versionID: 'bar', endpoint: 'x', variables: 'foo' }]]);
    });

    it('does not accept invalid variables', () => {
      expect(() => createApp({ variables: { invalid: () => null } })).to.throw();
    });
  });

  describe('createAgent', () => {
    it('works', () => {
      const { agent, app } = createApp({ variables: 'foo' as any });

      expect(app.createClient('state' as any)).to.eql(AGENT);

      expect(agent.args).to.eql([['state', { client: CLIENT, dataConfig: { includeTypes: [], ssml: false, tts: false } }]]);
    });

    it('default state', () => {
      const VARIABLES = { x: 'y' };
      const { agent, app } = createApp({ variables: VARIABLES });

      expect(app.createClient()).to.eql(AGENT);

      expect(agent.args).to.eql([
        [
          { stack: [], storage: {}, variables: VARIABLES },
          { client: CLIENT, dataConfig: { includeTypes: [], ssml: false, tts: false } },
        ],
      ]);
    });
  });
});
