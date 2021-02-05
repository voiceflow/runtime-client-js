# @voiceflow/runtime-client-js

The Voiceflow Runtime Client is an SDK for running Voiceflow projects anywhere. 

Developers or designers can build a fully-functioning conversational app on [Voiceflow](https://creator.voiceflow.com). Then, using this SDK, you can integrate that app into your JavaScript project. This allows you to quickly add a chatbot, voice interface, or any other voice-based functionality to your project, without the hassle of implementing the conversation flow with only code.

The Runtime Client can be used with jQuery, React, and any other JavaScript library or framework. 

[![circleci](https://circleci.com/gh/voiceflow/runtime-client-js/tree/master.svg?style=shield&circle-token=a4447ba98e39b43cc47fd6da870ca68ff0ca5db0)](https://circleci.com/gh/voiceflow/runtime-client-js/tree/master)
[![codecov](https://codecov.io/gh/voiceflow/runtime-client-js/branch/master/graph/badge.svg?token=RYypRxePDX)](https://codecov.io/gh/voiceflow/runtime-client-js)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=voiceflow_runtime-client-js&metric=alert_status&token=088b80f6baf3c958b609f31f64b65289bd4586dc)](https://sonarcloud.io/dashboard?id=voiceflow_runtime-client-js)

## Demos

- Web Demo https://voiceflow-burger.webflow.io/

<img src="https://user-images.githubusercontent.com/5643574/106966841-17b9ee00-6714-11eb-868a-26751b7d560e.png" alt="demo" style="zoom:50%;" />



## Install

```bash
npm install --save @voiceflow/runtime-client-js
```



## Basic Usage

### Building a Voiceflow app

First, we need to build build a project on [Voiceflow](https://creator.voiceflow.com). Make sure it works by testing it.

Retrieve the `versionID` from the URL:
`https://creator.voiceflow.com/project/{VERSION_ID}/...` and initialize the client



### Integrating the app

```javascript
const RuntimeClient = require('@voiceflow/runtime-client-js');

const chatbot = new RuntimeClient({
  versionID: 'XXXXXXXXXXXXXXXXXXXXXXXX', // voiceflow project versionID
  endpoint: 'https://general-runtime.voiceflow.com',
});

// initalize the conversation, get the starting prompt
chatbot.start().then((context) => {
  console.log(context.getResponses());
});

// call this function from any input source
// e.g. interaction('can I have fries with that');
async function interaction(userInput) {
  // get a context for every user interaction
  const context = await chatbot.sendText(userInput);

  // print out what the bot says back
  console.log(context.getResponses());

  if (context.isEnding()) {
    console.log('conversation is over');
  }
}
```

Every interaction with the bot returns a conversation `context`. The `context` is a snapshot of the conversation at the current stage and contains useful information such as the bot's responses and the state of all the variables in the Voiceflow project, and much more!

- An **interaction** is triggered by one of the following methods: `.start()`, `.sendText()` and each of these methods returns a `Context` object.
- To begin a conversation **session**, the client code should invoke the `.start()` method.
- For subsequent requests, the client code should invoke `.sendText()` and pass in a string representing the user's response.
- `context.getResponses()` is the main conversation data. It is a list of `Trace` objects that represents the bot's response.
  - By default, only `speak` traces, containing the bot's 
  - certain `Trace` types are filtered out by default, such as `block`, `debug`, `flow` traces. To access the entire trace, use `context.getTrace()`
- `context.isEnding()` is a boolean that is true when the Voiceflow project is done. Make sure to check for this during each interaction. If an interaction is triggered 
- `context.getChips()` returns an array of suggested responses that the user can say. This is generated based on what is configured in your Voiceflow project.



## Runtime

As the name suggests, `runtime-client-js` interfaces with a Voiceflow "runtime" server. You can check out [https://github.com/voiceflow/general-runtime](https://github.com/voiceflow/general-runtime) and host your own runtime server. Modifying the runtime allows for extensive customization of bot behavior and integrations.

By default, the client will use the Voiceflow hosted runtime at `https://general-runtime.voiceflow.com`
