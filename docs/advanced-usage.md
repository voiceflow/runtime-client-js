# Advanced Usage

---

## Table of Contents

- [Main Components](#main-components)
  - [`RuntimeClientFactory`](#runtimeclientfactory)
  - [`RuntimeClient`](#runtimeclient)
- [Statefulness of RuntimeClient](#statefulness-of-runtimeclient)
  - [Conversation Session](#conversation-session)
  - [Interaction Methods](#interaction-methods)
  - [Response Methods](#response-methods)
- [Context](#context)
  - [`.getResponse()`](#getresponse)
  - [`.isEnding()`](#isending)
  - [`.getChips()`](#getchips)
- [Configuration](#configuration)
  - [`tts`](#tts)
  - [`ssml`](#ssml)
  - [`includeTypes`](#includetypes)
  - [`traceProcessor`](#traceprocessor)
- [`makeTraceProcessor`](#maketraceprocessor)
  - [Handler Signatures](#handler-signatures)
    - [Speak](#speak)
    - [Debug](#debug)
    - [Visual](#visual)
    - [Choice](#choice)
    - [Exit](#exit)
    - [Flow](#flow)
    - [Block](#block)
- [Variables](#variables)
  - [Getters](#getters)
  - [Setters](#setters)
  - [Enabling Stricter Typing](#enabling-stricter-typing)
- [Multiple Applications](#multiple-applications)
- [Backend Usage](#backend-usage)
  - [Problem](#problem)
  - [Solution](#solution)
- [Best Practices](#best-practices)
- [Advanced Trace Types](#advanced-trace-types)
- [Runtime](#runtime)

## Main Components

The main components from `runtime-client-js` you should understand are the `RuntimeClientFactory` and the `RuntimeClient`. We will briefly introduce each component. We provide more detail in following sections.

### `RuntimeClientFactory`

The `RuntimeClientFactory` is a factory class that is used to create `RuntimeClient` instances, which are set to the same configuration passed into the factory itself.

For example, the `RuntimeClientFactory` accepts a `versionID`, let's say it has value `fishandchips`, representing the Voiceflow app we want to start a conversation with. Any `RuntimeClient` we construct with this particular factory will then contact the same Voiceflow app with the `versionID` of `fishandchips`

### `RuntimeClient`

The `RuntimeClient` is an object that represents one instance of a Voiceflow app. This is the main interface you use to interact with a Voiceflow app, advance the conversation session, and get a response. You do not construct `RuntimeClient`s directy.

## Statefulness of RuntimeClient

A `RuntimeClient` instance is a **stateful** object that represents some Voiceflow (VF) application. It has **interaction methods** such as `.sendText()` which produce side-effects that modify the `RuntimeClient`'s internal state, which represents the state of the current conversation session (which we will define shortly).

### Conversation Session

We frequently refer to a conversation session in the documentation. A **conversation session** is an ongoing execution of the Voiceflow app.

The `RuntimeClient` is said to store the current state of the conversation session. The most recent `Context` object returned by an interaction method contains the state of the current conversation session.

Typically, a conversation session begins when you call **`.start()`** and it is said to have terminated when some `context` returned by a subsequent interaction method returns `true` for **`.isEnding()`.** For example:

```js
const context1 = await app.start(); // start a new conversation session
console.log(context1.isEnding()); // prints 'false' so conversation session hasn't ended

const context2 = await app.sendText(userInput); // advance the conversation
console.log(context2.isEnding()); // prints "false" so conversation session hasn't ended

const context3 = await app.sendText(userInput); // advance the conversation
console.log(context3.isEnding()); // prints "true" so conversation session has ended!
```

Alternatively, the current conversation session can end if we call `.start()` to start a new session from the beginning.

### Interaction Methods

An **interaction method** is any method of `RuntimeClient` which sends a request to our runtime servers. Interaction methods transition the conversation session and produce side-effects on the current internal state of `RuntimeClient`.

Specifically, an interaction method produces side-effects by sending the current internal state of `RuntimeClient` to our runtime servers. The servers compute the next state of the Voiceflow application and send it back to the `RuntimeClient`, and when the response arrives, the `RuntimeClient` updates its current internal state to the new application state.

This process of sending a request to the runtime servers, computing the next state, and storing it in `RuntimeClient`'s internal storage is referred to as **starting/advancing the conversation (session)**, depending on what side-effect is produced.

Different interaction method have different side-effects on the conversation session. To summarize:

1. `.start()` - Starts the conversation session and runs the application until it requests user input, at which point, the method returns the current `context`. If this is called while a conversation session is ongoing, then it starts a new conversation session from the beginning.
2. `.sendText(userInput)` - Advances the conversation session based on the user's input and then runs the application until it requests user input, at which point, the method returns the current `context`.

Now, only certain interaction methods are allowed to be called at certain points in conversation session.

1. `.start()` is callable any time.
2. `.sendText()` is callable only if the `RuntimeClient` contains some ongoing conversation session. That is, `runtimeClient.getContext().isEnding()` is `false`. If you call `.sendText()` when the return of the aforementioned `.isEnding()` call is `true`, then calling `.sendText()` throws an exception.

Thus, if `runtimeClient.getContext().isEnding()` is `true`, the only valid method you may call is `.start()` to restart the conversation session from the beginning.

### Response Methods

A **response method** is any method of `RuntimeClient` that looks like this: `.on___(callbackFn)` (i.e. `.onSpeak`). The `callbackFn` will look like this: `(trace, context) => ...` These get triggered whenever an interaction method is finished. Response methods allow you control the behavior of your app whenever based on the blocks in your Voiceflow project - by iterating through the `context.getTrace()` and matching the correct trace type.

To see what the trace contains, try something like `onSpeak((trace) => console.log(trace))`. For the definition of traces, see [Advanced Trace Types](#advanced-trace-types)

- `onSpeak(callbackFn)`
- `onAudio(callbackFn)`
- `onBlock(callbackFn)`
- `onDebug(callbackFn)`
- `onEnd(callbackFn)`
- `onFlow(callbackFn)`
- `onVisual(callbackFn)`
- `onChoice(callbackFn)`
- `on(type, callbackFn)`

Response methods accept promises and will execute with `async/await`. So if you do `.onSpeak(async (message) => await somePromise(message))`, the next response method won't trigger until this one is done.

## Context

For even more detail and control, Interaction methods all return a `Context` object. The `Context` is a snapshot of the Voiceflow application's state and includes data such as the variable values.

```js
const context1 = await chatbot.start();
const context2 = await chatbot.sendText(userInput);
```

As described in "Statefulness of RuntimeClient", interaction methods replace `RuntimeClient`'s copy of the conversation session state. However, these methods create a new `Context` object. We never modify previous `Context` objects inside of an interaction method. Therefore, we can access past application states through past `Context`s. This means you can build a **history** of `Context` objects and implement time-travelling capabilities in your chatbot.

The `Context` object has a handful of methods to expose its internal data. We will describe a subset of them below.

### `.getResponse()`

Returns a list of traces representing the Voiceflow app's response.

Although we say that the list of traces represents the app response, the `.getResponse()` is returning a **view** that presents a subset of all the traces returned by runtime server. By default, the `Context` will only expose `SpeakTrace`s through this view, so that we don't overwhelm the developer with irrelevant traces.

To expose the other trace types through `.getResponse()`, see the `includeTypes` option in the [Configuration](#configuration) section. Alternatively, you can view the unfiltered list of all traces using `context.getTrace()`.

```js
const response = context.getResponse();
response.forEach((trace) => console.log(trace.payload.message));
```

### `.isEnding()`

Returns `true` if the application state wrapped by the `Context` is the last state before the corresponding conversation session ended. Returns `false` otherwise.

This method is mainly used to detect when `RuntimeClient`'s current conversation session has ended and that the next valid interaction method is `.start()` to start a new conversation from beginning.

```js
do {
  const userInput = await frontend.getUserInput(); // listen for a user response
  const context = await app.sendText(userInput); // send the response to the app
  frontend.display(context.trace); // display the response, if any
} while (!context.isEnding()); // check if the current conversation is over.
terminateApp(); // perform any cleanup
```

### `.getChips()`

The `.getChips()` method returns a list of suggestion chips. If you are unfamiliar with this terminology, a **suggestion chip** is simply a suggested response that the user can send to a voice interface.

Suggestion chips can be passed into UI buttons. When the user presses one of these buttons, the button can trigger a click handler which automatically sends the suggested response on the user's behalf. An example illustrating this is shown below:

```js
const chips = context.getChips();
// => [{ name: "I would like a pizza", ... }, { name: "I would like a hamburger", ... }]

const createOnClickSuggestion = (chosenSuggestion) => () => {
  const context = await chatbot.sendText(chosenSuggestion);
}

chips.forEach(({ name }) => {
  frontend.addButton({
    text: name,
    callback: createOnClickSuggestion(name)
  });
});
```

You can also check our [samples](https://github.com/voiceflow/rcjs-examples) for a working implementation of suggestion chips on the browser.

## Configuration

The `RuntimeClientFactory` accepts configurations which it will apply to `RuntimeClient` instance it constructs. In particular, there is a `dataConfig` option for managing the data returned by `Context.getResponse()` for all `Context`s produced by a `RuntimeClient`. To summarize, there are four options currently available:

1. `tts` - Set to `true` to enable text-to-speech functionality. Any returned `SpeakTrace`s corresponding to Speak Steps on Voiceflow will contain an additional`src` property containing an `.mp3` string, which is an audio-file that will speak out the trace text. This option does not affect `SpeakTrace`s corresponding to Audio Steps in any way and a `src` property is always generated.
2. `ssml` - Set to `true` to disable the `Context`'s SSML sanitization and return the full text string with the SSML included. This may be useful if you want to use your own TTS system.
3. `includeTypes` - Set to a list of `TraceType` strings which are the additional trace types your want from `.getResponse()`. A speak-type trace is always returned by `.getResponse()`. For the full list of available trace types and their `TraceType` strings, see [Advanced Trace Types](#advanced-trace-types).
4. `traceProcessor` - Set to a "trace processor" function which will be automatically called whenever an interaction method like `.sendText()` receives new traces.

The Samples section has some working code demonstrating some of the configuration options. Also, see the subsections below for how to access the data exposed by `dataConfig` options.

```js
const app = new RuntimeClientFactory({
    versionID: 'XXXXXXXXXXXXXXXXX',
    dataConfig: {
      	tts: true,
      	ssml: true,
        includeTypes: ['debug', 'stream', 'block']
      	traceProcessor: myTraceProcessor
    }
});
```

### `tts`

Once you have this to `true`, you can access the TTS audio-file through `payload.src` in a `SpeakTrace` as shown below

```js
const speakTrace = context.getResponse()[0];
const audio = new Audio(speakTrace.payload.src); // HTMLAudioElement
audio.play();
```

### `ssml`

When this is set to `true`, the `message` string returned by a `SpeakTrace` will contain your SSML that you added through Voiceflow Creator.

```js
console.log(context.getResponse());
/* prints out the following:
[
  {
    "type": "speak",
    "payload": {
      "message": "<voice name=\"Alexa\">Welcome to Voiceflow Pizza! </voice>"
    }
  },
  {
    "type": "speak",
    "payload": {
      "message": "<voice name=\"Alexa\">How can I help? </voice>"
    }
  }
]
*/
```

### `includeTypes`

Once you have specified additional trace types, you will need some conditional logic to check what kind of trace you're looking at. We recommend using [`makeTraceProcessor`](#maketraceprocessor) to handle the boilerplate conditional logic for you.

```js
// Configure `includeTypes` to show debug traces
const factory = new RuntimeClientFactory({
  versionID: 'XXXXXXXXXXXXXXXXX',
  dataConfig: {
    includeTypes: ['debug'],
  },
});
const app = factory.createClient();

// Get the response and check if we have a speak or debug trace.
const traces = context.getResponse();
traces.forEach(({ type, payload }) => {
  switch (type) {
    case 'speak':
      return handleSpeakPayload(payload);
    case 'debug':
      return handleDebugPayload(payload);
    default:
      throw new Error('Unknown trace type');
  }
});
```

### `traceProcessor`

This option accepts any kind of function that accepts a `GeneralTrace`, but it might be easier to use `makeTraceProcessor`

```js
const traceProcessor = makeTraceProcessor({
  speak: (message) => console.log(message),
});

const factory = new RuntimeClientFactory({
  versionID: 'XXXXXXXXXXXXXXXXX',
  traceProcessor,
});
const app = factory.createClient();

const context = await app.start();
context.getResponse().forEach(traceProcessor); // this line is implicitly called
```

## `makeTraceProcessor`

A typical pattern for handling a Voiceflow app's response is to use a higher-order function (e.g. `map`) to invoke a callback on each trace in `Context.trace`.

Unfortunately, if we also use the `includeTypes` property then there are many types of traces, each with their own unique attributes. If we wanted to process the entire list of traces, we would need boilerplate logic to (1) check the trace type, (2) unpack the data in the `payload` attriute, (3) pass that data into the appropriate handler.

Instead the `runtime-client-js` package exposes a utility called `makeTraceProcessor` which allows you to quickly define a **trace processor** function that can be passed as a callback of a higher-order function (see below).

The trace processor function will take in a `GeneralTrace` object, then determine which specific type of trace it is, e.g., a `SpeakTrace`. Then, it extracts the attributes in that trace's `payload` object and passes them as individual arguments to call a handler function that you specify.

See a working project that uses `makeTraceProcessor` [here](https://github.com/voiceflow/rcjs-examples/tree/master/trace-processor).

**Arguments:**

- `handlerMap` - `object` - An object whose keys are `TraceType` strings (e.g. speak`for` `SpeakTrace`s), and whose values are handlers for that trace type. The full list of handler signatures is in the following subsection. For the full list of `TraceType` strings, see [Advanced Trace Types](#advanced-trace-types)

**Returns:**

- `traceProcessor` - `(trace: GeneralTrace) => any` - A function that accepts any trace type and returns the return value of that trace type's handler in `handlerMap`

**Example:**

```js
import { makeTraceProcessor } from '@voiceflow/runtime-client-js';

// Defining a trace processor
const i = 0;
const traceProcessor = makeTraceProcessor({
  speak: (message) => {
    console.log(`speakHandler says: ${message}`);
    return `vf-speak-${++i}`;
  },
});

// Usage
async () => {
  const context = await chatbot.start();

  const result1 = context.getResponse().map(traceProcessor);
  // e.g. result = ['vf-speak-1', 'vf-speak-2', 'vf-speak-3']
};
```

### Handler Signatures

The argument types shown in the handler signatures are simplified. The arguments are ultimately the attributes from a trace's `payload` attribute. To see more precise types for the handler arguments, find the corresponding payload attribute's type defined in [Advanced Trace Types](#advanced-trace-types)

### Speak

The `SpeakTrace` handler can either be a function or an object with properties `handleAudio` and `handleSpeech`. If you are only expecting `SpeakTrace`s from only Speak Steps or only Audio Steps, then this might be simpler.

Otherwise, if you are expecting both types to be returned by `.getResponse()`, you can pass in an object with two handlers, one for Audio Steps, the other for Speak Steps, and the trace processor will call the correct handler for you.

```ts
// OPTION 1
type SpeakTraceHandlerFunction = (
  message: string,
  src: undefined | string,
  type: undefined | string,
) => any;

const traceProcessor = makeTraceProcessor({
    speak: (message) => {
        console.log(`speakHandler says: ${message}`);
      	return `vf-speak-${++i}`;
    },
});

// OPTION 2
type SpeakTraceHandlerMap = {
  handleAudio: undefined | (message: string, src: string) => any;
  handleSpeech: undefined | (message: string, src: string) => any;
};

const traceProcessor = makeTraceProcessor({
    speak: {
      handleAudio: (message) => console.log(`audio file = ${message}`),
      handleSpeech: (message) => console.log(`text = ${message}`)
    },
});
```

### Debug

```ts
type DebugTraceHandler = (message: string) => any;

const traceProcessor = makeTraceProcessor({
  debug: (message) => errorLogger.log(message),
});
```

### Visual

```ts
type VisualTraceHandler = (
  image: string | null,
  device: string | null,
  dimensions: { width: string; height: string } | null,
  canvasVisibility: 'full' | 'cropped'
) => any;

const traceProcessor = makeTraceProcessor({
  visual: (image) => frontend.displayImage(image),
});
```

### Choice

```ts
type Choice = {
  intent: undefined | string;
  name: string;
}[];
type ChoiceTraceHandler = (choices: Choice[]) => any;

const traceProcessor = makeTraceProcessor({
  choice: (choices) => showSuggestionChips(choices.map((choice) => choice.name)),
});
```

### Exit

Note that we sometimes refer to an `ExitTrace` with `"end"` instead.

```ts
type EndTraceHandler = () => any;

const traceProcessor = makeTraceProcessor({
  end: () => console.log('Got an end/exit trace!'),
});
```

### Flow

```ts
type FlowTraceHandler = (diagramID: string) => any;

const traceProcessor = makeTraceProcessor({
  flow: (diagramID) => console.log(diagramID),
});
```

### Block

```ts
type BlockTraceHandler = (blockID: string) => any;

const traceProcessor = makeTraceProcessor({
  block: (blockID) => console.log(blockID),
});
```

## Variables

### Getters

Voiceflow projects have variables that are modified as the app is executing. You can access the variable state at a particular point in time through `context.variables`. Recall that a `Context` is a snapshot of app state, so the value of `.variables` at one particular `Context` is the value of the variables at some previous fixed point in time.

- `.get(variableName)` - Used to retrieve a single variable value
- `.getAll()` - Returns an object containing all variables
- `.getKeys()` - Returns a list of variable names

```js
const context = await app.sendText('I would like a large cheeseburger');

const name = context.variables.get('name');

const allVariables = context.variables.getAll();
const name = allVariables.name;

const keys = context.variables.getKeys();
```

### Setters

You can also set variables through a `Context`

- `.set(variableName, value)` - Sets `variableName` to have the given `value`
- `.setMany(map)` - Sets all variables which appear as keys in `map`to the corresponding value in `map`.

```js
context.variables.set('name', 'Jean-Luc Picard');
context.variables.setMany({
  name: 'Jean-Luc Picard',
  age: 52,
});
```

**WARNING:** This is an unsafe feature and you should know what you're doing before using it.

If you want to set variables to affect the result of the next interaction, then you should set the variables of the **most recent** `Context` returned by an interaction. Interaction methods will return a reference to the `RuntimeClient`'s current internal `Context` object, which will be used for the next state transition.

Recall that each `Context` returned by the `RuntimeClient` is a snapshot of the Voiceflow app state at some point in time. Setting the variables on `context1` will not affect variables values on `context2`.

Additionally, if you want to implement time-travelling and keep a record of past `Context`s, then do **not** use a setter, as it will modify any past `Context`s that you call the setter on, thus, leaving your record in a misleading state.

### Enabling Stricter Typing

The Runtime Client is implemented in TypeScript and has strict types on all of its methods. The `.variables` submodule can also be configured to support stricter types.

To do this, you must supply a variable **schema** to the `RuntimeClientFactory`. Once you do, variable methods like `.get()` will deduce the variable type based on the variable name you pass in as an argument (see below).

Since Voiceflow apps are loaded in at runtime, it is impossible for the `RuntimeClient` to deduce the types of variables for you. It is up to you to define what types you expect to receive and to ensure your Voiceflow app will only send back what you expect.

```ts
export type VFVariablesSchema = {
  age: number;
  name: string;
};

const factory = new RuntimeClientFactory<VFVariablesSchema>({
  versionID: 'some-version-id',
});
const app = factory.createClient();

const context = await app.start();

const name = context.variables.get('name'); // return value is inferred to be a "string"
context.variables.set('name', 12); // TypeError! expected a "number" not a "string"
```

## Multiple Applications

You can integrate any number of different Voiceflow applications to your project, simply by constructing multiple `RuntimeClientFactory` instances, then constructing the `RuntimeClient` with `.createClient()`.

**NOTE:** If you are integrating the Voiceflow app on the backend, we do **not** recommend creating a disposable chatbot with `.createClient()` to serve each request. This approach **will not persist the conversation session** between requests and trying to overcome this by persisting the chatbot object is **not scalable**. To integrate `runtime-client-js` on your backend, see [Backend Usage](#backend-usage)

```js
import RuntimeClientFactory from '@voiceflow/runtime-client-factory';

const customerSupportBotFactory = new RuntimeClientFactory({
  versionID: 'support-bot-1-id',
});
const supportBot1 = customerSupportBotFactory.createClient();
const supportBot2 = customerSupportBotFactory.createClient(); // independent from supportBot1

const orderBotFactory = new RuntimeClientFactory({
  versionID: 'order-bot-id',
});
const orderBot = orderBotFactory.createClient();
```

## Backend Usage

### Problem

In the backend, we may want to create a `RuntimeClient` to service a request from our clients. Previously in this document, we mainly described how to use `RuntimeClient` on the frontend by initializing it as a stateful global object. However, in the backend this approach does not work.

Ideally, we don't want to persist a `RuntimeClient` for every client that sends requests to our backend. This approach would not be scalable, because each `RuntimeClient` instance consumes memory. Thus, 1,000,000 active users on our backend means 1,000,000 active `RuntimeClient` objects running in our backend program.

```js
// Our factory
const factory = new RuntimeClientFactory({
  versionID: 'fdsafsdafsdfsdf',
});

// Our collection of RuntimeClients
const runtimeClients = {};

// An endpoint in Express
app.get('/', async (req, res) => {
  if (!runtimeClients[req.userID]) {
    // BAD PRACTICE - Will consume a significant amount of memory if # of users grows
    runtimeClients[req.userID] = factory.createClient();
  }

  const context = await runtimeClients[req.userID].sendText(req.userInput);

  return context.getResponse();
});
```

However, we can't just deallocate the `RuntimeClient` for the current request, then construct a new `RuntimeClient` during the next request. Each `RuntimeClient` contains the conversation session and deallocating it would lose that information. So any input the user provided, such as their name, would be lost. Moreover, when we create a new `RuntimeClient` for the next session, it will start the conversation again from the beginning!

```js
// An endpoint in Express
app.get('/', async (req, res) => {
  // WRONG - This will start the app from the beginning at every request
  const client = factory.createClient();

  const context = await client.sendText(req.userInput);

  return context.getResponse();
});
```

### Solution

The `.createClient()` can accept an additional `state` object, which solves the problem of using the `RuntimeClient` on the backend. The `.createClient()` method has different behaviour depending on the value of `state`

1. If `state` is `undefined`, then `createClient()` behaves as before and creates an entirely new `RuntimeClient`
2. If `state` is a valid Voiceflow application `State`, then `createClient()` creates a `RuntimeClient` with the provided `state`, thus, regenerating the same chatbot from a previous request.

After each request, you can extract the current `RuntimeClient` state by calling `context.toJSON().state`. Then, you can store this state in a database such as MongoDB. When the next request comes in, read the conversation state for that particular user from DB, then wrap the state with a `RuntimeClient` by calling `.createClient(state)`. This approach allows you to persist a client's conversation session between requests.

```js
app.post('/:userID', async (req, res) => {
  const { userID } = req.params;
  const { userInput } = req.body;

  // pull the current conversation session of the user from our DB
  const state = await db.read(userID);
  const firstInteraction = !state;

  // if `state` is `undefined` then allocate a new client
  const client = runtimeClientFactory.createClient(state);

  // send the next user request
  const context = firstInteraction ? await client.start() : await client.sendText(userInput);

  // check if we need to cleanup the conversation session
  if (context.isEnding()) {
    db.delete(userID);
  } else {
    await db.insert(userID, context.toJSON().state);
  }

  // send the traces
  res.send(context.getResponse());
});
```

Conceptually, the `RuntimeClient` can be used on the frontend as a stateful global object. In the backend, you should think of the `RuntimeClient` as a disposable wrapper around independent `state` object, which you can use to perform operations on the `state`.

For a full-working sample demonstrating this technique, see [here](https://github.com/voiceflow/rcjs-examples/tree/master/server).

## Best Practices

Keep in mind that the `State` object in a Voiceflow application state will contains the value of any Voiceflow variables. We strongly recommend not embedding any sensitive information in Voiceflow variables or in any of your Voiceflow app responses. The `State` is transmitted over HTTP requests to our runtime servers.

## Advanced Trace Types

A `GeneralTrace` is an object which represents one piece of the overall response from a Voiceflow app. Specialized traces like `SpeakTrace` are a sub-type of the more abstract `GeneralTrace` super-type, as shown below.

```ts
export type GeneralTrace = ExitTrace | SpeakTrace | ChoiceTrace | FlowTrace | StreamTrace | BlockTrace | DebugTrace | VisualTrace;
```

All trace obejcts have a `type` and `payload` property, but differ in what the value of `type` and `payload` is. Shown below is a type that describes the common structure of trace objects. **NOTE**: the `Trace` type isn't actually declared in the package and is only shown for illustration.

```ts
const Trace<T extends TraceType, P> = {
  trace: T;
  payload: P;
};
// e.g. type SpeakTrace = Trace<TraceType.SPEAK, { message: string, src: string, type?: string }>
```

In TypeScript, the `string enum` called `TraceType` is exported by this package and you can use it to quickly access the trace type string. A partial list of the available trace types is shown below.

```js
enum TraceType {
    END = "end",
    FLOW = "flow",
    SPEAK = "speak",
    BLOCK = "block",
    DEBUG = "debug",
    CHOICE = "choice",
    VISUAL = "visual"
}
```

For each of the specialized trace types, we will describe each trace's purpose and their payload structure below.

### SpeakTrace

- **PURPOSE:** Contains the "real" response of the voice interface. Corresponds to a Speak Step or Audio Step on Voiceflow.
- **PAYLOAD:**
  - **`message`** - The text representation of the response from the voice interface. We strip any SSML that you may have added to the response on Voiceflow. To see the SSML, see the `ssml` option for the `RuntimeClient` constructor.
  - **`type`** - If `"audio"`, then this `SpeakTrace` corresponds to an Audio Step on the Voiceflow diagram. If `"message"`, then this corresponds to a Speak Step on the Voiceflow diagram.
  - **`src`** - If `type` is `"audio"`, then this property always appears and contains a URL to the audio-file associated with the Audio Step. If `type` is `"message"`, then this property only appears if the `tts` option in `RuntimeClient` constructor is set to `true`.
  - **`voice`** - Only appears if `type` is `"message"` and `tts` is enabled. This property is the name of the voice assistant you chose to read out the Speak Step text.

```ts
enum SpeakType {
  AUDIO = 'audio',
  MESSAGE = 'message',
}
type P = {
  message: string;
  type: SpeakType;
  src?: string | null;
  voice?: string;
};
```

### DebugTrace

- **PURPOSE:** Contains a message that describes the control flow of the Voiceflow, e.g, matched intents, which blocks to move to.
- **PAYLOAD:**
  - **`message`** - A message illustrating the Voiceflow App's control flow. Intended only to be seen by the developers.

```ts
type P = {
  message: string;
};
```

### VisualTrace

- **PURPOSE:** Contains the data used by the Visual Step to display images.
- **PAYLOAD:**
  - **`image`** - URL to the image asset being displayed.
  - **`device`** - What device the Visual Step is meant to be displayed on.
  - **`dimensions`** - Your custom dimensions, if any.
  - **`canvasVisibility`** - If you've toggled "Actual Size" on the Voiceflow Creator this attribute will have the value `"full"`. Otherwise, if you toggled "Small", then this attribute will have the value `"cropped"`.
  - **`visualType`** - Our internal code supports other visuals systems like APL. However, this is not relevant to a General Project, so you should ignore this property.

```ts
export declare enum DeviceType {
  MOBILE = 'mobile',
  TABLET = 'tablet',
  DESKTOP = 'desktop',
  SMART_WATCH = 'smart_watch',
  TELEVISION = 'television',
  IN_CAR_DISPLAY = 'in_car_display',
  ECHO_SPOT = 'echo_spot',
  ECHO_SHOW_8 = 'echo_show_8',
  ECHO_SHOW_10 = 'echo_show_10',
  FIRE_HD_8 = 'fire_hd_8',
  FIRE_HD_10 = 'fire_hd_10',
  FIRE_TV_CUBE = 'fire_tv_cube',
  GOOGLE_NEST_HUB = 'google_nest_hub',
}

type P = {
  image: string | null;
  device: DeviceType | null;
  dimensions: null | { width: number; height: number };
  canvasVisibility: 'full' | 'cropped';
  visualType: 'image';
};
```

### ChoiceTrace

- **PURPOSE:** Contains suggested response that the user can make. Only appears at the end of a list of traces returned by the app. We recommend using `.getChips()` to access the suggested responses, rather than processing this trace manually.
- **PAYLOAD:**

```ts
type P = {
  choices: { intent?: string; name: string }[];
};
```

### ExitTrace

- **PURPOSE:** Indicates if the Voiceflow app has terminated or not. Only appears at the end of a list of traces returned by the app. We recommend using `.isEnding()` to determine if the conversation is over, rather than processing this trace manually.
- **PAYLOAD:** The payload is `undefined`

### FlowTrace

- **PURPOSE:** Indicates that the Voiceflow app has switched into a flow. This might be useful for debugging.
- **PAYLOAD:**
  - **`diagramID`** - The ID of the Flow the app is stepping into.

```ts
type P = {
  diagramID: string;
};
```

### BlockTrace

- **PURPOSE:** Indicates that the Voiceflow app has entered a block.
- **PAYLOAD:**
  - **`blockID`** - The ID of the block that the app is stepping into.

```ts
type P = {
  blockID: string;
};
```

## Runtime

As the name suggests, `runtime-client-js` interfaces with a Voiceflow "runtime" server. You can check out our [runtime SDK](https://github.com/voiceflow/general-runtime) for building runtime servers. Modifying the runtime allows for extensive customization of bot behavior and integrations.

By default, the client will use the Voiceflow hosted runtime at `https://general-runtime.voiceflow.com`. To configure the client to consume your custom runtime, you should use the `endpoint` configuration option shown below. This option will change the target URL of runtime server that `RuntimeClient` instances sends its request to.

```js
const factory = new RuntimeClientFactory({
  versionID: '5fa2c62c71d4fa0007f7881b',
  endpoint: 'https://localhost:4000', // change to a local endpoint or your company's production servers
  dataConfig: {
    includeTypes: ['visual'],
  },
});
```
