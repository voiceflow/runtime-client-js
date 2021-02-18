# Integration, Step-by-step

---

**NOTE:** You should read "Setting up a Voiceflow App" for the necessary setup for this article.

To start integrating the Voiceflow app in your codebase, we do the following:

1. Set up a `RuntimeClient` instance using a `RuntimeClientFactory` as shown below. Paste the `VERSION_ID` of your Voiceflow project into the `versionID` configuration option.

```js
import RuntimeClientFactory from "@voiceflow/runtime-client-js"

const factory = new RuntimeClientFactory({
   versionID: 'XXXXXXXXXXXXXXXXXXXXXXXX' // the VERSION_ID goes here 
})
const chatbot = factory.createClient();
```

1. Call `.start()` to begin a conversation session with the Voiceflow app.
2. Store the result of `.start()` into `context`. The `context` is a `Context` object, which is a snapshot of the conversation's current state and it contains useful information like Voiceflow variables.
3. Output the response by iterating over `context.getResponse()` and logging `trace.payload.message`. A **trace** is a piece of the entire response.

```js
(async () => {
  const context = await chatbot.start();
 
  const traces = context.getResponse();
  traces.forEach(trace => console.log(trace.payload.message));
})();
```

4. For subsequent requests after `.start()`, call `.sendText()` and pass in any user input. We call `.sendText()` and `.start()` **interaction methods**.
5. Output the response from `.sendText()` like we did above.

```js
async(() => {
  const context = await chatbot.start();
  // ... etc etc
  
  const userInput = "I would like a large cheeseburger";
  const context2 = await chatbot.sendText(userInput);
 
  const traces2 = context2.getResponse();
  traces2.forEach(trace => console.log(trace.payload.message));
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

(*) - Technically, you are retrieving a list of `GeneralTrace`s and a `SpeakTrace` is a sub-type of a `GeneralTrace`. There are other trace types besides `SpeakTrace`, but a `SpeakTrace` is all that you'll need for most applications.