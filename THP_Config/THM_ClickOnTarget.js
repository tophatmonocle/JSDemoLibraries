//------------------------------------------------------------------------------
// The target element built by JSON
function THM_Target (plugin, lyrParent, numTarget, jTarget) {
	this.plugin = plugin;
	this.lyrParent = lyrParent;
	this.numTarget = numTarget;
	this.jTarget = jTarget;
	this.funcClick = undefined;
	this.funcScope = undefined;
	this.bHit = false;

	// Create the Target
	this.create = function() {
		// Read the x,y location the width and height of the target
		this.x = parseInt(readJSON(this.jTarget.x, "target x","0"),10);
		this.y = parseInt(readJSON(this.jTarget.y, "target y","0"),10);
		this.width = parseInt(readJSON(this.jTarget.width, "target width","32"),10);
		this.height = parseInt(readJSON(this.jTarget.height, "target height","32"),10);

		// Read the image names for the 3 target states
		this.strImgEnabled = readJSON(this.jTarget.imageEnabled, "target enabled image","");
		this.strImgDisabled = readJSON(this.jTarget.imageDisabled, "target disabled image","");
		this.strImgHit = readJSON(this.jTarget.imageHit, "target hit image","");

		// Read weather the target should be hit or not to be correct.
		this.correct = readJSON(this.jTarget.correct, "target correctness","false") === "true";

		// The background layer of the target
		this.lyrBG = new Layer(this.plugin, this.x, this.y, this.width, this.height);
		this.lyrBG.setColor(0,0,0,0);

		// Create all the sprites for the target
		this.sprEnabled = new Sprite(this.plugin, mediaURL + slugUUID + this.strImgEnabled, 0, 0, this.width, this.height);
		this.sprEnabled.downCallback(this, "targetClick");
		this.sprDisabled = new Sprite(this.plugin, mediaURL + slugUUID + this.strImgDisabled, 0, 0, this.width, this.height);
		this.sprHit = new Sprite(this.plugin, mediaURL + slugUUID + this.strImgHit, 0, 0, this.width, this.height);

		// If the enabled sprite is not empty add it to the layer
		if(this.strImgEnabled !== "") {
			this.sprEnabled.setVisibility(false);
			this.lyrBG.addChild(this.sprEnabled);
		}

		// If the disabled sprite is not empty add it to the layer
		if(this.strImgDisabled !== "") {
			this.sprDisabled.setVisibility(false);
			this.lyrBG.addChild(this.sprDisabled);
		}

		// If the hit sprite is not empty add it to the layer
		if(this.strImgHit !== "") {
			this.sprHit.setVisibility(false);
			this.lyrBG.addChild(this.sprHit);
		}

		// Add the background layer to the parent layer
		this.lyrParent.addChild(this.lyrBG);
	};

	// The target is clicked callback function
	this.targetClick = function(x,y) {
		this.isClicked(this.numTarget);
	};

	// This callback notifies the demo when a target is clicked
	this.isClicked = function(numObject) {
		if(this.funcClick !== undefined && this.funcScope !== undefined) {
			this.funcClick.apply(this.funcScope, arguments);
		}
	};

	// Subscribe the target and show the enabled sprite
	this.enable = function() {
		this.clear();
		this.sprEnabled.subscribe();
	};

	// Unsubscribe the target and show the disabled sprite
	this.disable = function() {
		this.sprEnabled.setVisibility(false);
		this.sprHit.setVisibility(false);
		this.sprDisabled.setVisibility(true);
		this.sprEnabled.unsubscribe();
	};

	// Show the hit sprite and set the hit boolean
	this.hit = function() {
		this.sprEnabled.setVisibility(false);
		this.sprDisabled.setVisibility(false);
		this.sprHit.setVisibility(true);
		this.bHit = true;
	};

	// Show the enabled sprite and clear the hit boolean
	this.clear = function() {
		this.sprDisabled.setVisibility(false);
		this.sprHit.setVisibility(false);
		this.sprEnabled.setVisibility(true);
		this.bHit = false;
	};

	// Toggle inbetween the hit and enabled sprites
	this.toggle = function() {
		if(this.bHit) {
			this.clear();
		} else {
			this.hit();
		}
	};

	// Show the answer for the this target
	this.showAnswer = function() {
		if(this.correct) {
			this.hit();
		} else {
			this.clear();
		}
	};

	// Check if the hit boolean matchs JSON correct answer
	this.check = function() {
		return this.correct === this.bHit;
	};

	this.create();
}
THM_Target.prototype = new Osmosis();

