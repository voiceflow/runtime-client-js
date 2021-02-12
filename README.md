# Voiceflow Runtime Client

The Voiceflow Runtime Client is an SDK for running Voiceflow apps in JavaScript. 

First, you build a fully-functioning conversational app on [Voiceflow](https://creator.voiceflow.com). Then, you integrate that app into a JavaScript project using the SDK. This allows you to quickly add any kind of voice interface, such as a chatbot, to your project, without the hassle of implementing the conversational flow using code.

The Runtime Client can be used with jQuery, React, and any other JavaScript library or framework. 

[![circleci](https://circleci.com/gh/voiceflow/runtime-client-js/tree/master.svg?style=shield&circle-token=a4447ba98e39b43cc47fd6da870ca68ff0ca5db0)](https://circleci.com/gh/voiceflow/runtime-client-js/tree/master)
[![codecov](https://codecov.io/gh/voiceflow/runtime-client-js/branch/master/graph/badge.svg?token=RYypRxePDX)](https://codecov.io/gh/voiceflow/runtime-client-js)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=voiceflow_runtime-client-js&metric=alert_status&token=088b80f6baf3c958b609f31f64b65289bd4586dc)](https://sonarcloud.io/dashboard?id=voiceflow_runtime-client-js)



## Table of Contents

1. [Demos](##Demos)
2. [Samples](##Samples)
3. [Install](##Install)
4. [Getting Started](##Getting Started)
5. [Advanced Usage](##Advanced Usage)
6. [API Reference](##API Reference)



## Demos

- Voiceflow Burgers (Web) - [source](https://voiceflow-burger.webflow.io/)

<img src="https://user-images.githubusercontent.com/5643574/106966841-17b9ee00-6714-11eb-868a-26751b7d560e.png" alt="demo" style="zoom:50%;" />


## Samples

See the parent [rcjs-examples](https://github.com/voiceflow/rcjs-examples) repo for instructions on how to setup each Sample.

- Hello World (Node.js) - [source](https://github.com/voiceflow/rcjs-examples/tree/master/hello-world)
- Hamburger Order App (Node.js) - [source](https://github.com/voiceflow/rcjs-examples/tree/master/hamburger-order)
- Using Trace Processor (Node.js) - [source](https://github.com/voiceflow/rcjs-examples/tree/master/trace-processor)
- Using TTS (React) - [source](https://github.com/voiceflow/rcjs-examples/tree/master/text-to-speech)
- Using Suggestion Chips (React) - [source](https://github.com/voiceflow/rcjs-examples/tree/master/suggestion-chips)


## Install

```bash
npm install --save @voiceflow/runtime-client-js
```

## Getting Started

### Minimal Working Integration

The minimum code to start using the SDK is shown below:

```js
const RuntimeClient = require('@voiceflow/runtime-client-js').default;

// Construct an object 
const chatbot = new RuntimeClient({
  versionID: 'your-version-id-here',								// ADD YOUR VERSION ID HERE
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
  const userInput = "I would like a large cheeseburger";
  const context2 = await chatbot.sendText(userInput);
  
  // Show the voice app's subsequent response
  const traces2 = context.getResponse();
  traces2.forEach(trace => {
    console.log(trace.payload.message);
  });
  
  // Check if conversation has ended after .sendText() and .start() calls
  if (context.isEnding()) {
    cleanupMyApp();
    const context2 = await chatbot.start();					// Maybe restart the chatbot application with .start()
  }
})();
```



### Setting up a Voiceflow app

See [here]() for instructions on how to quickly setup a Voiceflow app to try out your project.

### Integration step-by-step

See [here]() for a step-by-step breakdown of the Minimal Working Integration



## Advanced Usage

See the documentation [here]() for the available advanced features of the SDK.



## API Reference
