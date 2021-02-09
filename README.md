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

1. Import `@voiceflow/runtime-client-js`

```js
// Node CommonJS
const RuntimeClient = require('@voiceflow/runtime-client-js').default;

// ES6 modules
import RuntimeClient from "@voiceflow/runtime-client-js"
```

2. Construct a `RuntimeClient` object and pass in the `VERSION_ID`. 

```js
const chatbot = new RuntimeClient({
  versionID: 'XXXXXXXXXXXXXXXXXXXXXXXX' // the VERSION_ID goes here
});
```

3. Call `.start()` to begin a conversation session with the Voiceflow app.
4. Store the return of `.start()` into a variable named `context`. The `context` is a `Context` object, which is a snapshot of the conversation's current state and it contains useful information like Voiceflow variables.
5. Call `context.getResponse()` to get a list of `SpeakTrace`s (*) and store it in `traces`. A **trace** is a piece of the entire app response. 
6. Output the response by iterating over `traces` and accessing the `trace.payload.message` for the response text.

```js
(async () => {
  const context = await chatbot.start();
  const traces = context.getResponse();

  traces.forEach(trace => {
    console.log(trace.payload.message);
  });
})();
```

10. For subsequent requests after `.start()`, call `.sendText()` and pass in any user input. We call `.sendText()` and `.start()` **interaction methods**.
11. Store the return of `.sendText()` into a variable named `context2`. 
12. Output the response from `.sendText()` like we did above.

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

13. After each interaction method call, invoke `context.isEnding()` to check if the conversation has ended. When a conversation has ended, any calls to interaction methods - except `.start()` - will throw an exception.
14. Call `.start()` again if you want to restart the conversation from the beginning.

```js
async(() => {
  // ... as before
  
  if (context.isEnding()) {
    cleanupMyApp();
    const context1 = await chatbot.sendText('hello world!')	// invalid - .isEnding() == true so throw except
    const context2 = await chatbot.start();									// valid - start from the beginning
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



### Integrating the app, with Promises

Alternatively, using only Promises.

```js
const RuntimeClient = require('@voiceflow/runtime-client-js').default;

const chatbot = new RuntimeClient({
  versionID: 'your-version-id-here',
});

const outputTraces = context => {
    const traces = context.getResponse();
    traces.forEach(trace => {
      console.log(trace.payload.message);
    });
}

chatbot.start()
  .then(context => {
  	outputTraces(context);
    return chatbot.sendText("I would like a large cheese burger")
  })
	.then(context => {
  	outputTraces(context);
  	if (context.isEnding()) cleanupMyApp();
	});
```



## Advanced Usage

### Statefulness of RuntimeClient

A `RuntimeClient` instance is a **stateful** object and calling its methods typically produces side-effects that change its internal state. 

For example, whenever an interaction method such as `.sendText()` is called, the `RuntimeClient` will send its local copy of the Voiceflow application state to our servers, which will calculate any state transitions based on the user input and respond with the next state. The `RuntimeClient` will then replace its local state with this newer state.

To summarize the side-effects of the basic interaction methods:

1. `.start()` - This methods runs the Voiceflow app from the beginning, until the app requests user input. If the `RuntimeClient` is currently in the middle of a conversation, then we terminate that session and restart the conversation. You can think of this method as being idempotent (assuming your Voiceflow app's startup logic is also idempotent).
2. `.sendText(userInput)` - Transitions the Voiceflow app to the next state, based the `userInput` that was given. This method is **not** idempotent.

The side-effects of the advanced interaction methods are:

1. `.sendIntent(...)` - Same side-effects as `.sendText()`
2. `.send(data)` - This method calls one of the above methods based on the input it is given. Therefore, its exact side-effects depends the argument types, e.g, if no argument or `null` is passed, then it behaves like `.start()`



### Context

Interaction methods such as `.start()`, `.sendText()`, and `.send()` all return a `Context` project. The `Context` is a snapshot of the Voiceflow application's state and includes data such as the current variable values.

```js
const context = await chatbot.start();
const context = await chatbot.sendText(userInput);
```

Each time an interaction method is called, a new `Context` object is created to wrap around the next state. When a `RuntimeClient` instance makes a state transition, the `Context`'s wrapped state doesn't change. Hence, you can build a **history** of `Context` objects and implement time-travelling capabilities in your chatbot. 

The `Context` object has a handful of methods to expose its internal data. We will describe a subset of them below, in order of most useful to least useful.



#### `.getResponse()`

The `.getResponse()` method returns the traces which make up the Voiceflow app's entire response. 

We say that this method "returns the traces which make up...the entire response," but this isn't quite accurate. In fact, `.getResponse()` returns a **view** of the entire list of traces. By default, the `Context` will filter out any trace that isn't a `SpeakTrace`, in order to show a simplified model of the Voiceflow app response to you. 

To see the other trace types in the return value of `.getResponse()`, see the `includeTypes` option in the "Configuration" section. Alternatively, you can view the unfiltered list of all traces using the `.getTrace()` method, which will be discussed later.

```js
const response = context.getResponse();
response.forEach(({ payload }) => {
  console.log(payload.message);
});
```



#### `.isEnding()`

The `.isEnding()` method returns `true` if the application state wrapped by the `Context` is the last state before the app session terminated, and returns `false` otherwise.

This method is mainly used to detect when the current conversation with the Voiceflow General Runtime has ended, and thus, we need to call `.start()` to start a new conversation from the beginning.

```js
do {
  const userInput = await frontend.getUserInput();			// listen for a user response
  const context = await app.sendText(userInput);				// send the response to the Voiceflow app
  frontend.display(context.trace);											// display the response, if any
} while (!context.isEnding())														// check if we're done
terminateApp();																					// perform any cleanup if conversation is over
```



#### `.getChips()`

The `.getChips()` method returns a list of suggestion chips. If you are unfamiliar with this terminology, a **suggestion chip** is simply a suggested response that the user can send to a voice interface. 

You can pass suggestion chips into buttons on your UI, which can be pressed by the user to automatically send the suggested response. An example illustrating this is shown below:

```js
const chips = context.getChips();			
// => [{ name: "I would like a pizza", ... }, { name: "I would like a hamburger", ... }]

