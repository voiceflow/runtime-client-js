
import { expect } from 'chai';
import sinon from 'sinon';

import DataFilterer from '@/lib/DataFilterer';

import { SPEAK_TRACE } from '../fixtures';

describe('DataFilterer', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('strips ssml', () => {
    const dataFilterer = new DataFilterer({
      ssml: false,
    });
    expect(
      dataFilterer.filterTraces([
        {
          ...SPEAK_TRACE,
          payload: {
            ...SPEAK_TRACE.payload,
            message: '<voice>Books ought to have to have good endings.</voice>',
          },
        },
      ])
    ).to.eql([SPEAK_TRACE]);
  });
});
