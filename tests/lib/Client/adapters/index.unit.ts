import { RequestType, SpeakTrace, TraceType } from '@voiceflow/general-types';
import { SpeakType } from '@voiceflow/general-types/build/nodes/speak';
import { expect } from 'chai';
import sinon from 'sinon';

import { adaptResponseContext } from '@/lib/Client/adapters';
import { ResponseContext } from '@/lib/types';
import { VISUAL_TRACE_IMAGE } from '../../fixtures';

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

    const malformedResponse: ResponseContext = {
      state: {
        variables: {},
        stack: [],
        storage: {},
      },
      request: {
        type: RequestType.TEXT,
        payload: 'some user input',
      },
      trace: [malformedTrace1, malformedTrace2, VISUAL_TRACE_IMAGE],
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
        VISUAL_TRACE_IMAGE
      ],
    });
  });
});
