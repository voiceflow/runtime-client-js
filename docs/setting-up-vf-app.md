# Setting up a Voiceflow App

---

To start using the SDK, we should build a project on [Voiceflow](https://creator.voiceflow.com/). We have [documentation](https://docs.voiceflow.com/#/) for Voiceflow available. However, for simplicity, we will use a pre-built project.

1. Download this `.vf` file found [here](https://github.com/voiceflow/rcjs-examples/blob/master/hamburger-order/FirstKitchen.vf). The `.vf` file contains a pre-built Voiceflow project that can be imported.
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

6. Copy the `VERSION_ID` from the URL in your address bar. When you are inside a Voiceflow project on , your address bar should have a URL of the form: `https://creator.voiceflow.com/project/{VERSION_ID}/...`

<p align="center">
	<img width="957" align="center" alt="Screen Shot 2021-02-08 at 2 11 09 PM" src="https://user-images.githubusercontent.com/32404412/107269370-813d4380-6a17-11eb-8bb5-d286c5db3664.png">
</p>	

