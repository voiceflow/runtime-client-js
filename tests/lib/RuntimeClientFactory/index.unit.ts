import chai, { expect } from 'chai';
import chaiAsPromise from 'chai-as-promised';
import sinon from 'sinon';

import * as Client from '@/lib/Client';
import * as RuntimeClient from '@/lib/RuntimeClient';
import RuntimeClientFactory, { FactoryConfig } from '@/lib/RuntimeClientFactory';
import { DEFAULT_ENDPOINT } from '@/lib/RuntimeClientFactory/constants';

import { VERSION_ID } from '../Context/fixtures';

chai.use(chaiAsPromise);

const CLIENT = { interact: 'foo' };
const RUNTIME_CLIENT = { sendRequest: 'bar' };

const createRuntimeClientFactory = <S>(factoryConfig?: Partial<FactoryConfig<any>>) => {
  const client = sinon.stub(Client, 'default').returns(CLIENT);
  const agent = sinon.stub(RuntimeClient, 'default').returns(RUNTIME_CLIENT);

  const app = new RuntimeClientFactory<S>({ versionID: VERSION_ID, ...factoryConfig });

  return { client, agent, app };
};

describe('RuntimeClientFactory', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('constructor', () => {
    it('constructor', () => {
      const { client } = createRuntimeClientFactory();

      expect(client.args).to.eql([[{ versionID: VERSION_ID, endpoint: DEFAULT_ENDPOINT, variables: undefined }]]);
    });

    it('variables', () => {
      const { client } = createRuntimeClientFactory({ variables: 'foo' as any });

      expect(client.args).to.eql([[{ versionID: VERSION_ID, endpoint: DEFAULT_ENDPOINT, variables: 'foo' }]]);
    });

    it('optional', () => {
      const { client } = createRuntimeClientFactory({ variables: 'foo' as any, versionID: 'bar', endpoint: 'x', dataConfig: 'y' as any });

      expect(client.args).to.eql([[{ versionID: 'bar', endpoint: 'x', variables: 'foo' }]]);
    });

    it('does not accept invalid variables', () => {
      expect(() => createRuntimeClientFactory({ variables: { invalid: () => null } })).to.throw();
    });
  });

  describe('createRuntimeClient', () => {
    it('works', () => {
      const { agent, app } = createRuntimeClientFactory({ variables: 'foo' as any });

      expect(app.createClient('state' as any)).to.eql(RUNTIME_CLIENT);

      expect(agent.args).to.eql([['state', { client: CLIENT, dataConfig: { includeTypes: [], ssml: false, tts: false } }]]);
    });

    it('default state', () => {
      const VARIABLES = { x: 'y' };
      const { agent, app } = createRuntimeClientFactory({ variables: VARIABLES });

      expect(app.createClient()).to.eql(RUNTIME_CLIENT);

      expect(agent.args).to.eql([
        [
          { stack: [], storage: {}, variables: VARIABLES },
          { client: CLIENT, dataConfig: { includeTypes: [], ssml: false, tts: false } },
        ],
      ]);
    });
  });
});
