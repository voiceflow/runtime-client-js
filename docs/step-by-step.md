# Integration, Step-by-step

---

## Steps

**NOTE:** You should read "Setting up a Voiceflow App" for the necessary setup for this article.

To start integrating the Voiceflow app in your codebase, we do the following:

1. Set up a `RuntimeClient` instance using a `RuntimeClientFactory` as shown below. Paste the `VERSION_ID` of your Voiceflow project into the `versionID` configuration option and paste the API key for your Voiceflow workspace into the `apiKey` option.

```js
import RuntimeClientFactory, { TraceType, TraceEvent } from "@voiceflow/runtime-client-js"
// const { RuntimeClientFactory, TraceType, TraceEvent } = require("@voiceflow/runtime-client-js");

const factory = new RuntimeClientFactory({
   versionID: 'XXXXXXXXXXXXXXXXXXXXXXXX', // the VERSION_ID goes here 
   apiKey: 'VF.XXXXXXXX.XXXXXXXX'         // the API key goes here 
})
const chatbot = factory.createClient();
```

2. Define an event handler for the `TraceType.SPEAK` event. This event fires whenever the `RuntimeClient` receives a `SpeakTrace` from the Voiceflow app. A **trace** is a piece of the entire response. 

```js
chatbot.on(TraceType.SPEAK, (trace) => {
  console.log(`message, event handler = ${trace.payload.message}`)
});
```

3. Call `.start()` to begin a conversation session with the Voiceflow app. 
4. Store the result of `.start()` into `context`. The `context` is a `Context` object, which is a snapshot of the conversation's current state and it contains useful information like Voiceflow variables.
5. Output the traces manually by iterating over `context.getTrace()` and logging `trace.payload.message`. This is an alternate way of working with the Voiceflow's app's response.

```js
(async () => {
  const context = await chatbot.start();
 
  const traces = context.getTrace();
  traces.forEach(trace => {
    if (trace.type === TraceType.SPEAK) {
      console.log(`message, forEach = ${trace.payload.message}`);
    }
  });
})();
```

6. For subsequent requests after `.start()`, call `.sendText()` and pass in any user input. The `.sendText()` and `.start()` methods are called **interaction methods**.
7. Output the response from `.sendText()` like we did above.

```js
async(() => {
  const context = await chatbot.start();
  // ... same as before
  
  const userInput = "I would like a large cheeseburger";
  const context2 = await chatbot.sendText(userInput);
 
  const traces2 = context2.getTrace();
  traces2.forEach(trace => {
    if (trace.type === TraceType.SPEAK) {
      console.log(trace.payload.message);
    }
  });
});
```

8. Call `context.isEnding()` to check if the conversation has ended. When a conversation ends, any calls to interaction methods - except `.start()` - will throw an exception. You can perform the check after each interaction method call or within an event handler.
9. Call `.start()` again to restart the conversation.

```js
// Approach 1 - Event handler
chatbot.on(TraceEvent.BEFORE_PROCESSING, (context) => {
  console.log(`before processing = ${context.isEnding()}`);
});

chatbot.on(TraceEvent.AFTER_PROCESSING, (context) => {
  console.log(`after processing = ${context.isEnding()}`);
});

chatbot.on(TraceType.SPEAK, (trace, context) => {
  console.log(`speak trace = ${context.isEnding()}`);
});

// Approach 2 - Context
async(() => {
  // ... as before
  
  if (context2.isEnding()) {
    cleanupMyApp();
    const context1 = await chatbot.sendText('hello world!')	// exception!
    const context2 = await chatbot.start();									// valid
  }
});
```



## Final Code

```js
import RuntimeClientFactory, { TraceType, TraceEvent } from "@voiceflow/runtime-client-js"
// const { RuntimeClientFactory, TraceType, TraceEvent } = require("@voiceflow/runtime-client-js");

const factory = new RuntimeClientFactory({
   versionID: 'XXXXXXXXXXXXXXXXXXXXXXXX', // the VERSION_ID goes here 
   apiKey: 'VF.XXXXXXXX.XXXXXXXX'         // the API key goes here 
})
const chatbot = factory.createClient();

chatbot.on(TraceType.SPEAK, (trace) => {
  console.log(`message, event handler = ${trace.payload.message}`);
});

chatbot.on(TraceEvent.BEFORE_PROCESSING, (context) => {
  console.log(`before processing = ${context.isEnding()}`);
});

chatbot.on(TraceEvent.AFTER_PROCESSING, (context) => {
  console.log(`after processing = ${context.isEnding()}`);
});

chatbot.on(TraceType.SPEAK, (trace, context) => {
  console.log(`speak trace = ${context.isEnding()}`);
});

(async () => {
  const context = await chatbot.start();
 
  const traces = context.getTrace();
  traces.forEach(trace => {
    if (trace.type === TraceType.SPEAK) {
      console.log(`message, forEach = ${trace.payload.message}`);
    }
  });
  
  const userInput = "I would like a large cheeseburger";
  const context2 = await chatbot.sendText(userInput);
 
  const traces2 = context2.getTrace();
  traces2.forEach(trace => {
    if (trace.type === TraceType.SPEAK) {
      console.log(`message, forEach = ${trace.payload.message}`);
    }
  });
  
  if (context2.isEnding()) {
    cleanupMyApp();
    const context1 = await chatbot.sendText('hello world!')	// exception!
    const context2 = await chatbot.start();									// valid
  }
})();
```

