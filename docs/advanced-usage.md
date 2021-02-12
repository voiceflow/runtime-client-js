# Advanced Usage

---

## Table of Contents

1. [Statefulness of RuntimeClient](##Statefulness of RuntimeClient)
2. [Context](##Context)
   1. [`.getResponse`](###)
   2. [`.isEnding`](###isEnding)
   3. [`.getChips()`](###)
3. [Configuration](##Configuration)
4. [`makeTraceProcessor`](##)
5. [Variables](##Variables)
   1. [Getters](###Getters)
   2. [Setters](###Setters)
   3. [Enabling Stricter Typing](###Enabling Stricter Typing)
6. [Multiple Applications](##Multiple Applications)
7. [Runtime](##Runtime)



## Features

### Statefulness of RuntimeClient

A `RuntimeClient` instance is a **stateful** object and its methods produce side-effects that change its internal state.

Whenever an interaction method such as `.sendText()` is called, the `RuntimeClient` pings our servers to get the next execution state. The local copy of the execution state stored in `RuntimeClient` is updated and the previous state is discarded.

Different methods produce different side-effects. To summarize for the basic interaction methods:

1. `.start()` - Starts or restarts the Voiceflow app and runs the app until user input is reqested. Terminates any ongoing conversation session in the `RuntimeClient`. 
2. `.sendText(userInput)` - Transitions the Voiceflow app to the next state, based the `userInput` that was given.



### Context

Interaction methods such as `.start()`, `.sendText()`, and `.send()` all return a `Context` project. The `Context` is a snapshot of the Voiceflow application's state and includes data such as the current variable values.

```js
const context = await chatbot.start();
const context = await chatbot.sendText(userInput);
```

Each time an interaction method is called, a new `Context` object is created to wrap around the returned state. When a `RuntimeClient` instance makes a state transition, the `Context`'s wrapped state doesn't change. Hence, you can build a **history** of `Context` objects and implement time-travelling capabilities in your chatbot. 

The `Context` object has a handful of methods to expose its internal data. We will describe a subset of them below.



#### `.getResponse()`

Returns the traces which make up the Voiceflow app's entire response. 

We say that this method "returns the traces which make up...the entire response," but this isn't quite accurate. In fact, `.getResponse()` returns a **view** of the entire list of traces. By default, the `Context` will filter out any trace that isn't a `SpeakTrace`, in order to present a simplified model of the Voiceflow app response. 

To see the other trace types in the return value of `.getResponse()`, see the `includeTypes` option in the "Configuration" section. Alternatively, you can view the unfiltered list of all traces using `context.getTrace()`.

```js
const response = context.getResponse();
response.forEach(({ payload }) => {
  console.log(payload.message);
});
```



#### `.isEnding()`

The `.isEnding()` method returns `true` if the application state wrapped by the `Context` is the last state before the conversatione ended, and returns `false` otherwise.

This method is mainly used to detect when the current conversation with the Voiceflow General Runtime has ended, and thus, we need to call `.start()` to start a new conversation from the beginning.

```js
do {
  const userInput = await frontend.getUserInput();			// listen for a user response
  const context = await app.sendText(userInput);				// send the response to the app
  frontend.display(context.trace);											// display the response, if any
} while (!context.isEnding())														// check if we're done
terminateApp();																					// perform any cleanup
```



#### `.getChips()`

The `.getChips()` method returns a list of suggestion chips. If you are unfamiliar with this terminology, a **suggestion chip** is simply a suggested response that the user can send to a voice interface. 

You can pass suggestion chips into buttons on your UI, which can be pressed by the user to automatically send the suggested response. An example illustrating this is shown below:

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

You can also check out the "Samples" for a working implementation of suggestion chips on the browser.



### Configuration

The `RuntimeClient` comes with additional `dataConfig` options for managing the data returned by `Context.getResponse()`. To summarize, there are four options currently available:

1. `tts` - Set to `true` to enable text-to-speech functionality. Any returned speak traces will contain an additional`src` property with an `.mp3` string, which is an audiofile that will speak out the trace text.
2. `ssml` - Set to `true` to disable the `RuntimeClient`'s SSML sanitization and return the full text string with the SSML included. This may be useful if you want to use your own TTS system. 
3. `includeTypes` - Set to a list of trace types to specify the additional trace types you want to receive from `.getResponse()`. A speak-type trace is always returned by `.getResponse()`. For the full list of available trace types, see the API reference.
4. `traceProcessor` - Set to a "trace processor" function which will be automatically called whenever an interaction method like `.sendText()` receives new traces.

The Samples section has some working code demonstrating some of the configuration options. 

```js
const app = new RuntimeClient({
    versionID: '60216d2e3c43f738ddcca219',
    dataConfig: {
      	tts: true,
      	ssml: true,
        includeTypes: ['debug', 'stream', 'block']
      	traceProcessor: myTraceProcessor
    }
});
```



### `makeTraceProcessor`

A typical pattern for handling a Voiceflow app's response is to use a higher-order function (e.g. `map`) to invoke a callback on each trace in `Context.trace`. 

Unfortunately, there are many types of traces, each with their own unique attributes. If we wanted to process the entire list of traces, we would need boilerplate checking logic to call the appropriate handler for a given trace type.

The SDK exposes a utility called `makeTraceProcessor` which allows you to quickly define a **trace processor** function, which can be passed as a callback of a higher-order function (see below).

**Arguments:**

- `handlerMap` - `object` -  An object whose keys are `TraceType`s (e.g. speak` for `SpeakTraces), and whose values are handlers for that trace type. Some examples of `TraceType`s and their (simplified) expected handler signatures are listed below. For the full list of available trace types and complete handler signatures, see the API Reference. 
  - `speak`- `(message) => any`  - A `SpeakTrace` handler receives a `message`, which is simply the Voiceflow app's "actual" response to the user interaction.
  - `debug - (message) => any` - A `DebugTrace` handler receives a debug `message` that illustrates control flow of the Voiceflow app.

**Returns:**

- `traceProcessor`  - `(trace: GeneralTrace) => any` - A function that accepts any trace type and returns the return value of that trace type's handler in `handlerMap`

**Example:**

```js
const RuntimeClient = require("@voiceflow/runtime-client-js").default;
const { makeTraceProcessor } = require("@voiceflow/runtime-client-js");

// Defining a trace processor
const i = 0;
const traceProcessor = makeTraceProcessor({
    speak: (message) => {
        console.log(`speakHandler says: ${message}`);
      	return `vf-speak-${++i}`;
    },
});

// Usage
const context = await chatbot.start();

const result1 = context.getResponse().map(traceProcessor);
// e.g. result = ['vf-speak-1', 'vf-speak-2', 'vf-speak-3']
```



### Variables

#### Getters

Voiceflow projects have variables that are modified as the app is executing. You can access the variable state at a particular point in time through `context.variables`. Recall that a `Context` is a snapshot of app state, so the values of `.variables` between different `Context`s will be different.

- `.get(variableName)` - Used to retrieve a single variable value
- `.getAll()` - Returns an object containing all variables
- `.getKeys()` - Returns a list of variable names

```js
const context = await app.sendText("I would like a large cheeseburger");

const name = context.variables.get('name');

const allVariables = context.variables.getAll();
const name = allVariables.name;

const keys = context.variables.getKeys();
```



#### Setters

You can also set variables through a `Context`

- `.set(variableName, value)` - Sets `variableName` to have the given `value`
- `.setMany(map)` - Sets all variables which appear as keys in `map `to the corresponding value in `map`.

```js
context.variables.set('name', 'Jean-Luc Picard')
context.variables.setMany({
  name: 'Jean-Luc Picard',
  age: 52
});
```

**WARNING:** If you want to set variables to affect the result of the next interaction, then you should set the variables of the **most recent** `Context` returned by an interaction. Interaction methods will return a reference to the `RuntimeClient`'s current internal `Context` object, which will be used for the next state transition.

Recall that each `Context` returned by the `RuntimeClient` is a snapshot of the Voiceflow app state at some point in time. Setting the variables on `context1` will not affect variables values on `context2`. 



#### Enabling Stricter Typing

The Runtime Client is implemented in TypeScript and has strict types on all of its methods. The `.variables` submodule can also be configured to support stricter types.

To do this, you must supply a variable **schema** to the `RuntimeClient`. Once you do, variable methods like `.get()` will deduce the variable type based on the variable name you pass in as an argument (see below).

Since Voiceflow apps are loaded in at runtime, it is impossible for the `RuntimeClient` to deduce the types of variables for you. It is up to you to define what types you expect to receive and to ensure your Voiceflow app will only send back what you expect.

```ts
export type VFVariablesSchema = {
    age: number;
    name: string;
};

const app = new RuntimeClient<VFVariablesSchema>({
	versionID: 'some-version-id'
});

const context = await app.start();

const name = context.variables.get('name'); // return value is inferred to be a "string"
context.variables.set('name', 12); // TypeError! expected a "number" not a "string"
```



### Multiple Applications

You can integrate any number of Voiceflow applications to your project, simply by constructing multiple `VFApp` instances. You can even have multiple instances of the same Voiceflow project at once. Our runtime servers are stateless, so two running Voiceflow programs will not interfere with each other.

```js
// Multiple integrations
import { App as VFApp } from "@voiceflow/runtime-client-sdk";

const supportBot1 = new VFApp({
  versionID: 'support-bot-1-id',
});

const supportBot2 = new VFApp({
  versionID: 'support-bot-2-id',
});	// has a separate state than supportBot1

const orderBot = new VFApp({
  versionID: 'order-bot'
});
```



### Runtime

As the name suggests, `runtime-client-js` interfaces with a Voiceflow "runtime" server. You can check out [https://github.com/voiceflow/general-runtime](https://github.com/voiceflow/general-runtime) and host your own runtime server. Modifying the runtime allows for extensive customization of bot behavior and integrations.

By default, the client will use the Voiceflow hosted runtime at `https://general-runtime.voiceflow.com`

