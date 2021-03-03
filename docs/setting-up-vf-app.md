# Setting up a Voiceflow App

---

To start using the SDK, we should build a General Project on [Voiceflow](https://creator.voiceflow.com/). We have [documentation](https://docs.voiceflow.com/#/) available, so you can get ramped up quickly. 

You can also import `.vf` files into Voiceflow to load a pre-built project. For instructions on how to do this, see [here](https://docs.voiceflow.com/#/platform/project-creation/project-creation?id=project-creation) and click the "Import a .vf file" tab.

**IMPORTANT:** If you choose to build your own project, make sure you are building a **General Project** (anything that is not an Alexa Project nor a Google Project). The SDK only supports integration with Voiceflow General Projects out of the box.

1. Build or import a project on Voiceflow
2. While you are on the Dashboard, append `/api-keys` to the end of your URL, so that it looks like the image below, then, hit Enter to go to the API Keys page.

<img width="557" alt="Address bar at the API keys page" src="https://user-images.githubusercontent.com/32404412/109706616-2b1b7600-7b67-11eb-8d2a-6d9c0521733b.png">

3. On the API Keys page, click "Create New API Key" to generate an API Key. Copy the key, as you will need it later. **NOTE:** You should not save the key somewhere public. This key should be kept secret and supplied to your JavaScript codebase through environment variables.

<img width="1093" alt="API keys page with some generated API keys" src="https://user-images.githubusercontent.com/32404412/109706891-7d5c9700-7b67-11eb-9a6b-e515053931e9.png">

4. Go back to your Dashboard.
5. Open the project you created/imported earlier.

<p align="center">
	<img width="546" alt="Button to enter the Hello World project" src="https://user-images.githubusercontent.com/32404412/107441822-eff7cb00-6b03-11eb-9bd6-5551c195669b.png">
</p>	

6. Click the Test button at the top-right corner to open up the Prototyping view.

<p align="center">
	<img width="552"  alt="The test Button on Voiceflow" src="https://user-images.githubusercontent.com/32404412/107269101-17bd3500-6a17-11eb-86b1-b0a817022aca.png">
</p>	

7. Click Train Assistant on the sidebar in the Prototyping view. By now, you will have finished setting up the Voiceflow app.  **NOTE:** If the "Train Assistant" button is unclickable, then your project does not need to be trained, so you can skip this step.

<p align="center">
	<img width="300" alt="The raining Panel on Voiceflow" src="https://user-images.githubusercontent.com/32404412/107269251-5521c280-6a17-11eb-9d82-5a0f62bff14d.png">
</p>	

8. Copy the `VERSION_ID` from the URL in your address bar. When you are inside a Voiceflow project, your address bar should have a URL of the form: `https://creator.voiceflow.com/project/{VERSION_ID}/...`. You will need this `VERSION_ID` and the API key you copied earlier in [Integration, Step-by-Step](https://github.com/voiceflow/runtime-client-js/blob/master/docs/step-by-step.md)

<p align="center">
	<img width="957" align="center" alt="Address bar inside of a Project" src="https://user-images.githubusercontent.com/32404412/107269370-813d4380-6a17-11eb-8bb5-d286c5db3664.png">
</p>