//------------------------------------------------------------------------------
// The target map style question built by JSON
function THM_ClickOnTargetQuestion (plugin, configuration, thmDemo) {
	// Scene specfic values
	this.plugin = plugin;
	this.thmDemo = thmDemo;
	this.scenes = this.thmDemo.sceneArray;
    this.id = this.plugin.newScene();
    this.strInstruction = readJSON(configuration.text, "configuration text","Question text");
    this.strName = readJSON(configuration.name, "configuration name","untitled");
    this.strInherit = readJSON(configuration.inherit, "configuration inheritence","");

    // Question status flags
    this.tries = 3;
    this.correct = false;
    this.completed = false;
    this.serverStatus = false;

	// Setup the background layer
    this.bgLayer = new Layer(this.plugin, 0, 0, 480, 320);
    this.bgLayer.setColor(0, 0, 0, 0);

	// The shared and current target list
    this.allTargets = [];
    this.currentTargets = [];
    this.last = -1;

    // The callback from an item that's its being dragged
	this.isClicked = function(numTarget) {
		// If single answer mode is on and the last number is valid then clear that target
		if(this.last !== -1 && this.last !== numTarget && !this.multipleAnswers) {
			this.allTargets[this.last].clear();
		}

		// Toggle the selected target
		this.allTargets[numTarget].toggle();

		// Record the is targets number for next time
		this.last = numTarget;
	};

	// Set the initialize function for a target map question
	this.initQuiz = function() {
		logDebug("Click on target map question initQuiz()");
		var i = 0;

		// If no inheritence is specified then create everything from scratch
		if(this.strInherit === "") {
			// Demo layout varibles
			this.layoutX = parseInt(readJSON(configuration.x, "configuration x","20"),10);
			this.layoutY = parseInt(readJSON(configuration.y, "configuration y","20"),10);
			this.layoutWidth = parseInt(readJSON(configuration.width, "configuration width","440"),10);
			this.layoutHeight = parseInt(readJSON(configuration.height, "configuration height","220"),10);

			// The dragable background image for the target
			this.strImage = readJSON(configuration.image, "configuration image","");
			this.intImageWidth = parseInt(readJSON(configuration.image_width, "configuration image width","480"),10);
			this.intImageHeight = parseInt(readJSON(configuration.image_height, "configuration image height","320"),10);

			// If the image is defined then create the sprite
			if(this.strImage !== "") {
				// Create the background sprite
				this.sprImage = new Sprite(this.plugin, mediaURL + slugUUID + this.strImage, 0, 0, this.intImageWidth, this.intImageHeight);

				// Create the layer that drags everything added to it
				this.lyrDrag = new Layer(this.plugin, 0, 0, this.intImageWidth, this.intImageHeight);
				this.lyrDrag.setColor(0,0,0,0);

				// Create the drop down layer that helps control if the drop downs are visiblity
				this.lyrDrop = new Layer(this.plugin, 0, 0, this.intImageWidth, this.intImageHeight);
				this.lyrDrop.setColor(0,0,0,0);

				// If smaller then the defined layout size
				if(this.layoutWidth >= this.intImageWidth && this.layoutHeight >= this.intImageHeight) {
					// Center the target map in the layout
					var pntDrag = new Point();
					pntDrag.x = this.layoutX + (this.layoutWidth * 0.5) - (this.intImageWidth * 0.5);
					pntDrag.y = this.layoutY + (this.layoutHeight * 0.5) - (this.intImageHeight * 0.5);
					this.lyrDrag.setPosition(pntDrag.x, pntDrag.y);
				// If Larger then the defined layout size
				} else {
					// Set the target map to be dragable
					var rectDrag = new Rectangle();
					rectDrag.x = this.layoutWidth - this.intImageWidth;
					rectDrag.y = this.layoutHeight - this.intImageHeight;
					rectDrag.width = this.layoutX + this.intImageWidth - rectDrag.x;
					rectDrag.height = this.layoutY + this.intImageHeight - rectDrag.y;
					this.lyrDrag.setDrag(undefined, undefined, rectDrag);
				}

				// Add everything to the scene
				this.lyrDrag.addChild(this.sprImage);
				this.lyrDrag.addChild(this.lyrDrop);
				this.bgLayer.addChild(this.lyrDrag);

			// If no back ground image is defined then throw an error
			} else {
				logError("Click on target questions require a background image.");
			}
		// If inheritence is specified then reference everything from the define scene
		} else {
			// Look for the parent scene in the scene array
			var parentScene = undefined;
			var parentName = "";
			for (i = 0 ; i < this.scenes.length; i++) {
				parentName = readJSON(this.scenes[i].strName, "inherited name for scene " + i, "");
				if(parentName === this.strInherit) parentScene = i;
			}

			// If a parent scene was found then reference some of the varibles from that scene
			if ( parentScene !== undefined) {
				// Reference the layout from the parent scene
				this.layoutX = parseInt(readJSON(this.scenes[parentScene].layoutX, "parent scene width","20"),10);
				this.layoutY = parseInt(readJSON(this.scenes[parentScene].layoutY, "parent scene height","20"),10);
				this.layoutWidth = parseInt(readJSON(this.scenes[parentScene].layoutWidth, "parent scene width","440"),10);
				this.layoutHeight = parseInt(readJSON(this.scenes[parentScene].layoutHeight, "parent scene height","220"),10);

				// Reference the image from the parent scene
				this.intImageWidth = parseInt(readJSON(this.scenes[parentScene].intImageWidth, "parent scene image width","100"),10);
				this.intImageHeight = parseInt(readJSON(this.scenes[parentScene].intImageHeight, "parent scene image height","100"),10);
				this.strImage = readJSON(this.scenes[parentScene].strImage, "parent scene image","");
				this.sprImage = readJSON(this.scenes[parentScene].sprImage, "parent scene sprite",undefined);

				// If the image was found then add it to this scene
				if(this.strImage !== "") {
					this.lyrDrag = readJSON(this.scenes[parentScene].lyrDrag, "parent scene drag layer","");
					this.lyrDrop = readJSON(this.scenes[parentScene].lyrDrop, "parent scene drop down layer","");
					this.bgLayer.addChild(this.lyrDrag);
				}

				// Refernce the global target list from the parent scene
				this.allTargets = readJSON(this.scenes[parentScene].allTargets, "parent scene targets",[0,0,0]);
			// If no parent scene was for the throw an error
			} else {
				logError("Unable to inherit from the scene " + this.strInherit);
			}
		}

		// Load non-inheritable varibles from the configuration
		this.textHeight = parseInt(readJSON(configuration.text_height, "configuration text height","50"),10);
		this.tweenX = parseInt(readJSON(configuration.tween_x, "configuration tween x position","20"),10);
		this.tweenY = parseInt(readJSON(configuration.tween_y, "configuration tween y position","20"),10);
		this.multipleAnswers = readJSON(configuration.multiple_answers, "configuration targets","false") === "true";
		this.currentTargets = readJSON(configuration.targets, "configuration targets",[0,0,0]);

		// Record the range of the targets for this question
		this.enableFrom = this.allTargets.length;
		this.enableTo = this.allTargets.length + this.currentTargets.length;

		// Add all the targets to the global
		for(i = 0; i < this.currentTargets.length; i++) {
			this.allTargets.push(new THM_Target(this.plugin, this.lyrDrop, this.enableFrom + i, this.currentTargets[i]));
			this.allTargets[this.enableFrom + i].funcClick = this.isClicked;
			this.allTargets[this.enableFrom + i].funcScope = this;
		}

		// Create a semi-transparent rectangle behind the instructions to ease readability
		var rectInstruction = new Primitive(this.plugin, "rectangle", 10, 288 - this.textHeight, 460, this.textHeight);
		rectInstruction.setColor(1.0,1.0,1.0,0.8);
		this.bgLayer.addChild(rectInstruction);
	};

	// Set the display function for a target map question
	this.loadQuiz = function() {
		logDebug("Click on target question loadQuiz()");

		// Allow dragging and tween the background to the define position
		this.lyrDrag.subscribe();
		this.lyrDrag.addTween("x:"+this.tweenX+",y:"+this.tweenY+",time:1");

		// Show the drop down menus
		this.lyrDrop.setVisibility(true);

		// Show the answers for any targets from previous questions
		for(var i = 0; i < this.enableFrom; i++) {
			this.allTargets[i].disable();
		}

		// Enable any targets from this questions
		for(i = this.enableFrom; i < this.enableTo; i++) {
			this.allTargets[i].enable();
		}

		// Disable any targets from future questions
		for(i = this.enableTo; i < this.allTargets.length; i++) {
			this.allTargets[i].disable();
		}

		// Reset the last select target to be -1
		this.last = -1;
	};

	// Set the clean up function for a target map question
	this.cleanUp = function() {
		logDebug("Click on target question cleanUp()");
		// Resize the image to it's original size and unsubscribe it
		this.lyrDrag.unsubscribe();
	};

	// Set the reset function for a target map question
	this.resetQuiz = function() {
		logDebug("Click on target question resetQuiz()");
		this.loadQuiz();
	};

	// Set the show correct answer function for a target map question
	this.showCorrectAnswer = function() {
		logDebug("Click on target question showCorrectAnswer()");
		// Show the answer for all the targets for this question
		for(var i = this.enableFrom; i < this.enableTo; i++) {
			this.allTargets[i].showAnswer();
		}
	};

	// Set the check answer function for a target map question
	this.checkAnswer = function() {
		logDebug("Click on target question checkAnswer()");
		var bResult = true;
		// Check all the targets for this question
		for(var i = this.enableFrom; i < this.enableTo; i++) {
			if(!this.allTargets[i].check()) bResult = false;
		}
		return bResult;
	};

	// Plugin call to add the scene
	this.addScene = function() {
        this.plugin.addScene(this.id);
    };

	// Plugin call to move to the next scene
    this.nextScene = function() {
        this.plugin.nextScene();
    };

	// Plugin call to move to the previous scene
    this.prevScene = function() {
        this.plugin.prevScene();
    };

	// Plugin call to move to the set the scene
    this.setScene = function() {
        this.plugin.setScene(this.getId());
    };

	// Set the number of tries for the question
    this.setTries = function(tries) {
        if(typeof tries !== "number") {
            logError("tries must have a value of type 'number'");
            return;
        }
        this.tries = tries;
    };

	// Decrement the number of tries by one
    this.decrementTries = function() {
        if(!(this.tries === 0)) {
            this.tries = this.tries - 1;
        }
    };

	// Return the number of tries
    this.getTries = function() { return this.tries; };

	// Set the boolean flag of if the question is correct
    this.setCorrect = function(correct) {
        if(typeof correct !== "boolean") {
            logError("correct must have a value of type 'boolean'");
            return;
        }
        this.correct = correct;
        this.completed = true;
    };

	// Return the boolean flag of if the question is correct
    this.getCorrect = function() { return this.correct; };

	// Set the boolean flag of if the question is complete
    this.setCompleted = function(completed) {
        if(typeof completed !== "boolean") {
            logError("completed must have a value of type 'boolean'");
            return;
        }
        this.completed = completed;
    };

	// Return the boolean flag of if the question is complete
    this.getCompleted = function() { return this.completed; };

	// Set the boolean flag of if the server has responded
    this.setServerStatus = function(serverStatus) {
        if(typeof serverStatus !== "boolean") {
            logError("serverStatus must have a value of type 'boolean'");
            return;
        }
        this.serverStatus = serverStatus;
    };

	// Return the boolean flag of if the server has responded
    this.getServerStatus = function() { return this.serverStatus; };
};
THM_ClickOnTargetQuestion.prototype = new Osmosis();
