# Voiceflow Runtime Client

The Voiceflow Runtime Client is an SDK for running Voiceflow apps in JavaScript.

First, you build a fully-functioning conversational app on [Voiceflow](https://creator.voiceflow.com). Then, you integrate that app into a JavaScript project using the SDK. This allows you to quickly add any kind of voice interface, such as a chatbot, to your project, without the hassle of implementing the conversational flow using code.

The Runtime Client can be used with jQuery, React, and any other JavaScript library or framework.

[![circleci](https://circleci.com/gh/voiceflow/runtime-client-js/tree/master.svg?style=shield&circle-token=a4447ba98e39b43cc47fd6da870ca68ff0ca5db0)](https://circleci.com/gh/voiceflow/runtime-client-js/tree/master)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=voiceflow_runtime-client-js&metric=coverage&token=088b80f6baf3c958b609f31f64b65289bd4586dc)](https://sonarcloud.io/dashboard?id=voiceflow_runtime-client-js)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=voiceflow_runtime-client-js&metric=alert_status&token=088b80f6baf3c958b609f31f64b65289bd4586dc)](https://sonarcloud.io/dashboard?id=voiceflow_runtime-client-js)

## Table of Contents

1. [Demos](#demos)
2. [Samples](#samples)
3. [Install](#install)
4. [Getting Started](#getting-started)
5. [Advanced Usage](#advanced-usage)
6. [Development](#api-reference)

## Demos

- Runtime Client Projects - [source](https://github.com/voiceflow/runtime-client-projects) 
- Voiceflow Burgers (Web) - [source](https://voiceflow-burger.webflow.io/)

<img src="https://user-images.githubusercontent.com/5643574/106966841-17b9ee00-6714-11eb-868a-26751b7d560e.png" alt="Voiceflow Burgers web demo" style="zoom:50%;" />

## Samples

See the parent [rcjs-examples](https://github.com/voiceflow/rcjs-examples) repo for instructions on how to setup each Sample.

- Hello World (Node.js) - [source](https://github.com/voiceflow/rcjs-examples/tree/master/hello-world)
- Hamburger Order App (jQuery) - [source](https://github.com/voiceflow/rcjs-examples/tree/master/hamburger-order-jQuery)
- Hamburger Order App (React) - [source](https://github.com/voiceflow/rcjs-examples/tree/master/hamburger-order-react)
- Hamburger Order Server (Express) - [source](https://github.com/voiceflow/rcjs-examples/tree/master/server)
- Using TTS (React) - [source](https://github.com/voiceflow/rcjs-examples/tree/master/text-to-speech)
- Using Suggestion Chips (React) - [source](https://github.com/voiceflow/rcjs-examples/tree/master/suggestion-chips)

## Install

```bash
# with NPM
npm install --save @voiceflow/runtime-client-js

# with yarn
yarn add @voiceflow/runtime-client-js
```

## Getting Started

### Minimal Working Integration

The minimum code to start using the SDK is shown below:

```js
const { default: RuntimeClientFactory } = require('@voiceflow/runtime-client-js');
// alternatively for ESM/ES6
// import RuntimeClientFactory from '@voiceflow/runtime-client-js'

// Construct a chatbot instance
const factory = new RuntimeClientFactory({
  versionID: 'your-version-id-here', 	// ADD YOUR VERSION ID HERE
  apiKey: 'your-api-key-here', // ADD YOUR API KEY HERE
});
const client = factory.createClient();

// When the chatbot responds with text, output it
client.onSpeak((trace) => console.log(trace.payload.message));

// (Optional) explicitly begin a conversation session
client.start();

// Call this function from any input source
const interact = (input) => client.sendText(input);

// e.g. interact('can I have fries with that');
```

Pass in user input with the `client.sendText(input)` function, and any of your `client.on...` handlers will trigger during the response.

### Setting up a Voiceflow App

See [here](docs/setting-up-vf-app.md) for instructions on how to quickly setup a Voiceflow app to try out your project.

### Integration Step-by-Step

See [here](docs/step-by-step.md) for step-by-step instructions on using the Runtime Client SDK. Make sure to read "Setting up a Voiceflow App" first.

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
