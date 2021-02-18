# Voiceflow Runtime Client

The Voiceflow Runtime Client is an SDK for running Voiceflow apps in JavaScript. 

First, you build a fully-functioning conversational app on [Voiceflow](https://creator.voiceflow.com). Then, you integrate that app into a JavaScript project using the SDK. This allows you to quickly add any kind of voice interface, such as a chatbot, to your project, without the hassle of implementing the conversational flow using code.

The Runtime Client can be used with jQuery, React, and any other JavaScript library or framework. 

[![circleci](https://circleci.com/gh/voiceflow/runtime-client-js/tree/master.svg?style=shield&circle-token=a4447ba98e39b43cc47fd6da870ca68ff0ca5db0)](https://circleci.com/gh/voiceflow/runtime-client-js/tree/master)
[![codecov](https://codecov.io/gh/voiceflow/runtime-client-js/branch/master/graph/badge.svg?token=RYypRxePDX)](https://codecov.io/gh/voiceflow/runtime-client-js)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=voiceflow_runtime-client-js&metric=alert_status&token=088b80f6baf3c958b609f31f64b65289bd4586dc)](https://sonarcloud.io/dashboard?id=voiceflow_runtime-client-js)



## Table of Contents

1. [Demos](#demos)
2. [Samples](#samples)
3. [Install](#install)
4. [Getting Started](#getting-started)
5. [Advanced Usage](#advanced-usage)
7. [Development](#api-reference)



## Demos

- Voiceflow Burgers (Web) - [source](https://voiceflow-burger.webflow.io/)

<img src="https://user-images.githubusercontent.com/5643574/106966841-17b9ee00-6714-11eb-868a-26751b7d560e.png" alt="demo" style="zoom:50%;" />

## Samples

See the parent [rcjs-examples](https://github.com/voiceflow/rcjs-examples) repo for instructions on how to setup each Sample.

- Hello World (Node.js) - [source](https://github.com/voiceflow/rcjs-examples/tree/master/hello-world)
- Hamburger Order App (jQuery) - [source](https://github.com/voiceflow/rcjs-examples/tree/master/hamburger-order-jQuery)
- Hamburger Order App (React) - [source](https://github.com/voiceflow/rcjs-examples/tree/master/hamburger-order-react)
- Hamburger Order App (Node.js) - [source](https://github.com/voiceflow/rcjs-examples/tree/master/hamburger-order)
- Using Trace Processor (Node.js) - [source](https://github.com/voiceflow/rcjs-examples/tree/master/trace-processor)
- Using TTS (React) - [source](https://github.com/voiceflow/rcjs-examples/tree/master/text-to-speech)
- Using Suggestion Chips (React) - [source](https://github.com/voiceflow/rcjs-examples/tree/master/suggestion-chips)

Aside from the samples above, we also have integrations of the Runtime Client to other services:

- Telegram Integration (thanks to @xavidop) - [source](https://github.com/xavidop/telegram-voiceflow-bot) 


## Install

```bash
# with NPM
npm install --save @voiceflow/runtime-client-js

# with yarn
yarn add @voiceflow/runtime-client-js
```

## Getting Started

### Minimal Working Integration, ES6 and Async/Await

The minimum code to start using the SDK is shown below:

```js
import RuntimeClient from "@voiceflow/runtime-client-js";

// Construct an object 
const chatbot = new RuntimeClient({
  versionID: 'your-version-id-here', // ADD YOUR VERSION ID HERE
});

(async () => {
  // Begin a conversation session
  const context = await chatbot.start();
  
  // Show the voice app's initial response
  const traces = context.getResponse();
  traces.forEach(trace => {
    console.log(trace.payload.message);
  });
  
  // Continue the conversation session
  const userInput = "I would like a large cheeseburger"; // change this string to what your app expects
  const context2 = await chatbot.sendText(userInput);
  
  // Show the voice app's subsequent response
  const traces2 = context2.getResponse();
  traces2.forEach(trace => {
    console.log(trace.payload.message);
  });
  
  // Check if conversation has ended after .sendText() and .start() calls
  if (context2.isEnding()) {
    cleanupMyApp();
    const context2 = await chatbot.start(); // Maybe restart the chatbot application with .start()
  }
})();
```



### Minimal Working Integration, CommonJS and Promises

```js
const RuntimeClient = require('@voiceflow/runtime-client-js').default;

// Construct an object 
const chatbot = new RuntimeClient({
  versionID: 'your-version-id-here', // ADD YOUR VERSION ID HERE
});

// Begin a conversation session
chatbot.start()
	.then(context => {
  		// Show the voice app's initial response
  		const traces = context.getResponse();
  		traces.forEach(trace => {
		  console.log(trace.payload.message);
		});

		// Continue the conversation session
		const userInput = "I would like a large cheeseburger";
		const context2 = chatbot.sendText(userInput);

		return context2;
	})
	.then(context => {
		// Show the voice app's subsequent response
		const traces2 = context.getResponse();
		traces2.forEach(trace => {
		  console.log(trace.payload.message);
		});

		// Check if conversation has ended after .sendText() and .start() calls
		if (context.isEnding()) {
		  cleanupMyApp();
		  return chatbot.start();
		}
		return context;
	});
```



### Setting up a Voiceflow App

See [here](docs/setting-up-vf-app.md) for instructions on how to quickly setup a Voiceflow app to try out your project.



### Integration Step-by-Step

See [here](docs/step-by-step.md) for a step-by-step breakdown of the Minimal Working Integration. Make sure to read "Setting up a Voiceflow App" first.



## Advanced Usage

See the documentation [here](docs/advanced-usage.md) for the available advanced features of the SDK.



## Development

### Important Scripts

#### `yarn install`

Run `yarn install` to install any necessary dependencies to get started with working on the SDK.

#### `yarn build`

Use this to build the `runtime-client-js` locally. The build will be stored in the `/build` folder

#### `yarn lint`

Use this command to find any issues that fails our linter. It is important to have proper linting, otherwise your PR will not pass our automation.

Use `yarn lint:fix` to check and automatically fix linting issues where possible.

#### `yarn test`

Use this command to run all of the integration and unit tests. Make sure that your PR achieves 100% coverage and tests for potential edge-cases. 

Use `yarn test:single` to execute a single unit or integration test.

Use `yarn test:unit` to run all of the unit tests

Use `yarn test:integration` to run all of the integration tests.



### Submitting a PR

We're always open to improving our Runtime Client SDK. Consider opening a PR if there is some improvement that you think should be added. Make sure to achieve 100% coverage for unit tests and provide documentation if applicable.
