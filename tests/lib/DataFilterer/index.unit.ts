import { TraceType } from '@voiceflow/general-types';
import { expect } from 'chai';
import sinon from 'sinon';

import DataFilterer from '@/lib/DataFilterer';

import { BLOCK_TRACE, CHOICE_TRACE, DEBUG_TRACE, END_TRACE, SPEAK_TRACE } from '../fixtures';

const allTraces = [BLOCK_TRACE, CHOICE_TRACE, DEBUG_TRACE, SPEAK_TRACE, END_TRACE];

describe('DataFilterer', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('invalid types', () => {
    expect(
      () =>
        new DataFilterer({
          includeTypes: ['foo'],
        })
    ).to.throw();
  });

  it('keeps speak', () => {
    const dataFilterer = new DataFilterer({
      includeTypes: [],
    });
    expect(dataFilterer.filterTraces(allTraces)).to.eql([SPEAK_TRACE]);
  });

  it('strip types', () => {
    const dataFilterer1 = new DataFilterer({
      includeTypes: [TraceType.END],
    });
    expect(dataFilterer1.filterTraces(allTraces)).to.eql([SPEAK_TRACE, END_TRACE]);

    const dataFilterer2 = new DataFilterer({
      includeTypes: [TraceType.BLOCK, TraceType.DEBUG],
    });
    expect(dataFilterer2.filterTraces(allTraces)).to.eql([BLOCK_TRACE, DEBUG_TRACE, SPEAK_TRACE]);
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
            message: '<voice>Books ought to have to have good endings.</voice>',
          },
        },
      ])
    ).to.eql([SPEAK_TRACE]);
  });
});
