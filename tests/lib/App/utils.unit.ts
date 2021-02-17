import { expect } from 'chai';
import sinon from 'sinon';

import { makeRequestBody } from '@/lib/Client/utils';
import Context from '@/lib/Context';

import { START_RESPONSE_BODY } from '../Context/fixtures';

describe('App utils', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('makeRequestBody', () => {
    const context = new Context(START_RESPONSE_BODY);
    expect(makeRequestBody(context)).to.eql({ state: START_RESPONSE_BODY.state, request: null, config: { tts: false } });
  });
});
