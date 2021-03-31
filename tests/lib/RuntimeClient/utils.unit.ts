import { expect } from 'chai';
import sinon from 'sinon';

import Context from '@/lib/Context';
import { makeRequestBody } from '@/lib/RuntimeClient/utils';

import { START_RESPONSE_BODY } from '../Context/fixtures';

describe('RuntimeClient utils', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('makeRequestBody', () => {
    const context = new Context(START_RESPONSE_BODY);
    expect(makeRequestBody(context)).to.eql({
      state: START_RESPONSE_BODY.state,
      request: null,
      config: { tts: false, stripSSML: true, stopTypes: undefined },
    });
  });
});
