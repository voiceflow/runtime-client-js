# Setting up a Voiceflow App

---

To start using the SDK, we should build a General Project on [Voiceflow](https://creator.voiceflow.com/). We have [documentation](https://docs.voiceflow.com/#/) available, so you can get ramped up quickly. 

**IMPORTANT:** If you choose to build your own project, make sure you are building a **General Project** (anything that is not an Alexa Project nor a Google Project). The SDK only supports integration with Voiceflow General Projects out of the box.

1. Build a project on Voiceflow.

2. While you are on the Workspace Dashboard, click the settings icon in the top-right corner and open "Workspace Settings". **NOTE:** This will only be available to you if you are an admin of the Workspace.

<img width="500" alt="Workspace Settings button" src="https://user-images.githubusercontent.com/32006038/111632500-eaf4fe00-87ca-11eb-9760-60c9b0f96942.png">

3. Click "Developer" on the menu to get to the developer settings.

<img width="1000" alt="Developer Settings button" src="https://user-images.githubusercontent.com/32006038/111632501-eaf4fe00-87ca-11eb-92f4-693c256a0e58.png">

4. Click "Create New API Key" to generate an API Key. Copy the key, as you will need it later. **NOTE:** You should not save the key somewhere public. This key should be kept secret and supplied to your JavaScript codebase through environment variables.

<img width="1000" alt="Create New API Key button" src="https://user-images.githubusercontent.com/32006038/111632904-550da300-87cb-11eb-8788-88d23b74d3af.png">

5. Go back to your Dashboard.

6. Open the project you created earlier.

<p align="center">
	<img width="546" alt="Button to enter the Hello World project" src="https://user-images.githubusercontent.com/32404412/107441822-eff7cb00-6b03-11eb-9bd6-5551c195669b.png">
</p>	

7. Click the Test button at the top-right corner to open up the Prototyping view.

<p align="center">
	<img width="552"  alt="The test Button on Voiceflow" src="https://user-images.githubusercontent.com/32404412/107269101-17bd3500-6a17-11eb-86b1-b0a817022aca.png">
</p>	

8. Click Train Assistant on the sidebar in the Prototyping view. By now, you will have finished setting up the Voiceflow app.  **NOTE:** If the "Train Assistant" button is not clickable, then your project does not need to be trained, so you can skip this step.

<p align="center">
	<img width="300" alt="The raining Panel on Voiceflow" src="https://user-images.githubusercontent.com/32404412/107269251-5521c280-6a17-11eb-9d82-5a0f62bff14d.png">
</p>	

9. Copy the `VERSION_ID` from the URL in your address bar. When you are inside a Voiceflow project, your address bar should have a URL of the form: `https://creator.voiceflow.com/project/{VERSION_ID}/...`. You will need this `VERSION_ID` and the API key you copied earlier in [Integration, Step-by-Step](https://github.com/voiceflow/runtime-client-js/blob/master/docs/step-by-step.md)

<p align="center">
	<img width="957" align="center" alt="Address bar inside of a Project" src="https://user-images.githubusercontent.com/32404412/107269370-813d4380-6a17-11eb-8bb5-d286c5db3664.png">
</p>

