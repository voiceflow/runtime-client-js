import chai, { expect } from 'chai';
import chaiAsPromise from 'chai-as-promised';
import sinon from 'sinon';
import baseAxios from 'axios';
import App from '@/lib/App';
import { State } from "@voiceflow/runtime";
import { InteractResponse, InteractRequestBody } from '@/lib/Client/type';
import { GeneralTrace, RequestType, TraceType } from '@voiceflow/general-types';
import { TraceStreamAction } from '@voiceflow/general-types/build/nodes/stream';
import { AppState } from '@/lib/App/types';

chai.use(chaiAsPromise);

const VERSION_ID: string = 'dummy-version-id';

const GENERAL_RUNTIME_ENDPOINT_URL: string = 'https://localhost:4000';

const SPEAK_TRACE: GeneralTrace = {
    type: TraceType.SPEAK,
    payload: {
        message: "Books ought to have to have good endings."
    }
};
const BLOCK_TRACE: GeneralTrace = {
    type: TraceType.BLOCK,
    payload: {
        blockID: 'some-block-id'
    }
};

const CHOICE_TRACE: GeneralTrace = {
    type: TraceType.CHOICE,
    payload: {
        choices: [
            { name: 'Do you have small available?' },
            { name: "I'd like to order a large please" },
            { name: "I'd like the small  thank you very much" }
        ]
    }
};

const FLOW_TRACE: GeneralTrace = {
    type: TraceType.FLOW,
    payload: {
        diagramID: 'some-diagram-id'
    }
};

const STREAM_TRACE: GeneralTrace = {
    type: TraceType.STREAM,
    payload: {
        src: 'the source-string',
        action: TraceStreamAction.LOOP,
        token: 'some token for the stream'
    }
}

const DEBUG_TRACE: GeneralTrace = {
    type: TraceType.DEBUG,
    payload: {
        message: "*** this is some debugging message ***"
    }
};

const END_TRACE: GeneralTrace = {
    type: TraceType.END
};

const VF_APP_INITIAL_STATE: State = {
    stack: [
        {
            programID: 'some-program-id',
            storage: {},
            variables: {}
        }
    ],
    storage: {},
    variables: {
        age: 0,
        name: '',
        gender: '',
    }
}

const START_REQUEST_BODY: InteractRequestBody = {
    state: VF_APP_INITIAL_STATE,
    request: null,
};

const VF_APP_NEXT_STATE_1: State = {
    stack: [
        {
            programID: 'some-program-id',
            storage: {
                val1: 12,
            },
            variables: {
                val1: 3,
                val2: 17
            }
        }
    ],
    storage: {},
    variables: {
        age: 17,
        name: 'Samwise Gamgee',
        gender: 'Male',
    }
};

const START_RESPONSE_BODY: InteractResponse = {
    state: VF_APP_NEXT_STATE_1,
    request: null,
    trace: [
        SPEAK_TRACE,
        BLOCK_TRACE,
        FLOW_TRACE,
        STREAM_TRACE,
        DEBUG_TRACE,
        CHOICE_TRACE,
    ]
};

const EXPOSED_VF_APP_NEXT_STATE_1: AppState = {
    state: VF_APP_NEXT_STATE_1,
    trace: [ SPEAK_TRACE ],
    end: false,
};

const USER_RESPONSE = 'This is what the user says in response to the voice assistant';

const SEND_TEXT_REQUEST_BODY: InteractRequestBody = {
    state: VF_APP_NEXT_STATE_1,
    request: {
        type: RequestType.TEXT,
        payload: USER_RESPONSE
    }
};

const VF_APP_NEXT_STATE_2: State = {
    stack: [
        {
            programID: 'some-program-id',
            storage: {
                val1: 37,
            },
            variables: {
                val1: -20,
                val2: 55
            }
        }
    ],
    storage: {},
    variables: {
        age: 34,
        name: 'Frodo Baggins',
        gender: 'Male',
    }
};

const SEND_TEXT_RESPONSE_BODY: InteractResponse = {
    state: VF_APP_NEXT_STATE_2,
    request: null,
    trace: [
        SPEAK_TRACE,
        END_TRACE
    ]
};