const createOnClickSuggestion = (chosenSuggestion) => () => {
  const context = await chatbot.sendText(chosenSuggestion);			// send the suggested response to VF app
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

1. `tts` - Set to `true` to enable text-to-speech functionality. Any speak traces returned by an interaction method will contain an additional`src` property with an `.mp3` string, which is an audiofile that will speak out the trace text.
2. `ssml` - Set to `true` to disable the `RuntimeClient`'s SSML sanitization and return the full text string with the SSML included. This may be useful if you want to use your own TTS system. 
3. `includeTypes` - Set to a list of trace types to specify the additional trace types you want to receive from `.getResponse()`. A speak-type trace is always returned.
4. `traceProcessor` - Set to a "trace processor" function which is automatically called whenever an interaction method like `.sendText()` has returned and received new traces.

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

Unfortunately, there are many types of traces, each with their own unique attributes. If we wanted to process the entire list of traces, we would need boilerplate logic, such as `switch` statements, to distinguish between different traces and call the appropriate handler.

The SDK exposes a utility called `makeTraceProcessor` which allows you to quickly define a **trace processor** function, which can be passed as a callback of a higher-order function (see below).

**Arguments:**

- `handlerMap` - `object` -  An object whose keys are `TraceType`s (e.g. speak` for `SpeakTraces), and whose values are handlers for that trace type. Some examples of `TraceType`s and their (simplified) expected handler signatures are listed below. For the full list of available trace types and complete handler signatures, see the API Reference. 
  - `speak`- `(message) => any`  - A `SpeakTrace` handler receives the `message`, which is simply the Voiceflow app's response to any user interaction.
  - `debug - (message) => any` - A `DebugTrace` handler receives a debug `message` that illustrates how the Voiceflow runtime is evaluating the input and executing its control flow.

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

const result1 = context.getResponse().map(traceProcessor);			// usage in an HOF
// e.g. result = ['vf-speak-1', 'vf-speak-2', 'vf-speak-3']
```



### Variables

#### Getters

Voiceflow projects have variables that are modified as the app is executing. You can access the variable state at the particular point in time associated with a `Context` instance, through `context.variables`. 

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

The `.variables` submodule supports stricter typing, as long as you provide a variable **schema** to the `RuntimeClient`.  Once you do, the `.variables` methods like `.get()` will be able to intelligently determine the variable type, based on the variable name you pass as an argument (see below).

Since Voiceflow apps are loaded in at runtime, it is impossible for the `RuntimeClient` to deduce the types of variables for you. So it is up to you to define what types you expect to receive from your Voiceflow app.

```ts
export type VFVariablesSchema = {
    age: number;
    name: string;
};

const app = new RuntimeClient<VFVariablesSchema>({
	versionID: 'some-version-id'
});

const context = await app.start();

const name = context.variables.get('name');				// return value is inferred to be a "string"
context.variables.set('name', 12);								// TypeError! expected a "number" not a "string"
```



### Multiple Applications

You can integrate any number of Voiceflow applications to your project, simply by constructing multiple `VFApp` instances. You can even have multiple instances of the same Voiceflow project at once, our runtime servers are stateless, so two running Voiceflow programs will not interfere with each other.

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



### Advanced Trace Types

The `Context.getResponse()` method returns a list of `GeneralTrace`s which are objects containing a part of the overall response from the Voiceflow app. 

These `GeneralTrace`s include `SpeakTrace`s, which contain the "actual" textual response of the Voiceflow app and is intended to be seen by your own app's users. There are other traces such as `DebugTrace`, which contain messages that illustrates the Voiceflow app's control flow and why it produces the response that it did. 

The `DebugTrace`, in particular, might be useful if you want to log an application's state to understand what happened before an error with your Voiceflow app occurred.

```js
const app = new RuntimeClient({
    versionID: '60216d2e3c43f738ddcca219',
    dataConfig: {
        includeTypes: ['debug']
    }
});

const context = await chatbot.start();
context.getResponse().forEach(({ type, payload }) => {
  if (type === "debug") {
    myErrorLogger.log(payload.message);
  }
});
```

There are other trace types, as well. For the complete, definitive list, see the API Reference.



### Runtime

As the name suggests, `runtime-client-js` interfaces with a Voiceflow "runtime" server. You can check out [https://github.com/voiceflow/general-runtime](https://github.com/voiceflow/general-runtime) and host your own runtime server. Modifying the runtime allows for extensive customization of bot behavior and integrations.

By default, the client will use the Voiceflow hosted runtime at `https://general-runtime.voiceflow.com`



## API Reference
