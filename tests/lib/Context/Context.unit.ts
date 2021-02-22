import { expect } from 'chai';
import sinon from 'sinon';
import _ from 'lodash';
import Context from '@/lib/Context';

import {
  CHOICES_1,
  CHOICES_2,
  CHOICES_3,
  SEND_TEXT_RESPONSE_BODY,
  START_RESPONSE_BODY,
  START_RESPONSE_BODY_WITH_MULTIPLE_CHOICES,
  VF_APP_NEXT_STATE_1,
} from './fixtures';
import { SPEAK_TRACE, VFAppVariablesSchema } from '../fixtures';

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

  describe('variable manager', () => {
    it('get variables through context', () => {
      const context = new Context<VFAppVariablesSchema>(START_RESPONSE_BODY);
      expect(context.variables.get('name')).to.eql(VF_APP_NEXT_STATE_1.variables.name);
      expect(context.variables.get('age')).to.eql(VF_APP_NEXT_STATE_1.variables.age);
      expect(context.variables.get('gender')).to.eql(VF_APP_NEXT_STATE_1.variables.gender);
    });

    it('get throws if context not initialized', () => {
      const context = new Context<VFAppVariablesSchema>(null as any);
      const callback = () => context.variables.getAll();
      expect(callback).to.throw('VFError: cannot access variables, app state was not initialized');
    });

    it('set variables through context', () => {
      const stateCopy = _.cloneDeep(START_RESPONSE_BODY);
      const newName = 'J.C. Denton';
      const context = new Context<VFAppVariablesSchema>(stateCopy);

      context.variables.set('name', newName);

      // expect Context's internal copy of `name` variable to be set to the newName
      expect(context.toJSON().state.variables.name).to.eql(newName);

      // expect the original state object that was passed into Context to be untouched
      expect(stateCopy.state.variables.name).to.eql(START_RESPONSE_BODY.state.variables.name);
    })
  });
});
