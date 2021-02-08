# Voiceflow Runtime Client

The Voiceflow Runtime Client is an SDK for running Voiceflow apps in JavaScript. 

Developers or designers can build a fully-functioning conversational app on [Voiceflow](https://creator.voiceflow.com), and integrate that app into a JavaScript project using the SDK. This allows you to quickly add any kind of voice interface, such as a chatbot, to your project, without the hassle of implementing the conversation flow using code.

The Runtime Client can be used with jQuery, React, and any other JavaScript library or framework. 

[![circleci](https://circleci.com/gh/voiceflow/runtime-client-js/tree/master.svg?style=shield&circle-token=a4447ba98e39b43cc47fd6da870ca68ff0ca5db0)](https://circleci.com/gh/voiceflow/runtime-client-js/tree/master)
[![codecov](https://codecov.io/gh/voiceflow/runtime-client-js/branch/master/graph/badge.svg?token=RYypRxePDX)](https://codecov.io/gh/voiceflow/runtime-client-js)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=voiceflow_runtime-client-js&metric=alert_status&token=088b80f6baf3c958b609f31f64b65289bd4586dc)](https://sonarcloud.io/dashboard?id=voiceflow_runtime-client-js)



## Demos

- [Web Demo](https://voiceflow-burger.webflow.io/)

<img src="https://user-images.githubusercontent.com/5643574/106966841-17b9ee00-6714-11eb-868a-26751b7d560e.png" alt="demo" style="zoom:50%;" />



## Examples

- Hello World
- Using makeTraceProcessor
- Adding TTS
- Using advanced trace types



## Install

```bash
npm install --save @voiceflow/runtime-client-js
```



## Getting Started

### Building a Voiceflow app

To start adding a voice interface to your JavaScript project, we need to first build that interface. To summarize, there are three steps in building a voice interface.

1. **Building** the project on Voiceflow
2. **Training** the chatbot if necessary
3. **Copying** the version id for our integrations

Open [Voiceflow](https://creator.voiceflow.com) and setup a "General Assistant."  We have detailed tutorials on Voiceflow to help you **build** your first conversational app. 

![image](https://user-images.githubusercontent.com/32404412/107269001-f1979500-6a16-11eb-8303-10620ad44764.png)

When you are satisfied with your design, make sure to **train** your assistant. Click the Test button at the top-right corner to open up the Prototyping view.

<img width="552" alt="Image of the Test Button on Voiceflow" src="https://user-images.githubusercontent.com/32404412/107269101-17bd3500-6a17-11eb-86b1-b0a817022aca.png">

In the Prototyping view, the right sidebar will have a Training panel. Click Train Assistant to begin the training process. **NOTE:** If the "Train Assistant" button is greyed out, then your project need to be trained, so you can skip this step.

<img width="300" alt="Image of the Test Button on Voiceflow" src="https://user-images.githubusercontent.com/32404412/107269251-5521c280-6a17-11eb-9d82-5a0f62bff14d.png">

After the above is done, you are ready to integrate the app onto your JavaScript project. On your address bar, you should see a URL of this form: `https://creator.voiceflow.com/project/{VERSION_ID}/...`. The `VERSION_ID` is a id identifying your particular project. **Copy** this version id, as we will need it later for the integration

<img width="957" alt="Screen Shot 2021-02-08 at 2 11 09 PM" src="https://user-images.githubusercontent.com/32404412/107269370-813d4380-6a17-11eb-8bb5-d286c5db3664.png">



### Integrating the app

Now that we have built a voice interface and copied its `VERSION_ID`, we can integrate it with our JavaScript project.

To begin, import `@voiceflow/runtime-client-js` and construct a new `RuntimeClient` object using the `VERSION_ID` that you copy-pasted. This object represents our Voiceflow application.

```js
const RuntimeClient = require('@voiceflow/runtime-client-js');

const chatbot = new RuntimeClient({
  versionID: 'XXXXXXXXXXXXXXXXXXXXXXXX' // the VERSION_ID goes here
});
```

To start a conversation **session** with our Voiceflow app, call the `.start()` method as shown below. This method returns a promise that eventually resolves into a `Context` object. 

The `Context` is a snapshot of the conversation at the current stage and contains useful information such as the chatbot's responses, the state of all the variables in the Voiceflow project, and much more!

We can access the responses by calling `context.getResponses()` to return a list of `Trace` objects. The `Trace` objects are pieces that make up the entire bot's response. We can log the entire response to console by iterating over the `traces` and logging the messages in the individual `trace`s.

```js
// initalize the conversation, get the starting prompt
chatbot.start().then((context) => {
  // get the chatbot response from the context
  const traces = context.getResponses();
  
  // print out what the bot says back
  traces.forEach(trace => {
    console.log(trace.payload.message);
  });
});
```

The `.start()` method is triggers the first **interaction**. For subsequent interactions, you should invoke the `.sendText()` method and send your user's input to the chatbot to advance the conversation.

Both `.start()` and `.sendText()` are "interaction methods" which return a `Context` object. Just like above, we can access the responses returned by `.sendText()` using `context.getResponses()`

After interacting with the chatbot, we need to call `context.isEnding()` to check if the conversation has ended. When the sesconversationion has ended, any additional calls to interaction methods (except for `.start()`) will throw an exception. 

The only interaction that is valid, after the conversation has ended, is the `.start()` call, which will start the conversation flow from the beginning. 

**NOTE:** Although we did not check `.isEnding()` after our call to `.start()` in the above example, it may be worthwhile to do so, depending on your application. For example, if your voice interface simply runs from start to finish without prompting for user input, then `.isEnding()` will return `true` after `.start()` is called, which makes all subsequent `.sendText()` calls throw an exception.

```js
// call this function from any input source
// e.g. interaction('can I have fries with that');
async function interaction(userInput) {
  // get a context for every user interaction
  const context = await chatbot.sendText(userInput);

  // print out what the bot says back
  context.getResponses().forEach(trace => {
    console.log(trace.payload.message);
  });

  // again check if the conversation has ended
  if (context.isEnding()) {
    cleanup();			 					// perform any cleanup logic
    await chatbot.start();		// call `.start()` to restart the conversation if necessary
  }
}
```

To summarize the above, to integrate a Voiceflow app into your JavaScript project, you should:

1. Construct a `RuntimeClient` object
2. Invoke `.start()` to begin the conversation session.
3. Retrieve the traces with `.getResponse() `and display the responses
4. Check if the conversation `.isEnding()` and perform any necessary logic if `true`.
5. If the conversation is ending, then invoke `.sendText()` and repeat from step 3.



## Advanced Usage

### makeTraceProcessor

```js

```



### Configuration



#### TTS



#### SSML



#### traceProcessor



### Advanced Trace Types

- By default we only expose a `SpeakTrace`, however, 



### Advanced Interaction Methods



### Variables

**WARNING:** Be careful when setting variable setters. It can be difficult to determine where you are in a Voiceflow diagram, so be wary not to set variables at the wrong time. 



### Multiple Applications



### Runtime

As the name suggests, `runtime-client-js` interfaces with a Voiceflow "runtime" server. You can check out [https://github.com/voiceflow/general-runtime](https://github.com/voiceflow/general-runtime) and host your own runtime server. Modifying the runtime allows for extensive customization of bot behavior and integrations.

By default, the client will use the Voiceflow hosted runtime at `https://general-runtime.voiceflow.com`



## API Reference
