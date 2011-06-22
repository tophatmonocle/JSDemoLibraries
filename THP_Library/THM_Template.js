/*! THP_Template.js */
// ---------------------------------------------------------------------
// THP_Template.js
// Author: Anson MacKeracher, Ethan Greavette
// Date: 6/21/2010
// Comments: This template script constructs the demo template that the
//           demo lives in. Please note that THP_Template.js requires
//           the presence of osmosis.js compatibility layer to function
//           properly!
// ---------------------------------------------------------------------
/**
The main object of the demo
@class THP_Template
@param  {object} plugin The monocleGL plugin object
@param  {number} width The width of the sprite
@param  {number} height The height of the sprite
@param  {number} sceneDescriptor The number of scenes in this demo
@return {void} Nothing
*/
function THP_Template(plugin, width, height, sceneDescriptor) {
    var that = this;
	if (typeof jQuery === "undefined")	{
		logDebug("Demo on local server");
		this.boolSimulate = true;
	} else {
		logDebug("Demo on THM server");
		this.boolSimulate = false;
	}

	if(typeof plugin.isMobile !== "undefined") {
		this.boolMobile = plugin.isMobile();
	} else {
		// TODO use only isMobile once implemented
		this.boolMobile = true;
	}

	if(typeof plugin.getPluginVersion === "undefined") {
		logDebug("No plugin found");
	 	return false;
    }
	logDebug("monocleGL version: " + plugin.getPluginVersion() );

	// Record plugin infromation
    this.plugin = plugin; // Keep a reference to the plugin object
    this.width = width;
    this.height = height;
	this.travelTime = 0.25;

	// Set demo spefic varibles
    this.totalFinished = 0;
    this.plugin.setInteractive(true);
	this.demo_name = window.demo_name;
	this.submissionRetryID = 0;


	// Setup explore mode varibles
	this.funcExploreInit = null;
	this.funcExploreCleanUp = null;
	this.scnExplore = new Scene(this.plugin, false);
	this.boolExplore = false;
	this.boolExploring = false;
	this.expLayer = new Layer(this.plugin, 0, 0, 480, 320);
	this.expLayer.setColor(0, 0, 0, 0);
	this.scnLast;

	// Create the scene array if the user entered a number for the # of questions
	this.currentScene = 0;
    this.totalScenes = 0;
	if( typeof sceneDescriptor === "number") {
		this.totalScenes = sceneDescriptor;
		sceneDescriptor = new Array();

		// Push a 1 for each question in the demo
		for(i = 0; i < this.totalScenes; i++) {
			sceneDescriptor.push(1);
		}
	} else {
		// Record of the total number of questions
		for(i = 0; i < sceneDescriptor.length; i++) {
			this.totalScenes = this.totalScenes + sceneDescriptor[i];
		}
	}

    // ---------------------------------------------------------------------
    // Set up demo layers and sprites

 	// Create the very back layer
    this.preload_layer = new Layer(this.plugin, 0, 0, 480, 320);

	// Create the background image
    this.preload_sprite = new Sprite(this.plugin, "thm_loader.png", 0, 0, 480, 320);

	// Create the progress bar
    this.preload_loadingbar_container = new Primitive(this.plugin, "rectangle", 115, 30, 250, 20);
    this.preload_loadingbar_container.setColor(0.7, 0.7, 0.7, 0.7);
    this.preload_loadingbar = new Primitive(this.plugin, "rectangle", 118, 33, 0, 14);
    this.preload_loadingbar.setColor(0.3, 0.3, 0.9, 1.0);

	// Create the loading label
    this.preload_label = new Label(this.plugin, "Loading...", 2, 115, 30, 250, 20);
    this.preload_label.setColor(0.0, 0.0, 0.0, 0.0);
    this.preload_label.setCaptionColor(0.0, 0.0, 0.0, 1.0);
    this.preload_label.setCaptionColor(0.0, 0.0, 0.0, 1.0);
    this.preload_label.setAnchor("center");

	// Make a new scene and add all the childern
    this.preload_scene = new Scene(this.plugin, false);
    this.preload_scene.addChild(this.preload_layer);
    this.preload_layer.addChild(this.preload_sprite);
    this.preload_layer.addChild(this.preload_loadingbar_container);
    this.preload_layer.addChild(this.preload_loadingbar);
    this.preload_layer.addChild(this.preload_label);
    this.plugin.setScene(this.preload_scene.getId());

    // Demo background
    this.layoutFrameSprite = new Sprite(this.plugin, "demo_layout_frame.png", 0, 0, 480, 320);

    // Set up menus and their callbacks.
    this.answerPanelLayer = new Layer(this.plugin, 480, 0, 65, 320);
    this.answerPanelLayer.setColor(0.0, 0.0, 0.0, 0.0);

    // Submit answer button
    this.submitButton = new Button(this.plugin, "submit", 0, 250, 60, 39);
    this.submitButton.subscribe();
    this.submitButton.clickCallback(this, "submitAnswer");

    // Answer button appears once the tries are used up
    this.answerButton = new Button(this.plugin, "answer", 0, 250, 60, 39);
    this.answerButton.clickCallback(this, "showAnswer");
	this.answerButton.setVisibility(false);
    this.answerButton.setActive(false);

    // Explore button appears once the tries are used up
    this.readyButton = new Button(this.plugin, "ready", 0, 250, 60, 39);
    this.readyButton.clickCallback(this, "endExplore");
	this.readyButton.setVisibility(false);
	this.readyButton.setActive(false);


	// The "wifi connecting" indicator
    this.wifiGreySprite = new Sprite(this.plugin, "wifiGrey.png", 35, 230, 20, 20);
    this.wifiGreySprite.setVisibility(false);

	// The "wifi connected" indicator
    this.wifiGreenSprite = new Sprite(this.plugin, "wifiGreen.png", 35, 230, 20, 20);
    this.wifiGreenSprite.setVisibility(false);

	// The "wifi simulated" indicator
    this.wifiBlueSprite = new Sprite(this.plugin, "wifiBlue.png", 35, 230, 20, 20);
    this.wifiBlueSprite.setVisibility(false);

    // The "correct answer" indicator
    this.checkSprite = new Sprite(this.plugin, "check.png", 6, 230, 24, 20);
    this.checkSprite.setVisibility(false);

    // The "incorrect answer" indicator
    this.crossSprite = new Sprite(this.plugin, "cross.png", 10, 230, 20, 20);
    this.crossSprite.setVisibility(false);

	// The answer panel graphics
    this.answerPanelSprite = new Sprite(this.plugin, "demo_menu_right.png", 0, 0, 65, 320);

	// The label "title" on the progress bar
    this.questionLabel = new Label(this.plugin, "", 12,  10, 210, 460, 80);
    this.questionLabel.setColor(0.0, 0.0, 0.0, 0.0);
    this.questionLabel.setCaptionColor(0.0, 0.0, 0.0, 1.0);
	this.questionLabel.setVisibility(true);
	this.questionLabel.setWrap(true);

	// The label "title" on the progress bar
    this.titleLabel = new Label(this.plugin, "", 12, -320, 290, 315, 20);
    this.titleLabel.setColor(0.0, 0.0, 0.0, 0.0);
    this.titleLabel.setCaptionColor(0.0, 0.0, 0.0, 1.0);
    this.titleLabel.setVisibility(true);
    this.titleLabel.setAnchor("right");

	// Add all the childern to the answer panel layer
    this.answerPanelLayer.addChild(this.answerPanelSprite);
    this.answerPanelLayer.addChild(this.titleLabel);
    this.answerPanelLayer.addChild(this.submitButton);
    this.answerPanelLayer.addChild(this.answerButton);
	this.answerPanelLayer.addChild(this.readyButton);
	this.answerPanelLayer.addChild(this.wifiGreySprite);
	this.answerPanelLayer.addChild(this.wifiGreenSprite);
	this.answerPanelLayer.addChild(this.wifiBlueSprite);
    this.answerPanelLayer.addChild(this.checkSprite);
    this.answerPanelLayer.addChild(this.crossSprite);

	// Create the bottom panel layer
    this.bottomPanelLayer = new Layer(this.plugin, 0, -51, 480, 51);
    this.bottomPanelLayer.setColor(0.0, 0.0, 0.0, 0.0);

	// The bottom panel graphic
    this.menuBottomSprite = new Sprite(this.plugin, "demo_menu_bottom.png", 0, 0, 480, 51);

	// The status bar for showing user how many questions they have
    this.demoStatusSprite = new Sprite(this.plugin, "demo_status_white.png", 45, 6, 259, 26);

	// The previous scene button
    this.previousSceneButton = new Button(this.plugin, "prevScene", 3, 10, 39, 39);
    this.previousSceneButton.upCallback(this, "prevScene");
	this.previousSceneButton.setActive(false);

	// The next scene button
    this.nextSceneButton = new Button(this.plugin, "nextScene", 437, 10, 39, 39);
    this.nextSceneButton.upCallback(this, "nextScene");
	this.nextSceneButton.setActive(false);

	// The reset scene button
    this.refreshButton = new Button(this.plugin, "refresh", 320, 6, 42, 27);
    this.refreshButton.upCallback(this, "resetButtonClickCallback");
	this.refreshButton.setActive(true);

	// The explore button
    this.exploreButton = new Button(this.plugin, "explore", 360, 6, 42, 27);
	this.exploreButton.clickCallback(this, "gotoExplore");
	this.exploreButton.setActive(false);

	// Set up the tries & status labels
    this.triesLabel = new Label(this.plugin, "Quiz: Submission chances left 3", 1, 50, 12, 200, 20);
    this.triesLabel.setColor(1.0, 1.0, 1.0, 0.0);
    this.triesLabel.setCaptionColor(0.0, 0.0, 0.0, 1.0);

	// Add all the childern to the bottom panel layer
    this.bottomPanelLayer.addChild(this.menuBottomSprite);
    this.bottomPanelLayer.addChild(this.nextSceneButton);
    this.bottomPanelLayer.addChild(this.previousSceneButton);
    this.bottomPanelLayer.addChild(this.demoStatusSprite);
    this.bottomPanelLayer.addChild(this.refreshButton);
    this.bottomPanelLayer.addChild(this.exploreButton);
    this.bottomPanelLayer.addChild(this.triesLabel);

	// Add the arrows pointing up to the bottom of the screen
    this.bottomPanelHoverSprite = new Sprite(this.plugin, "", 0, 0, this.width, 32);
    this.bottomPanelHoverSprite.subscribe();
    this.bottomPanelHoverSprite.overCallback(this, "bottomPanelHoverCallback");
	this.bottomPanelHoverSprite.clickCallback(this, "bottomPanelHoverCallback");

	// Add the arrows pointing left to the right of the screen
    this.answerPanelHoverSprite = new Sprite(this.plugin, "", 460, 0, 20, this.height);
    this.answerPanelHoverSprite.subscribe();
    this.answerPanelHoverSprite.overCallback(this, "answerPanelHoverCallback");
	this.answerPanelHoverSprite.clickCallback(this, "answerPanelHoverCallback");

	// Add to the middle of the screen from moving panel back
    this.problemAreaHoverSprite = new Sprite(this.plugin, "", 0, 50, 400, 270);
    this.problemAreaHoverSprite.subscribe();
    this.problemAreaHoverSprite.overCallback(this, "problemAreaHoverCallback");
	this.problemAreaHoverSprite.clickCallback(this, "problemAreaHoverCallback");

	// The arrow on the answer and bottom panel
    this.bottomPanelHoverArrowSprite = new Sprite(this.plugin, "btnSmallArrowUpGrey.png", 230, 0, 20, 20);
    this.answerPanelHoverArrowSprite = new Sprite(this.plugin, "btnSmallArrowLeftGrey.png", 460, 150, 20, 20);

	// Back to PhoneGap button
    // TODO: Make the functionality of this button more obvious
    this.backToPG = new Button(this.plugin, "prevScene", 10, 285, 30, 30);
    this.backToPG.bind("mouse_up", function() {
            that.plugin.loadPhoneGap();
        });
    this.backToPG.subscribe();

	var xOffset = 0;
	if(this.boolMobile) xOffset = 30;

	// The progress bar sprite
    this.progressBarSprite = new Sprite(this.plugin, "demo_progress_red.png", 15 + xOffset, 290, 110, 20);

	// The label "update" on the progress bar
    this.progressBarLabel = new Label(this.plugin, "Progress ", 1, 28 + xOffset, 292, 40, 20);
    this.progressBarLabel.setColor(0.0, 0.0, 0.0, 0.0);
    this.progressBarLabel.setCaptionColor(1.0, 1.0, 1.0, 1.0);

	// The label to update how many quizzes the user has finished
    this.progressBarCount = new Label(this.plugin, "(" + this.totalFinished + "/" + this.totalScenes + ")", 1, 80 + xOffset, 292, 30, 20);
    this.progressBarCount.setColor(0.0, 0.0, 0.0, 0.0);
    this.progressBarCount.setCaptionColor(1.0, 1.0, 1.0, 1.0);

    // Add the left "cap" to the progress bar
    this.progressLeftSprite = new Sprite(this.plugin, "demo_progress_left.png", 15 + xOffset, 290, 8, 20);
    this.progressLeftSprite.setVisibility(false);

    // Add the right "cap" to the progress bar
    this.progressRightSprite = new Sprite(this.plugin, "demo_progress_right.png", 120 + xOffset, 290, 8, 20);
    this.progressRightSprite.setVisibility(false);

    // Add the "middle" sprite to the progress bar
    this.progressMiddleSprite = new Sprite(this.plugin, "demo_progress_middle.png", 17 + xOffset, 290, 8, 0);

	// Add the instruct sprite at the beginning
    this.instructionsSprite = new Sprite(this.plugin, "demo_instructions_bg.png", 115, 65, 250, 200);
    this.instructionsSprite.setVisibility(false);

	// Add the "ok" button the allow the user to continue
    this.instructionsButton = new Button(this.plugin, "ok", 318, 79, 36, 28);
    this.instructionsButton.subscribe();
    this.instructionsButton.setVisibility(false);
    this.instructionsButton.upCallback(this, "hideInstructions");

	// Add the label for "Instructions:"
    this.instructionsLabel = new Label(this.plugin, "Instructions:", 3, 130, 200, 200, 50);
    this.instructionsLabel.setColor(1.0, 1.0, 1.0, 0.0);
    this.instructionsLabel.setCaptionColor(0.0, 0.0, 0.0, 1.0);
    this.instructionsLabel.setVisibility(false);

	// Add the label for the instruction text
    this.instructionsTextLabel = new Label(this.plugin, "Placeholder", 1, 130, 100, 200, 100);
    this.instructionsTextLabel.setColor(1.0, 1.0, 1.0, 0.0);
    this.instructionsTextLabel.setCaptionColor(0.0, 0.0, 0.0, 1.0);
    this.instructionsTextLabel.setVisibility(false);
    this.instructionsTextLabel.setWrap(true);

    // Setup the promblem area label layers
    this.problemLayer = new Layer(this.plugin, 0, 0, 480, 320);
    this.problemLayer.setColor(0.88, 0.88, 0.88, 1.0);
    this.problemLayer.addChild(this.layoutFrameSprite);
    this.problemLayer.addChild(this.bottomPanelHoverArrowSprite);
    this.problemLayer.addChild(this.answerPanelHoverArrowSprite);

    // Setup the curtain layer to darken the screen
    this.curtainLayer = new Layer(this.plugin, 0, 0, this.width, this.height);
    this.curtainLayer.setColor(0.0, 0.0, 0.0, 0.0);
    this.curtainLayer.addChild(this.instructionsSprite);
    this.curtainLayer.addChild(this.instructionsButton);

    this.panelState = {
        RETRACTED  : 0,
        EXTENDING  : 1,
        EXTENDED   : 2,
        RETRACTING : 3
    };

    // Initialize the state machine
    this.bottomPanelState = this.panelState.RETRACTED;
    this.answerPanelState = this.panelState.RETRACTED;

    // Controls whether the panels are locked
	this.bottomPanelLock = false;
    this.answerPanelLock = false;

	// Setup the scene array
    this.sceneArray = [];
	this.quizNames = [];
    for(var j = 0; j < sceneDescriptor.length; j++) {
        this.sceneArray[j] = new Scene(this.plugin);
		this.quizNames.push("Q"+(j+1));
		logDebug("Scene created " + this.quizNames);
    }

    // CLIPPING INFORMATION FOR PLUGIN
    // Ask Anson before fux0ring with this plz
    this.headerClipping = 60;
    this.footerClipping = 25;

	// -------------------------------------------------------------------------
    // Functions

	/**
	Returns the cliping information for the top and the bottom of the plugin
	@param  {void} Nothing
	@return {array} An array with the 1st element the header clipping value and the 2nd element being the footer clipping value.
	*/
    this.getWindowClipping = new function() {
    		logDebug("Clipping infromation called, header: "+ this.headerClipping + " footer: " + this.footerClipping);
        return [this.headerClipping, this.footerClipping];
    };

	/**
	Set up callback functions for when the show answer button is pressed.
	@param  {number} x The x position of the mouse.
	@param  {number} y The y position of the mouse.
	@return {void} Nothing.
	*/
    this.showAnswer = function(x, y) {
   		var scene = this.getCurrentScene();
		scene.showCorrectAnswer();
	};

    /**
	Set up callback functions for when the submit button is pressed.
	@param  {void} Nothing.
	@return {void} Nothing.
	*/
    this.submitAnswer = function() {
        if( this.totalFinished === this.totalScenes || this.getCurrentScene().getCompleted() ) {
        		logError("The demo tried to submit a question after it's done answering all the questions.");
            return;
        }

		// Check if answer is right or not
        if(this.getCurrentScene().checkAnswer()) {

			// If the user was correct then update progress and set scene bits
			logDebug("Check answer true");
			this.totalFinished = this.totalFinished + 1;
			this.updateProgress();
			this.getCurrentScene().setCorrect(true);
			this.getCurrentScene().setCompleted(true);

			// Send the correct message to the server
			this.persistentSubmission(this);
		} else {

			// If the user was incorrect subtract a try from the scene
			logDebug("Check answer false");
            this.getCurrentScene().decrementTries();
            if(this.getCurrentScene().getTries() === 0) {

            		// Update progress and set scene bits
				this.totalFinished = this.totalFinished + 1;
				this.updateProgress();
				this.getCurrentScene().setCorrect(false);
				this.getCurrentScene().setCompleted(true);

				// Send the correct message to the server and show the answer
				this.persistentSubmission(this);
				this.showAnswer();
            }
        }

        // Update the UI to reflect the new state changes
        this.drawUI();
    };

	/**
	Set up the callback function to extend the bottom panel when the mouse goes over the bottom part of the screen.
	@param  {number} x The x position of the mouse.
	@param  {number} y The y position of the mouse.
	@return {void} Nothing.
	*/
    this.bottomPanelHoverCallback = function(x, y) {
    		// Check if state of bottom panel is retracted then extend the bottom panel
        if(this.bottomPanelState === this.panelState.RETRACTED) {
            this.extendBottomPanel();
        }
    };

	/**
	Set up the callback function to extend the answer panel when the mouse goes over the right part of the screen.
	@param  {number} x The x position of the mouse.
	@param  {number} y The y position of the mouse.
	@return {void} Nothing.
	*/
    this.answerPanelHoverCallback = function(x, y) {
    		// Check if state of answer panel is retracted then extend the answer panel
        if(this.answerPanelState === this.panelState.RETRACTED) {
            this.extendAnswerPanel();
        }
    };

	/**
	Set up the callback function to retract the answer and bottom panels when the mouse goes over the middle of the screen.
	@param  {number} x The x position of the mouse.
	@param  {number} y The y position of the mouse.
	@return {void} Nothing.
	*/
    this.problemAreaHoverCallback = function(x, y) {
    		// Check if the answer panel is extended then retract the answer panel
        if(this.answerPanelState === this.panelState.EXTENDED) {
            this.retractAnswerPanel();
        // Check if the answer panel is extending then set the waiting bit to retract after extension
        } else if(this.answerPanelState === this.panelState.EXTENDING) {
            this.waitingToRetractAnswer = true;
        }

        // Check if the bottom panel is extended then retract the bottom panel
        if(this.bottomPanelState === this.panelState.EXTENDED) {
            this.retractBottomPanel();
        // Check if the bottom panel is extending then set the waiting bit to retract after extension
        } else if(this.bottomPanelState === this.panelState.EXTENDING) {
            this.waitingToRetractBottom = true;
        }
    };

	/**
	Retract the answer panel if it's extended and is not currently being tweened.
	@param  {void} Nothing.
	@return {void} Nothing.
	*/
	this.retractAnswerPanel = function() {
		// Check if the answer panel is locked before retracting it
        if(!this.answerPanelLock) {
        		// Set the answer panel state to retracting and the arrows the by visible
            this.answerPanelState = this.panelState.RETRACTING;
			this.answerPanelHoverArrowSprite.setVisibility(true);

			// Set the tweens to retract the answer panel and a callback when complete
			this.answerPanelLayer.addTween("x:480,persistent:true,transition:ease_out,time:"+this.travelTime);
			setTimeout(this.answerMoveDone, (this.travelTime * 1000) + 250, this);
        }
	};

	/**
	Extend the answer panel if it's retracted and is not currently being tweened.
	@param  {void} Nothing.
	@return {void} Nothing.
	*/
	this.extendAnswerPanel = function() {
		// Check if the answer panel is locked before extending it
        if(!this.answerPanelLock) {
        		// Set the answer panel state to extending and the arrows the by invisible
            this.answerPanelState = this.panelState.EXTENDING;
			this.answerPanelHoverArrowSprite.setVisibility(false);

			// Set the tweens to extend the answer panel and a callback when complete
			this.answerPanelLayer.addTween("x:415,persistent:true,transition:ease_out,time:"+this.travelTime);
			setTimeout(this.answerMoveDone, (this.travelTime * 1000) + 250, this);
        }
	};

	/**
	Retract the bottom panel if it's extended and is not currently being tweened.
	@param  {void} Nothing.
	@return {void} Nothing.
	*/
	this.retractBottomPanel = function() {
		// Check if the bottom panel is locked before retracting it
        if(!this.bottomPanelLock) {
      		// Set the bottom panel state to retracting and the arrows the by visible
            this.bottomPanelState = this.panelState.RETRACTING;
            this.bottomPanelHoverArrowSprite.setVisibility(true);

            // Set the tweens to retract the bottom panel and a callback when complete
            this.bottomPanelLayer.addTween("y:-51,persistent:true,transition:ease_out,time:"+this.travelTime);
			setTimeout(this.bottomMoveDone, (this.travelTime * 1000) + 250, this);
        }
	};

	/**
	Extend the bottom panel if it's retracted and is not currently being tweened.
	@param  {void} Nothing.
	@return {void} Nothing.
	*/
	this.extendBottomPanel = function() {
		// Check if the bottom panel is locked before extending it
        if(!this.bottomPanelLock) {
        		// Set the bottom panel state to extending and the arrows the by invisible
            this.bottomPanelState = this.panelState.EXTENDING;
            this.bottomPanelHoverArrowSprite.setVisibility(false);

            // Set the tweens to retract the answer panel and a callback when complete
            this.bottomPanelLayer.addTween("y:0,persistent:true,transition:ease_out,time:"+this.travelTime);
			setTimeout(this.bottomMoveDone, (this.travelTime * 1000) + 250, this);
        }
	};

    /**
	Called when the answer panel is done moving.
	@param  {object} instance The reference to this template object instance.
	@return {void} Nothing.
	*/
	this.answerMoveDone = function(instance) {
		// Check if the answer panel is state is extending
        if(instance.answerPanelState === instance.panelState.EXTENDING) {
			// Check if the waitingToRetractAnswer bit is set
            if(instance.waitingToRetractAnswer) {
            		// Start answer panel retraction and turn off the bit
                instance.retractAnswerPanel();
                instance.waitingToRetractAnswer = false;
            } else {
            		// Change the answer panel state to be fully extended
                instance.answerPanelState = instance.panelState.EXTENDED;
            }
        // Check if the answer panel is state is retracting
        } else if (instance.answerPanelState === instance.panelState.RETRACTING) {
        		// Change the answer panel state to be fully retracted
            instance.answerPanelState = instance.panelState.RETRACTED;
        }
	};

	/**
	Called when the bottom panel is done moving.
	@param  {object} instance The reference to this template object instance.
	@return {void} Nothing.
	*/
	this.bottomMoveDone = function(instance) {
		// Check if the bottom panel is state is extending
        if(instance.bottomPanelState === instance.panelState.EXTENDING) {
       		// Check if the waitingToRetractBottom bit is set
            if(instance.waitingToRetractBottom) {
            		// Start bottom panel retraction and turn off the bit
                instance.retractBottomPanel();
                instance.waitingToRetractBottom = false;
            } else {
            		// Change the bottom panel state to be fully extended
                instance.bottomPanelState = instance.panelState.EXTENDED;
            }
        // Check if the bottom panel is state is retracting
        } else if (instance.bottomPanelState === instance.panelState.RETRACTING) {
        		// Change the bottom panel state to be fully retracted
            instance.bottomPanelState = instance.panelState.RETRACTED;
        }
	};

    /**
	Callback for when the reset button is pressed.
	@param  {number} x The x position of the mouse.
	@param  {number} y The y position of the mouse.
	@return {void} Nothing.
	*/
	this.resetButtonClickCallback = function(x, y) {
		// Check if in explore mode
		if(this.boolExploring === true) {
			// Reset explore mode
			this.scnExplore.resetQuiz();
			// Run the init script for explore mode
			if(this.funcExploreInit !== null) this.funcExploreInit();
		} else {
			// Reset the question and run the load quiz again
			this.getCurrentScene().resetQuiz();
  	  	}
    };

    /**
	Change the title displayed at the top left corner of the demo.
	@param  {string} title The string to replace the current title with.
	@return {void} Nothing.
	*/
    this.setTitle = function(title) {
        this.titleLabel.setText(title);
    };

    /**
	Change the number of tries allowed for the passed in scene.
	@param  {number} tries The new number of tries allowed for the passed in scene.
	@param  {object} scene The scene to change the number of tries in.
	@return {void} Nothing.
	*/
	this.setTries = function(tries, scene) {
        if(typeof tries !== "number") {
			logError("Demo tried to set the number of tries with a non-numeric varible.");
            return;
        }
        scene.setTries(tries);
    };

    /**
	Return the scene object for the scene number passed in.
	@param  {number} scene The scene number starting at 0.
	@param  {number} step Depercated, used for scene with multiple steps.
	@return {object} The scene object for the scene number passed in.
	*/
	this.getScene = function(scene, step) {
        return this.sceneArray[scene];
    };

    /**
	Returns the scene object currently being presented.
	@param  {void} Nothing.
	@return {object} The scene object for the scene currently being presented.
	*/
    this.getCurrentScene = function() {
        return this.getScene( this.currentScene );
    };

    /**
	Returns the scene number currently being presented.
	@param  {void} Nothing.
	@return {number} The scene number for the scene currently being presented.
	*/
    this.getSceneNumber = function() {
        return this.currentScene;
    };

	/**
	Returns a flat array with each scene's id.
	@param  {void} Nothing.
	@return {array} Returns a array of all the scene id's.
	*/
    this.getFlatSceneIdList = function() {
        var flatSceneIdList = new Array();
		flatSceneIdList.push(this.scnExplore.getId());

        // Populate the flat ID array with the ID with the ID for every scene
        for (var i = 0; i < this.sceneArray.length; i++) {
            flatSceneIdList.push(this.sceneArray[i].getId());
        }
        return flatSceneIdList;
    };

	/**
	Returns a flat array with each scene.
	@param  {void} Nothing.
	@return {array} Returns a array of all the scene objects.
	*/
    this.getFlatSceneList = function() {
        var flatSceneList = new Array();
		flatSceneList.push(this.scnExplore);

        // Populate the flat scene array with the refence for every scene
        for (var i = 0; i < this.sceneArray.length; i++) {
            flatSceneList.push(this.sceneArray[i]);
        }
        return flatSceneList;
    };

	/**
	Called when the preloader has finished completely.
	@param  {void} Nothing.
	@return {void} Nothing.
	*/
    this.donePreload = function() {
		// Show 100% complete progress bar
        that.preload_loadingbar.setDimensions(240, 14);

		that.plugin.setScene(that.sceneArray[0].getId());
        that.showInstructions();

        logDebug("Preload complete");
    };

	/**
	Called when the preloader has finished loading a single resource
	@param  {void} Nothing.
	@return {void} Nothing.
	*/
    this.updatePreload = function(increment, total) {
		// Update the width based on precent done
        var width = 240 * (increment/total);
        that.preload_loadingbar.setDimensions(width, 14);
        logDebug("loaded: " + increment / total);
    };

    /**
	Start the demo by preload all the images and running the initQuiz functions
	@param  {void} Nothing.
	@return {void} Nothing.
	*/
    this.begin = function() {
        plugin.hideSpinner();

		// Create the flat scene list and id list
        sceneIdArray = this.getFlatSceneIdList();
        sceneArray = this.getFlatSceneList();

		// Register questions with the
		if (typeof register_questions === "function") {
			register_questions(this.demo_name, this.js_getNumberOfQuizzes(), this.js_getQuizNames());
		}

		// Build up explore mode
		if (this.funcExploreInit !== null) this.funcExploreInit();
		if (this.boolExplore) this.scnExplore.initQuiz();
		this.buildExplore();

		// Build up each scene and call initQuiz function
		for(var i = 0; i < this.sceneArray.length; i++) {
			this.sceneArray[i].initQuiz();
			this.buildScene(this.sceneArray[i]);
        }

		// Start the preload
        logDebug("starting preload");
        this.preload_layer.bind("preload_update", this.updatePreload);
        this.preload_layer.bind("preload_complete", this.donePreload);
        this.plugin.preload(this.preload_layer.getId(), sceneIdArray);
    };

    /**
	Change the current scene to the next scene
	@param  {void} Nothing.
	@return {void} Nothing.
	*/
    this.nextScene = function() {
		clearTimeout(this.submissionRetryID);

        // Check if current scene is the last one
        if(this.currentScene  === this.totalScenes) {
            return;
        }
        this.getCurrentScene().cleanUp();

        // We are out of steps
        if(this.currentScene == this.sceneArray.length - 1) {
            this.nextSceneButton.setActive(false);
            return;
        }

        // Increment the scene and change it
        this.currentScene++;
        this.changeScene(this.sceneArray[this.currentScene]);

		// If the question is complete but it doesn't has the response on the server then try to resend
		if( this.getCurrentScene().getCompleted() && !this.getCurrentScene().getServerStatus() ) {
			this.submissionRetryID = setTimeout(this.persistentSubmission, 8000, this);
			logDebug("Submissive number = " + this.submissionRetryID);
		}
    };

	/**
	Change the current scene to the one provided
	@param  {object} scene The new scene to change to.
	@return {void} Nothing.
	*/
    this.changeScene = function(scene) {
        this.plugin.setScene(scene.getId());
        this.drawUI();
		this.getCurrentScene().loadQuiz();
    };

    /**
	Change the current scene to the previous scene
	@param  {void} Nothing.
	@return {void} Nothing.
	*/
    this.prevScene = function() {
		clearTimeout(this.submissionRetryID);

		// Is this the frist step
        if(this.currentScene === 0) {
        		logDebug("Frist scene");
            return;
        // Decrement the scene and change it
        } else {
       		this.getCurrentScene().cleanUp();
            this.currentScene--;
            this.changeScene(this.sceneArray[this.currentScene]);
        }

		// If the question is complete but it doesn't has the response on the server then try to resend
		if( this.getCurrentScene().getCompleted() && !this.getCurrentScene().getServerStatus() ) {
			this.submissionRetryID = setTimeout(this.persistentSubmission,8000, this);
			logDebug("Submissive number = " + this.submissionRetryID);
		}
    };

    /**
	Draw the current scene as well as the controls & menus.
	@param  {void} Nothing.
	@return {void} Nothing.
	*/
    this.drawUI = function() {
        var scene = this.getCurrentScene();

		if(scene.strInstruction === "") {
			this.questionLabel.setVisibility(false);
		} else {
			this.questionLabel.setVisibility(true);
			this.questionLabel.setText(scene.strInstruction);
		}

        // Update correct/incorrect indicators
        if(scene.getCompleted()) {
            if(scene.getCorrect()) {
				// is correct so show check
                this.crossSprite.setVisibility(false);
                this.checkSprite.setVisibility(true);
            } else {
				// Is incorrect so shown 'X'
                this.crossSprite.setVisibility(true);
                this.checkSprite.setVisibility(false);
            }

			if( scene.getServerStatus() && this.boolSimulate ) {
				// received by server (simulated)
				this.wifiGreenSprite.setVisibility(false);
				this.wifiBlueSprite.setVisibility(true);
				this.wifiGreySprite.setVisibility(false);
				// receive by server
			} else if ( scene.getServerStatus() && !this.boolSimulate ) {
				this.wifiGreenSprite.setVisibility(true);
                this.wifiBlueSprite.setVisibility(false);
				this.wifiGreySprite.setVisibility(false);
            } else {
				// not received by server
				this.wifiGreenSprite.setVisibility(false);
                this.wifiBlueSprite.setVisibility(false);
				this.wifiGreySprite.setVisibility(true);
            }

			// Activate the answer button
            this.submitButton.setActive(false);
			this.answerButton.setActive(true);
			this.readyButton.setActive(false);

			// Set the answer button to be visible
	  	  	this.submitButton.setVisibility(false);
		    this.answerButton.setVisibility(true);
		    this.readyButton.setVisibility(false);
        } else {
			// Set check and "X" icon off
			this.crossSprite.setVisibility(false);
            this.checkSprite.setVisibility(false);

			// Set all the wifi icons off
			this.wifiGreySprite.setVisibility(false);
			this.wifiGreenSprite.setVisibility(false);
			this.wifiBlueSprite.setVisibility(false);

			// Show grey wifi if the user has tried at least once
			if(scene.getTries() != 3) {
				this.wifiGreySprite.setVisibility(true);
				this.crossSprite.setVisibility(true);
			}

			// Activate the submit button
			this.submitButton.setActive(true);
			this.answerButton.setActive(false);
			this.readyButton.setActive(false);

			// Set the submit button to be visible
	  	  	this.submitButton.setVisibility(true);
		    this.answerButton.setVisibility(false);
		    this.readyButton.setVisibility(false);
        }

        // Update the next scene buttons
        if( !(this.currentScene === this.sceneArray.length - 1) ) {
			// If the question is complete and not at the end of the demo set next button to be active
            if(scene.getCompleted()) {
                this.nextSceneButton.setActive(true);
            //Else set next button to be inactive
            } else {
                this.nextSceneButton.setActive(false);
            }
        // If on the last question set next button to be inactive
        } else {
            this.nextSceneButton.setActive(false);
        }

        // Update the previous scene buttons
        if(!(this.currentScene === 0)) {
        		// If NOT on the frist question set previous button to be active
            this.previousSceneButton.setActive(true);
        } else {
       	 	// If on the frist question set previous button to be inactive
            this.previousSceneButton.setActive(false);
        }

		//
        this.triesLabel.setText("Quiz: Submission chances left " + scene.getTries());
    };

	/**
	Update the progress bar to reflect the current state of the demo.
	@param  {void} Nothing.
	@return {void} Nothing.
	*/
    this.updateProgress = function() {
        	var progressWidth = 0;
        if(this.totalFinished === 0) {
			logError("The demo has tried to up date the progress with 0 totalFinished");
            return;
        }

		// Set the progress bar text to update the totalFinished
        this.progressBarCount.setText("(" + this.totalFinished + "/" + this.totalScenes + ")");

		if(this.totalFinished === 1 && this.totalScenes !== 1) {
            // Remaining percentage of scenes
			progressWidth = (this.totalFinished / this.totalScenes)*94;
            this.progressMiddleSprite.setDimensions(progressWidth, 20);

            // Add the left "cap" to the progress bar
            this.progressLeftSprite.setVisibility(true);
        } else if (this.totalFinished == this.totalScenes) {

        		// Setup the middle and right cap to make it look complete
            this.progressMiddleSprite.setDimensions(109, 20);
            this.progressRightSprite.setVisibility(true);
        } else {

            // We are somewhere in the middle of the scene list
            progressWidth = (this.totalFinished / this.totalScenes)*94;
            this.progressMiddleSprite.setDimensions(progressWidth, 20);
            this.progressRightSprite.setVisibility(false);
            this.progressLeftSprite.setVisibility(true);
        }
    };

	/**
	Show the curtain and disable the interactive events
	@param  {void} Nothing.
	@return {void} Nothing.
	*/
	this.showCurtain = function() {
		this.curtainLayer.setColor(0.0, 0.0, 0.0, 0.25);
		this.plugin.setInteractive(false);
	};

	/**
	Hide the curtain and enable the interactive events.
	@param  {void} Nothing.
	@return {void} Nothing.
	*/
	this.hideCurtain = function() {
		this.curtainLayer.setColor(0.0, 0.0, 0.0, 0.0);
		this.plugin.setInteractive(true);
	};

    /**
	Show the instructions panel (auto-show the curtain).
	@param  {void} Nothing.
	@return {void} Nothing.
	*/
    this.showInstructions = function() {
		// Make the OK button active during the curtain
        this.plugin.addSpecial(this.instructionsButton.getId());
        this.showCurtain();

		// Set the instruction box to be visible
        this.instructionsSprite.setVisibility(true);
        this.instructionsLabel.setVisibility(true);
        this.instructionsTextLabel.setVisibility(true);
        this.instructionsButton.setVisibility(true);
        this.instructionsButton.subscribe();
    };

    /**
	Hide the instructions panel (auto-hide the curtain).
	@param  {void} Nothing.
	@return {void} Nothing.
	*/
    this.hideInstructions = function() {
   		// Make the OK button active during the curtain
        this.plugin.removeSpecial(this.instructionsButton.getId());
        this.hideCurtain();

        // Set the instruction box to be invisible
        this.instructionsSprite.setVisibility(false);
        this.instructionsLabel.setVisibility(false);
        this.instructionsTextLabel.setVisibility(false);
        this.instructionsButton.setVisibility(false);
        this.instructionsButton.unsubscribe();

        // Test if explore mode has been defined otherwise goto question 1
        if (this.funcExploreInit !== null || this.boolExplore) {
       	 	this.startExplore();
        } else {
			this.changeScene(this.sceneArray[0]);
        }
    };

    /**
	Change the actual text displayed in the instructions panel.
	@param  {string} text The text to be displayed intstruction panel.
	@return {void} Nothing.
	*/
    this.setInstructionText = function(text) {
        if(typeof text != "string") {
            logError("Cannnot set text of label to non-string value");
            return;
        }
        this.instructionsTextLabel.setText(text);
    };

	/**
	Change scene to the scene number passed in.
	@param  {number} numQ The scene number starting at 0.
	@param  {number} numS Depercated, used for scene with multiple steps.
	@return {void} Nothing.
	*/
	this.gotoScene = function(numQ, numS) {
		var scene = this.getScene(numQ, numS);
		this.currentScene = numQ;
		this.changeScene(scene);
	};

	/**
	Calls the current scenes clean up frist and then displays the explore mode scene.
	@param  {void} Nothing.
	@return {void} Nothing.
	*/
    this.gotoExplore = function() {
    	this.getCurrentScene().cleanUp();
    	this.startExplore();
    };

    /**
	Builds up the passed in scene as well as the controls & menus
    @param  {object} scene The scene object to add all the template resources to.
	@return {void} Nothing.
	*/
    this.buildScene = function(scene) {
		// Add the problem layer, developer background the the question label
		scene.addChild(this.problemLayer);
   		scene.addChild(scene.bgLayer);
        scene.addChild(this.questionLabel);

		// Add the panels
        scene.addChild(this.answerPanelLayer);
        scene.addChild(this.bottomPanelLayer);

        // Add the progress bar
		scene.addChild(this.progressBarSprite);
		scene.addChild(this.progressMiddleSprite);
		scene.addChild(this.progressLeftSprite);
		scene.addChild(this.progressRightSprite);
    	scene.addChild(this.progressBarLabel);
        scene.addChild(this.progressBarCount);

        // Add back to phone gap button if mobile
        if(this.boolMobile) scene.addChild(this.backToPG);

		// Add the curtain and everything that should be displayed over it
        scene.addChild(this.curtainLayer);
        scene.addChild(this.instructionsLabel);
        scene.addChild(this.instructionsTextLabel);
	};

	/**
	Builds up the explore mode scene as well as the controls & menus
    @param  {void} Nothing.
	@return {void} Nothing.
	*/
	this.buildExplore = function() {
		logDebug("Building up explore mode");

		// Add the problem layer, developer backgrond the the question label
		this.scnExplore.addChild(this.problemLayer);
		this.scnExplore.addChild(this.expLayer);
		this.scnExplore.addChild(this.scnExplore.bgLayer);
		this.scnExplore.addChild(this.questionLabel);

		// Add the panels
		this.scnExplore.addChild(this.answerPanelLayer);
        this.scnExplore.addChild(this.bottomPanelLayer);

		// Add the progress bar
	    this.scnExplore.addChild(this.progressBarSprite);
  	  	this.scnExplore.addChild(this.progressMiddleSprite);
  	  	this.scnExplore.addChild(this.progressLeftSprite);
   	 	this.scnExplore.addChild(this.progressRightSprite);
        this.scnExplore.addChild(this.progressBarLabel);
        this.scnExplore.addChild(this.progressBarCount);

        // Add back to phone gap button if mobile
        if(this.boolMobile) this.scnExplore.addChild(this.backToPG);

		// Add the curtain and everything that should be displayed over it
        this.scnExplore.addChild(this.curtainLayer);
        this.scnExplore.addChild(this.instructionsLabel);
        this.scnExplore.addChild(this.instructionsTextLabel);
	};

	/**
	Cleans up all previous scenes and display explore mode
    @param  {void} Nothing.
	@return {void} Nothing.
	*/
    this.startExplore = function() {
		logDebug("Starting in explore mode");

		// Record the current scene and change to explore mode
    		this.scnLast = this.getCurrentScene();
		this.plugin.setScene(this.scnExplore.getId());

		// Use the internal instruction unless it is empty
		if(this.scnExplore.strInstruction === "") {
			this.questionLabel.setVisibility(false);
		} else {
			this.questionLabel.setVisibility(true);
			this.questionLabel.setText(this.scnExplore.strInstruction);
		}

        	// Set the ready button to be active
		this.submitButton.setActive(false);
		this.answerButton.setActive(false);
		this.readyButton.setActive(true);
		this.exploreButton.setActive(false);

		// Set the ready button to be visible
  	  	this.submitButton.setVisibility(false);
        this.answerButton.setVisibility(false);
        this.readyButton.setVisibility(true);

		// Set the all the status symbols to false
		this.crossSprite.setVisibility(false);
		this.checkSprite.setVisibility(false);
		this.wifiGreenSprite.setVisibility(false);
        this.wifiBlueSprite.setVisibility(false);
		this.wifiGreySprite.setVisibility(false);

		// Run explore mode load function
		if(this.funcExploreInit !== null) {
			this.funcExploreInit();
		}
		this.boolExploring = true;
		this.scnExplore.loadQuiz();
    };

    /**
	Cleans up explore mode and displays the previous scene
    @param  {void} Nothing.
	@return {void} Nothing.
	*/
    this.endExplore = function() {
		logDebug("Exiting explore mode");

		// Set the subbit button to be active
        this.submitButton.setVisibility(true);
		this.answerButton.setVisibility(false);
        this.readyButton.setVisibility(false);

		// Set the subbit button to be visible
		this.submitButton.setActive(true);
		this.answerButton.setActive(false);
		this.readyButton.setActive(false);
		this.exploreButton.setActive(true);

		// Run the clean function for explore mode
		if(this.funcExploreCleanUp !== null) {
			this.funcExploreCleanUp();
		}
		this.boolExploring = false;
		this.scnExplore.cleanUp();

		// Return to the original question
		if(typeof this.scnLast !== 'undefined') this.changeScene(this.scnLast);
    };

    /**
	Get the demo name for this quiz
	@param  {void} Nothing.
	@return {string} Return the demo's name string.
	*/
    this.js_getDemoName = function() {
		return this.demo_name;
	};

	/**
	Set the demo name for this quiz
	@param  {string} passName The new demo's name string.
	@return {void} Nothing.
	*/
    this.js_setDemoName = function(passName) {
		this.demo_name = passName;
	};

    /**
	Gets the number of quizzes in demo
	@param  {void} Nothing.
	@return {number} Returns the number of quizzes in this demo
	*/
    this.js_getNumberOfQuizzes = function() {
		return this.sceneArray.length;
	};

	/**
	Gets the number of quizzes in demo
	@param  {void} Nothing.
	@return {array} Return an array of each question's name.
	*/
    this.js_getQuizNames = function() {
		return this.quizNames;
	};

	/**
	Called by the server when it's confirming it has recieved a submission.
	@param  {string} result1 The name of the question that the server is confirming.
	@param  {string} result2 The server returns "true" or "false" and if sent locally it will be "simulate".
	@return {void} Nothing.
	*/
	this.js_onQuizSubmit = function( result1, result2 ) {
		// Set server status to true
		var intQuiz = parseInt(result1.substr(1), 10) - 1;
		this.sceneArray[intQuiz].serverStatus = true;

		// Clear previous timer
		clearTimeout(this.submissionRetryID);

		if (result2 ==  "Simulate") {
			//  Set wifi to the blue symbol
			this.boolSimulate = true;
		} else {
			//  Set wifi to the green symbol
			this.boolSimulate = false;
		}

		this.drawUI();
	};

    /**
	Once this functions is called it will retry to sent the answer submission to the server every 8 seconds.
	@param  {object} that The reference to this template object instance.
	@return {void} Nothing.
	*/
	this.persistentSubmission = function(that) {
		// Clear previous timer
		clearTimeout(that.submissionRetryID);
		var strQuiz = "Q" + (that.currentScene + 1);

		// If the javascript is not on a remote server then use server simulation
		if (this.boolSimulate)	{
			that.js_onQuizSubmit(strQuiz, "Simulate");
			that.boolSimulate = true;
			return;
		} else {
			submit_demo_quiz_answer(that.demo_name, strQuiz, that.getCurrentScene().getCorrect(), function() { that.js_onQuizSubmit(strQuiz, "THM"); });
			that.boolSimulate = false;
		}

		// Set timer to try sending data again in 8 seconds
		that.submissionRetryID = setTimeout(that.persistentSubmission,8000, that);
		logDebug(that.submissionRetryID + " id: Try submission");

		return;
	};

	return true;
}
