import { expect } from 'chai';
import sinon from 'sinon';

import { extractAudioStep } from '@/lib/Client/adapters';
import { AUDIO_TRACE, SPEAK_TRACE } from '../../fixtures';
import { MALFORMED_AUDIO_TRACE, MALFORMED_SPEAK_TRACE } from './fixtures';

describe('adapters', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('extractAudioStep', () => {
    const messyData = {
      trace: [MALFORMED_SPEAK_TRACE, MALFORMED_AUDIO_TRACE]
    };

    const result = extractAudioStep(messyData as any);

    expect(result).to.eql({
      trace: [SPEAK_TRACE, AUDIO_TRACE]
    });
  });
});
