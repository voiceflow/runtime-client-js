import { SpeakType } from '@voiceflow/general-types/build/nodes/speak';
import { expect } from 'chai';
import sinon from 'sinon';

import { adaptResponseContext, extractAudioStep } from '@/lib/Client/adapters';
import { RequestType, SpeakTrace, TraceType } from '@voiceflow/general-types';
import { DBResponseContext } from '@/lib/Client/adapters/types';
import { DB_VISUAL_TRACE } from '../fixtures';
import { AUDIO_TRACE, SPEAK_TRACE } from '../../fixtures';
import { MALFORMED_AUDIO_TRACE, MALFORMED_SPEAK_TRACE } from './fixtures';

describe('adapters', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('adapts audio src', () => {
    const audioUrl = 'http://localhost:8000/audio.local/1613583846532-mixaund-tech-corporate.mp3';
    const audioMsg = `<audio src="${audioUrl}"/>`;
    const malformedTrace1 = {
      type: TraceType.SPEAK,
      payload: {
        message: audioMsg,
      },
    } as SpeakTrace;
    const malformedTrace2 = {
      type: TraceType.SPEAK,
      payload: {
        message: '',
      },
    } as SpeakTrace;

    const malformedResponse: DBResponseContext = {
      state: {
        variables: {},
        stack: [],
        storage: {},
      },
      request: {
        type: RequestType.TEXT,
        payload: 'some user input',
      },
      trace: [malformedTrace1, malformedTrace2, DB_VISUAL_TRACE],
    };

    const result = adaptResponseContext(malformedResponse);

    expect(result).to.eql({
      ...malformedResponse,
      trace: [
        {
          ...malformedTrace1,
          payload: {
            ...malformedTrace1.payload,
            src: audioUrl,
            type: SpeakType.AUDIO,
          },
        },
        {
          ...malformedTrace2,
          payload: {
            ...malformedTrace2.payload,
            message: '',
            type: SpeakType.MESSAGE,
          },
        },
        DB_VISUAL_TRACE
      ],
    });
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