const EXPOSED_VF_APP_NEXT_STATE_2: AppState = {
    state: VF_APP_NEXT_STATE_2,
    trace: [ SPEAK_TRACE ],
    end: true,
};

const asHttpResponse = (data: object) => ({ data });

const createVFApp = () => {
  const axiosInstance = {
    get: sinon.stub(),
    post: sinon.stub(),
    put: sinon.stub(),
    patch: sinon.stub(),
    delete: sinon.stub(),
    defaults: {},
  };

  const axiosCreate = sinon.stub(baseAxios, 'create').returns(axiosInstance as any);

  const VFApp = new App({ versionID: VERSION_ID });

  return { VFApp, axiosCreate, axiosInstance };
};

describe('App', () => {
    afterEach(() => {
        sinon.restore();
    });

    it('constructor', () => {
        const { axiosCreate } = createVFApp();

        expect(axiosCreate.callCount).to.eql(1);
        expect(axiosCreate.args[0]).to.eql([
            {
                baseURL: GENERAL_RUNTIME_ENDPOINT_URL,
            }
        ]);
    });

    it('start', async () => {
        const { VFApp, axiosInstance } = createVFApp();

        axiosInstance.get.resolves(asHttpResponse(VF_APP_INITIAL_STATE));
        axiosInstance.post.resolves(asHttpResponse(START_RESPONSE_BODY));

        const data = await VFApp.start();

        expect(axiosInstance.get.callCount).to.eql(1);
        expect(axiosInstance.get.args[0]).to.eql([`/interact/${VERSION_ID}/state`]);

        expect(axiosInstance.post.callCount).to.eql(1);
        expect(axiosInstance.post.args[0]).to.eql([
            `/interact/${VERSION_ID}`,
            START_REQUEST_BODY
        ]);

        expect(data).to.eql(EXPOSED_VF_APP_NEXT_STATE_1);
    });

    it('start, pulls the cached initial state', async () => {
        const { VFApp, axiosInstance } = createVFApp();

        axiosInstance.get.resolves(asHttpResponse(VF_APP_INITIAL_STATE));
        axiosInstance.post.resolves(asHttpResponse(START_RESPONSE_BODY));

        const data1 = await VFApp.start();

        axiosInstance.post.resolves(asHttpResponse(START_RESPONSE_BODY));

        const data2 = await VFApp.start();

        expect(axiosInstance.get.callCount).to.eql(1);
        expect(axiosInstance.get.args[0]).to.eql([`/interact/${VERSION_ID}/state`]);

        expect(axiosInstance.post.callCount).to.eql(2);
        expect(axiosInstance.post.args[0]).to.eql([
            `/interact/${VERSION_ID}`,
            START_REQUEST_BODY
        ]);
        expect(axiosInstance.post.args[1]).to.eql([
            `/interact/${VERSION_ID}`,
            START_REQUEST_BODY
        ]);

        expect(data1).to.eql(EXPOSED_VF_APP_NEXT_STATE_1);
        expect(data2).to.eql(EXPOSED_VF_APP_NEXT_STATE_1);
    });

    it('sendText', async () => {
        const { VFApp, axiosInstance } = createVFApp();

        axiosInstance.get.resolves(asHttpResponse(VF_APP_INITIAL_STATE));
        axiosInstance.post.resolves(asHttpResponse(START_RESPONSE_BODY));

        await VFApp.start();

        axiosInstance.post.resolves(asHttpResponse(SEND_TEXT_RESPONSE_BODY));

        const data = await VFApp.sendText(USER_RESPONSE);

        expect(axiosInstance.post.callCount).to.eql(2);
        expect(axiosInstance.post.args[1]).to.eql([
            `/interact/${VERSION_ID}`,
            SEND_TEXT_REQUEST_BODY
        ]);

        expect(data).to.eql(EXPOSED_VF_APP_NEXT_STATE_2);
    });

    it('makeRequestBody, uninitialized app state error', async () => {
        const { VFApp } = createVFApp();

        return expect(VFApp.sendText("call sendText without calling .start() first"))
            .to.be.eventually.be.rejectedWith('the appState in VFClient.App was not initialized')
            .and.be.an.instanceOf(Error);
    });
});