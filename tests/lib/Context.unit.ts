import { expect } from 'chai';
import sinon from 'sinon';

import Context from '@/lib/Context';

import {
  CHOICES_1,
  CHOICES_2,
  CHOICES_3,
  SEND_TEXT_RESPONSE_BODY,
  SPEAK_TRACE,
  START_RESPONSE_BODY,
  START_RESPONSE_BODY_WITH_MULTIPLE_CHOICES,
} from './fixtures';

describe('Context', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('constructor', () => {
    const context = new Context(START_RESPONSE_BODY_WITH_MULTIPLE_CHOICES);

    expect(context.toJSON()).to.eql(START_RESPONSE_BODY_WITH_MULTIPLE_CHOICES);
    expect(context.getResponse()).to.eql([SPEAK_TRACE]);
    expect(context.isEnding()).to.eql(false);
    expect(context.getTrace()).to.eql(START_RESPONSE_BODY_WITH_MULTIPLE_CHOICES.trace);
    expect(context.getChips()).to.eql([...CHOICES_1, ...CHOICES_2, ...CHOICES_3]);
  });

  it('end state', () => {
    const context1 = new Context(START_RESPONSE_BODY);

    expect(context1.isEnding()).to.eql(false);

    const context2 = new Context(SEND_TEXT_RESPONSE_BODY);
    expect(context2.isEnding()).to.eql(true);
  });

  it('chips', () => {
    const context1 = new Context(START_RESPONSE_BODY);
    expect(context1.getChips()).to.eql(CHOICES_1);
  });
});
