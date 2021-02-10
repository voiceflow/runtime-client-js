# Voiceflow Runtime Client

The Voiceflow Runtime Client is an SDK for running Voiceflow apps in JavaScript. 

First, you build a fully-functioning conversational app on [Voiceflow](https://creator.voiceflow.com). Then, you integrate that app into a JavaScript project using the SDK. This allows you to quickly add any kind of voice interface, such as a chatbot, to your project, without the hassle of implementing the conversational flow using code.

The Runtime Client can be used with jQuery, React, and any other JavaScript library or framework. 

[![circleci](https://circleci.com/gh/voiceflow/runtime-client-js/tree/master.svg?style=shield&circle-token=a4447ba98e39b43cc47fd6da870ca68ff0ca5db0)](https://circleci.com/gh/voiceflow/runtime-client-js/tree/master)
[![codecov](https://codecov.io/gh/voiceflow/runtime-client-js/branch/master/graph/badge.svg?token=RYypRxePDX)](https://codecov.io/gh/voiceflow/runtime-client-js)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=voiceflow_runtime-client-js&metric=alert_status&token=088b80f6baf3c958b609f31f64b65289bd4586dc)](https://sonarcloud.io/dashboard?id=voiceflow_runtime-client-js)



## Demos

- [Web Demo](https://voiceflow-burger.webflow.io/)

<img src="https://user-images.githubusercontent.com/5643574/106966841-17b9ee00-6714-11eb-868a-26751b7d560e.png" alt="demo" style="zoom:50%;" />


## Samples

See the parent [rcjs-examples](https://github.com/voiceflow/rcjs-examples) repo for instructions on how to setup each Sample.

- Hello World - [source](https://github.com/voiceflow/rcjs-examples/tree/master/hello-world)
- Hamburger Order - [source](https://github.com/voiceflow/rcjs-examples/tree/master/hamburger-order)
- Trace Processor - [source](https://github.com/voiceflow/rcjs-examples/tree/master/trace-processor)
- Using TTS - [source](https://github.com/voiceflow/rcjs-examples/tree/master/text-to-speech)
- Using Suggestion Chips [source](https://github.com/voiceflow/rcjs-examples/tree/master/suggestion-chips)


## Install

```bash
npm install --save @voiceflow/runtime-client-js
```


## Getting Started

### Building a Voiceflow app

To start using the SDK, we should build a project on [Voiceflow](https://creator.voiceflow.com/). However, for simplicity, we will use a pre-built project.

1. Download this `.vf` file found [here](https://docs.voiceflow.com/#/). The `.vf` file contains a pre-built Voiceflow project that can be imported.
2. Upload the `.vf` file to Voiceflow to import the project. For instruction on how to do this, see [here](https://docs.voiceflow.com/#/platform/project-creation/project-creation?id=project-creation) and click the "Import a .vf file" tab.
3. Open the imported project on Voiceflow

<p align="center">
	<img width="546" alt="Screen Shot 2021-02-09 at 6 23 17 PM" src="https://user-images.githubusercontent.com/32404412/107441822-eff7cb00-6b03-11eb-9bd6-5551c195669b.png">
</p>	


4. Click the Test button at the top-right corner to open up the Prototyping view.

<p align="center">
	<img width="552"  alt="Image of the Test Button on Voiceflow" src="https://user-images.githubusercontent.com/32404412/107269101-17bd3500-6a17-11eb-86b1-b0a817022aca.png">
</p>	
5. Click Train Assistant on the sidebar in the Prototyping view.  **NOTE:** If the "Train Assistant" button is unclickable, then your project does not need to be trained, so you can skip this step.

<p align="center">
	<img width="300" alt="Image of the Training Panel on Voiceflow" src="https://user-images.githubusercontent.com/32404412/107269251-5521c280-6a17-11eb-9d82-5a0f62bff14d.png">
</p>	
6. Copy the `VERSION_ID` from the URL in your address bar. When you are inside a Voiceflow project, your address bar should have a URL of the form: `https://creator.voiceflow.com/project/{VERSION_ID}/...`

<p align="center">
	<img width="957" align="center" alt="Screen Shot 2021-02-08 at 2 11 09 PM" src="https://user-images.githubusercontent.com/32404412/107269370-813d4380-6a17-11eb-8bb5-d286c5db3664.png">
</p>	


### Integrating the app

Now we can start integrating the Voiceflow app in your codebase. 

1. Set up the `RuntimeClient` as shown below. Paste the `VERSION_ID` you copied earlier into the `versionID` configuration option.

```js
import RuntimeClient from "@voiceflow/runtime-client-js"

const chatbot = new RuntimeClient({
  versionID: 'XXXXXXXXXXXXXXXXXXXXXXXX' // the VERSION_ID goes here
});
```

1. Call `.start()` to begin a conversation session with the Voiceflow app.
2. Store the result of `.start()` into `context`. The `context` is a `Context` object, which is a snapshot of the conversation's current state and it contains useful information like Voiceflow variables.
3. Output the response by iterating over `context.getResponse()` and logging `trace.payload.message`. A **trace** is a piece of the entire response.

```js
(async () => {
  const context = await chatbot.start();
  const traces = context.getResponse();

  traces.forEach(trace => {
    console.log(trace.payload.message);
  });
})();
```

4. For subsequent requests after `.start()`, call `.sendText()` and pass in any user input. We call `.sendText()` and `.start()` **interaction methods**.
5. Output the response from `.sendText()` like we did above.

```js
async(() => {
  const context = await chatbot.start();
  // ... etc etc
  
  const context2 = await chatbot.sendText("I would like a large cheeseburger");
  const traces2 = context.getResponse();

  traces2.forEach(trace => {
    console.log(trace.payload.message);
  });
});
```

6. Call `context.isEnding()` to check if the conversation has ended after each interaction method call. When a conversation ends, any calls to interaction methods - except `.start()` - will throw an exception.
7. Call `.start()` again to restart the conversation.

```js
async(() => {
  // ... as before
  
  if (context.isEnding()) {
    cleanupMyApp();
    const context1 = await chatbot.sendText('hello world!')	// exception!
    const context2 = await chatbot.start();									// valid
  }
});
```

To summarize, this is what a minimal working integration looks like.

```js
const RuntimeClient = require('@voiceflow/runtime-client-js').default;

const chatbot = new RuntimeClient({
  versionID: 'your-version-id-here',
});

(async () => {
  const context = await chatbot.start();
  const traces = context.getResponse();

  traces.forEach(trace => {
    console.log(trace.payload.message);
  });
  
  const context2 = await chatbot.sendText("I would like a large cheeseburger");
  const traces2 = context.getResponse();

  traces2.forEach(trace => {
    console.log(trace.payload.message);
  });
  
  if (context.isEnding()) {
    cleanupMyApp();
    const context1 = await chatbot.sendText('hello world!')	// invalid - .isEnding() == true so throw except
    const context2 = await chatbot.start(); // valid - start from the beginning
  }
})();
```



(*) - Technically, you are retrieving a list of `GeneralTrace`s and a `SpeakTrace` is a sub-type of a `GeneralTrace`. There are other trace types besides `SpeakTrace`, but a `SpeakTrace` is all that you'll need for most applications.



## Advanced Usage

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



## API Reference
