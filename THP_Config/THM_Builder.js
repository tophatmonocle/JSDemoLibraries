var mediaURL, slugUUID;
/**
Build a demo from the passed in demo configuration.
@class buildDemo
@param  {object} plugin The monocleGL plugin object.
@param  {string} media The URL location of the images resources.
@param  {object} demoJSON The demo JSON configuration to build the demo off of.
@return {void} Nothing
*/
function buildDemo(plugin, media, demoJSON) {
	// Read the mediaURL and slugUUID from JSON
	mediaURL = readJSON(demoJSON.mediaURL, "media url", media);
	slugUUID = readJSON(demoJSON.slug, "demo slug", "");

	// Create a new template for the demo
	var p = plugin;
	monoclegl_initialize(p);
	var numQuestions = readJSON(demoJSON.questions.length, "Number of questions", 1);
	var thmDemo = new THP_Template(p, 545, 371, numQuestions);
	window.thmDemo = thmDemo;

	// Read the demo instructions and title from JSON
	thmDemo.setInstructionText(readJSON(demoJSON.instructions, "demo instructions", "demo instructions"));
	thmDemo.setTitle(readJSON(demoJSON.title, "demo title", "demo title"));

	// If the question array exist then start adding questions
	if(demoJSON.questions !== undefined) {
		for(var i = 0; i < demoJSON.questions.length; i++) {
			var strType = readJSON(demoJSON.questions[i].type, "question " + i + " type", "ordering");

			// Create an ordering question
			if(strType === "ordering") {
				thmDemo.sceneArray[i] = new THM_OrderingQuestion(p, demoJSON.questions[i]);

			// Create a matching question
			} else if(strType === "matching") {
				thmDemo.sceneArray[i] = new THM_MatchingQuestion(p, demoJSON.questions[i]);

			// Create a placement question
			} else if(strType === "placement") {
				thmDemo.sceneArray[i] = new THM_PlacementQuestion(p, demoJSON.questions[i]);

			// Create a labeling question
			} else if(strType === "labeling") {
				thmDemo.sceneArray[i] = new THM_LabelingQuestion(p, demoJSON.questions[i], thmDemo);

			// Create a concept map question
			} else if(strType === "concept_map") {
				thmDemo.sceneArray[i] = new THM_ConceptMapQuestion(p, demoJSON.questions[i], thmDemo);


			// Create a click on target question
			} else if(strType === "click_on_target") {
				thmDemo.sceneArray[i] = new THM_ClickOnTargetQuestion(p, demoJSON.questions[i], thmDemo);
			}
		}
	}
	// Start the demo already
	thmDemo.begin();
}
window.buildDemo = buildDemo;