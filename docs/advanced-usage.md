# Advanced Usage

---

## Table of Contents

- [Advanced Usage](#advanced-usage)
  - [Table of Contents](#table-of-contents)
  - [Main Components](#main-components)
    - [`RuntimeClientFactory`](#runtimeclientfactory)
    - [`RuntimeClient`](#runtimeclient)
  - [Statefulness of RuntimeClient](#statefulness-of-runtimeclient)
    - [Conversation Session](#conversation-session)
    - [Interaction Methods](#interaction-methods)
  - [Events](#events)
    - [Event Types](#event-types)
    - [Event Handlers](#event-handlers)
  - [Context](#context)
    - [`.isEnding()`](#isending)
    - [`.getChips()`](#getchips)
  - [Configuration](#configuration)
    - [`tts`](#tts)
    - [`ssml`](#ssml)
  - [Variables](#variables)
    - [Getters](#getters)
    - [Setters](#setters)
    - [Enabling Stricter Typing](#enabling-stricter-typing)
  - [Multiple Applications](#multiple-applications)
  - [Backend Usage](#backend-usage)
    - [Problem](#problem)
    - [Solution](#solution)
  - [Best Practices](#best-practices)
  - [Trace Types](#trace-types)
    - [SpeakTrace](#speaktrace)
    - [AudioTrace](#audiotrace)
    - [DebugTrace](#debugtrace)
    - [VisualTrace](#visualtrace)
    - [ChoiceTrace](#choicetrace)
    - [ExitTrace](#exittrace)
    - [FlowTrace](#flowtrace)
    - [BlockTrace](#blocktrace)
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
3. `.sendIntent(intentName, entities)` - Advances the conversation session based an intent being invoked - make sure that the `intentName` exists in the interaction model on your Voiceflow project. This bypasses NLP/NLU resolution, and is useful in explicitly triggering certain conversation paths. The method returns the current `context`.

Now, only certain interaction methods are allowed to be called at certain points in conversation session.

1. `.start()` is callable any time.
2. `.sendText()` and `.sendIntent()` are callable only if the `RuntimeClient` contains some ongoing conversation session. That is, `runtimeClient.getContext().isEnding()` is `false`. If you call `.sendText()` when the return of the aforementioned `.isEnding()` call is `true`, then calling `.sendText()` throws an exception.

Thus, if `.isEnding()` is `true`, the only valid method you may call is `.start()` to restart the conversation session from the beginning.

## Events

The `RuntimeClient` has an event system that notifies the developer of any changes in the `RuntimeClient`'s data. 

### Event Types

Trace Events when the `RuntimeClient` receives a response from our Runtime servers. For each trace that `RuntimeClient` receives from our Runtime servers we trigger a corresponding event for that trace.

The full list of events is listed below.

- `TraceType.X` - When a specific trace of type `X` is being processed, there is a corresponding event that is fired, e.g., if `SpeakTrace` is received then the `TraceType.SPEAK` event is triggered.
- `TRACE_EVENT` - Triggered when any trace is being processed.

Moreover, Trace Events are **guaranteed to occur in the order of the trace response**. For example, if the `RuntimeClient` received a list containing `BlockTrace`, `SpeakTrace`, `DebugTrace`, `SpeakTrace` in that order, then the following events will occur in this exact order:

- `TraceType.BLOCK`
- `TRACE_EVENT`
- `TraceType.SPEAK` - Corresponds with the first `SpeakTrace` in the list
- `TRACE_EVENT`
- `TraceType.DEBUG`
- `TRACE_EVENT`
- `TraceType.SPEAK` - Corresponds with the second `SpeakTrace` in the list
- `TRACE_EVENT`

### Event Handlers

To register an event handler, use the below methods:

- `.on(event: TraceType | TRACE_EVENT, handler: Function)` - This method is used to register `handler` on the given `event`
- `.onSpeak(handler: Function)` - This method is used to register `handler` on a `TraceType.SPEAK` event. There exists equivalents for all other trace types as well.

Note, since Trace Events occur in the order of the trace response, then handlers also execute sequentially in the order. That is, we call handlers for a trace in the response list, only after all previous traces in the list are handled.

```ts
rclient.on(TraceType.SPEAK, (trace, context) => {		// register a handler for only SpeakTraces
  console.log(trace.payload.message);								// traces will be added to your local store in order
});
rclient.on(TRACE_EVENT, (trace, context) => {				// register a handler for any GeneralTrace
  console.log(trace);
});
await rclient.start();															// trigger event handler if `SpeakTrace` received
```

You can remove event handlers using the `.off()` function as shown below. 

- `.off(event: TraceType | TRACE_EVENT, handler: Function)`

Another thing to note, event handlers can be asynchronous. Since traces are processed sequentially, you can create a delay between the handling of each trace by instantiating a promise with a timeout. This is helpful for implementing fancy UI logic that creates a delay between the rendering of text responses.

```js
rclient.on(TraceType.SPEAK, (trace, context) => {		
  // Unpack the data from the `.payload`
	const { payload: { message, src } } = trace;
  
  // Add the response text to the store, so it triggers a UI update.
  myStore.traces.push(trace.payload.message);

  // Construct an HTMLAudioElement to speak out the response text.
  const audio = new Audio(src);
  await new Promise(res => audio.addEventListener('loadedmetadata', res));

  // Play the audio and wait until the audio finishes, before displaying the next SpeakTrace
  audio.play();
  await new Promise(res => setTimeout(res, audio.duration * 1000));
});
await rclient.start();
```

If you are working in TypeScript, you will get auto-completion for `trace` objects. Alternatively, for documentation on each trace's payload, see [Trace Types](#trace-types).



## Context

For even more detail and control, Interaction methods all return a `Context` object. The `Context` is a snapshot of the Voiceflow application's state and includes data such as the variable values.

```js
const context1 = await chatbot.start();
const context2 = await chatbot.sendText(userInput);
```

As described in "Statefulness of RuntimeClient", interaction methods replace `RuntimeClient`'s copy of the conversation session state. However, these methods create a new `Context` object. We never modify previous `Context` objects inside of an interaction method. Therefore, we can access past application states through past `Context`s. This means you can build a **history** of `Context` objects and implement time-travelling capabilities in your chatbot.

The `Context` object has a handful of methods to expose its internal data. We will describe a subset of them below.

### `.getTrace()`

Returns a list of traces representing the Voiceflow app's response. We recommend using the event-system instead if you want to handle the data in the response.

```js
const response = context.getTrace();
response.forEach((trace) => {
  if (trace.type === TraceType.SPEAK) {
  	console.log(trace.payload.message)
  } else if (trace.type === TraceType.DEBUG) {
    errorLogger.log(trace.payload.message);
  }
});
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

The `RuntimeClientFactory` accepts configurations which it will apply to `RuntimeClient` instance it constructs. In particular, there is a `dataConfig` option for managing the data returned by `Context.getTrace()` for all `Context`s produced by a `RuntimeClient`. To summarize, there are four options currently available:

1. `tts` - Set to `true` to enable text-to-speech functionality. Any returned `SpeakTrace`s corresponding to Speak Steps on Voiceflow will contain an additional`src` property containing an `.mp3` string, which is an audio-file that will speak out the trace text. This option does not affect `SpeakTrace`s corresponding to Audio Steps in any way and a `src` property is always generated.
2. `ssml` - Set to `true` to disable the `Context`'s SSML sanitization and return the full text string with the SSML included. This may be useful if you want to use your own TTS system

The Samples section has some working code demonstrating some of the configuration options. Also, see the subsections below for how to access the data exposed by `dataConfig` options.

```js
const app = new RuntimeClientFactory({
    versionID: 'XXXXXXXXXXXXXXXXX',
    dataConfig: {
      	tts: true,
      	ssml: true,
    }
});
```

### `tts`

Once you have this to `true`, you can access the TTS audio-file through `payload.src` in a `SpeakTrace` as shown below

```js
const speakTrace = context.getTrace()[0];				 // assume first element is a SpeakTrace
const audio = new Audio(speakTrace.payload.src); // HTMLAudioElement
audio.play();
```

### `ssml`

When this is set to `true`, the `message` string returned by a `SpeakTrace` will contain your SSML that you added through Voiceflow Creator.

```js
console.log(context.getTrace());
/* prints out the following:
[
  {
    "type": "speak",
    "payload": {
      "message": "<voice name=\"Alexa\">Welcome to Voiceflow Pizza! </voice>"
    }
  },
  {
    "type": "debug",
    "payload": {
      "message": "matched with Intent 'Fallback'"
    }
  }
]
*/
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

  return context.getTrace();
});
```

However, we can't just deallocate the `RuntimeClient` for the current request, then construct a new `RuntimeClient` during the next request. Each `RuntimeClient` contains the conversation session and deallocating it would lose that information. So any input the user provided, such as their name, would be lost. Moreover, when we create a new `RuntimeClient` for the next session, it will start the conversation again from the beginning!

```js
// An endpoint in Express
app.get('/', async (req, res) => {
  // WRONG - This will start the app from the beginning at every request
  const client = factory.createClient();

  const context = await client.sendText(req.userInput);

  return context.getTrace();
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
  res.send(context.getTrace());
});
```

Conceptually, the `RuntimeClient` can be used on the frontend as a stateful global object. In the backend, you should think of the `RuntimeClient` as a disposable wrapper around independent `state` object, which you can use to perform operations on the `state`.

For a full-working sample demonstrating this technique, see [here](https://github.com/voiceflow/rcjs-examples/tree/master/server).

## Best Practices

Keep in mind that the `State` object in a Voiceflow application state will contains the value of any Voiceflow variables. We strongly recommend not embedding any sensitive information in Voiceflow variables or in any of your Voiceflow app responses. The `State` is transmitted over HTTP requests to our runtime servers.

## Trace Types

A `GeneralTrace` is an object which represents one piece of the overall response from a Voiceflow app. Specialized traces like `SpeakTrace` are a sub-type of the more abstract `GeneralTrace` super-type, as shown below.

```ts
export type GeneralTrace = EndTrace | SpeakTrace | ChoiceTrace | FlowTrace | StreamTrace | BlockTrace | DebugTrace | VisualTrace | AudioTrace;
```

All trace obejcts have a `type` and `payload` property, but differ in what the value of `type` and `payload` is. Shown below is a type that describes the common structure of trace objects. **NOTE**: the `Trace` type isn't actually declared in the package and is only shown for illustration.

```ts
const Trace<T extends TraceType, P> = {
  trace: T;
  payload: P;
};
// e.g. type SpeakTrace = Trace<TraceType.SPEAK, { message: string, src: string }>
```

In TypeScript, the `string enum` called `TraceType` is exported by this package and you can use it to quickly access the trace type string. A list of the available trace types is shown below.

```ts
enum TraceType {
    END = "end",
    FLOW = "flow",
    SPEAK = "speak",
    AUDIO = 'audio',
    BLOCK = "block",
    DEBUG = "debug",
    CHOICE = "choice",
    VISUAL = "visual"
}
```

For each of the specialized trace types, we will describe each trace's purpose and their payload structure below.

### SpeakTrace

- **PURPOSE:** Contains the "real" response of the voice interface. Corresponds to a Speak Step on Voiceflow.
- **PAYLOAD:**
  - **`message`** - The text representation of the response from the voice interface. We strip any SSML that you may have added to the response on Voiceflow. To see the SSML, see the `ssml` option for the `RuntimeClient` constructor.
  - **`src`** - This property is a URL to an audio-file that voices out the `message`. This property contains valid data only if the `tts` option in `RuntimeClient` constructor is set to `true`. 
  - **`voice`** - Only appears if `type` is `"message"` and `tts` is enabled. This property is the name of the voice assistant you chose to read out the Speak Step text.

```ts
type P = {
  message: string;
  src?: string | null;
  voice?: string;
};
```

### AudioTrace

- **PURPOSE:** Contains the "real" response of the Voice interface. Corresponds to an Audio Step on Voiceflow
- **PAYLOAD:**
  - **`src`** - This property is a URL to an audio-file that contains the response. 
  - **`message`** - An SSML representation of the audio-file being played. This is somewhat less useful.

```ts
type P = {
  src: string;
  message: string;
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
});
```
