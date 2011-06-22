//------------------------------------------------------------------------------
// Little wrapper function used to test is the answer is a number
function isNumber (o) {
  return ! isNaN (o-0);
}

//------------------------------------------------------------------------------
// The concept element built by JSON
function THM_Label (plugin, lyrParent, jLabel) {
	this.plugin = plugin;
	this.lyrParent = lyrParent;
	this.jLabel = jLabel;
	this.bDropdown = false;

	// Create the label
	this.create = function() {
		// Read the label details from JSON
		this.x = parseInt(readJSON(this.jLabel.x, "label x","0"), 10);
		this.y = parseInt(readJSON(this.jLabel.y, "label y","0"), 10);
		this.width = parseInt(readJSON(this.jLabel.width, "label width","80"), 10);
		this.height = parseInt(readJSON(this.jLabel.height, "label height","20"), 10);
		this.strAnswer = readJSON(this.jLabel.answer, "label answer","").toLowerCase();
		this.bNumber = isNumber(this.strAnswer);
		this.numTolerance = parseFloat(readJSON(this.jLabel.tolerance, "label tolerance","0"));
		if(this.numTolerance < 0) this.numTolerance *= -1;
		this.arrOptions = readJSON(this.jLabel.options, "label options",[""]);

		// Create the layer for each item
		this.lyrBG = new Layer(this.plugin, this.x, this.y, this.width, 20);
		this.lyrBG.setColor(0,0,0,0);
		this.id = this.lyrBG.id;

		// The color overlay of the drop down
		this.lyrColor = new Layer(this.plugin, 0, -(20 - this.height), this.width, 20);
		this.lyrColor.setColor(0,0,0,0);

		if(this.arrOptions.length > 1) {
			// Create the drop down menu for the label
			this.dd = new DropDown(this.plugin, 0, 0, this.width, this.height);
			this.dd.addOption("Select One");
			this.dd.setDefaultOption("Select One");

			// Set the drop down menu options
			for(var i = 0; i < this.arrOptions.length; i++) {
				this.dd.addOption(this.arrOptions[i]);
			}
			this.bDropdown = true;
		} else {
			this.dd = new TextBox(this.plugin, "", 12, 0, 0, this.width, 20);
			this.bDropdown = false;
		}

		// Put the drop down and overlay on the background layer
		this.lyrBG.addChild(this.dd);
		this.lyrBG.addChild(this.lyrColor);
		this.lyrParent.addChild(this.lyrBG)
	};

	// Subscribe the drop down and clear the color overlay
	this.enable = function() {
		// Subscribe and reset drop down
		this.dd.subscribe();
		if(this.bDropdown) {
			this.dd.setText("Select One");
		} else {
			this.dd.setText("");
		}

		// Move the layer to the front
		this.lyrParent.removeChild(this.lyrBG);
		this.lyrParent.addChild(this.lyrBG);

		// Tween the color overlay to be clear
		this.lyrColor.removeTween();
		this.lyrColor.addTween("red:0,green:0,blue:0,alpha:0,time:1");
	};

	// Unsubscribe the drop down and set a grey color overlay
	this.disable = function() {
		// Unsubscribe and reset drop down
		this.dd.unsubscribe();
		if(this.bDropdown) {
			this.dd.setText("Select One");
		} else {
			this.dd.setText("");
		}

		// Tween the color overlay to be grey
		this.lyrColor.removeTween();
		this.lyrColor.addTween("red:0,green:0,blue:0,alpha:0.33,time:1");
	};

	// Unsubscribe the drop down and set a green color overlay
	this.showAnswer = function() {
		// Unsubscribe and set drop down to show the answer
		this.dd.unsubscribe();
		this.dd.setText(this.strAnswer);

		// Tween the color overlay to be red
		this.lyrColor.removeTween();
		this.lyrColor.addTween("red:0.5,green:1.0,blue:0.45,alpha:0.33,time:1");
	};

	// Check if the drop down is correct and animate the color overlay
	this.check = function() {
		var bResult;

		if(this.bNumber) {
			var tbNum = parseFloat(this.dd.getText());
			var answerNum = parseFloat(this.strAnswer);
			bResult = tbNum >= (answerNum - this.numTolerance) && tbNum <= (answerNum + this.numTolerance);
		} else {
			bResult = this.dd.getText().toLowerCase() === this.strAnswer;
		}

		// Stop and previous tweens and tween the overlay based on the result
		this.lyrColor.removeTween();
		if(bResult) {
			// If correct tween overlay to be green
			this.lyrColor.addTween("red:0.5,green:1.0,blue:0.45,alpha:0.33,time:1");
		} else {
			// If incorrect tween overlay to be red
			this.lyrColor.addTween("red:1.0,green:0.22,blue:0.25,alpha:0.33,time:1");
		}
		// Tween the overlay back to be clear with a 1 second delay
		this.lyrColor.addTween("red:0,green:0,blue:0,alpha:0,delay:1,time:1");
		return bResult;
	};

	this.create();
}
THM_Label.prototype = new Osmosis();

//------------------------------------------------------------------------------
// The label map style question built by JSON
function THM_LabelingQuestion (plugin, configuration, thmDemo) {

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

	// The shared and current label list
    this.allLabels = [];
    this.currentLabels = [];

	// endZoomOut - Trigger when the label map is safe the drag around again.
    this.endZoomOut = function(that) {
		// Show the drop down menus and allow dragging
		that.lyrDrop.setVisibility(true);
		that.lyrDrag.subscribe();

		// Lift up the curtain
		that.thmDemo.hideCurtain();
	}

	// buttonDown - triggers when the user clicks on the change display button
	this.buttonDown = function(x,y) {
		// Toggle the zoom boolean
		this.bZoom = !this.bZoom;

		// If the animation should be a zoom out
		if(this.bZoom) {
			// Figure out the ratio to shrink the image by
			var rectShrink = new Rectangle();
			rectShrink.width = this.layoutWidth / this.intImageWidth;
			rectShrink.height = this.layoutHeight / this.intImageHeight;

			// If the width ratio is smaller the height ratio
			if(rectShrink.width < rectShrink.height) {
				// Use the image width ratio to figure out the new image height
				rectShrink.height = this.intImageHeight * rectShrink.width;
				rectShrink.width = this.layoutWidth;
			// Else the width ratio is bigger the height ratio
			} else {
				// Use the image height ratio to figure out the new image width
				rectShrink.width = this.intImageWidth * rectShrink.height;
				rectShrink.height = this.layoutHeight;
			}

			// Center the image based on the new width and height
			rectShrink.x = this.layoutX + (this.layoutWidth * 0.5) - (rectShrink.width * 0.5);
			rectShrink.y = this.layoutY + (this.layoutHeight * 0.5) - (rectShrink.height * 0.5);

			// Hide the drop downs and disable dragging
			this.lyrDrop.setVisibility(false);
			this.lyrDrag.unsubscribe();

			// Tween the label map to it's new size and location
			this.lyrDrag.addTween("x:"+rectShrink.x+",y:"+rectShrink.y+",time:2");
			this.sprImage.addTween("width:"+rectShrink.width+",height:"+rectShrink.height+",time:2");

			// Show the curtain and delay removing the curtain for 2 seconds
			this.thmDemo.showCurtain();
			setTimeout(function() { this.thmDemo.hideCurtain(); }, 2000);

		// Else the animation should be a zoom in
		} else {
			// Hide the drop downs and disable dragging
			this.lyrDrop.setVisibility(false);
			this.lyrDrag.unsubscribe();

			// Tween the label map to it's original size and location
			this.sprImage.addTween("width:"+this.intImageWidth+",height:"+this.intImageHeight+",time:2");
			this.lyrDrag.addTween("x:"+this.tweenX+",y:"+this.tweenY+",time:2");

			// Show the curtain and delay calling endZoomOut() for 2 seconds
			this.thmDemo.showCurtain();
			setTimeout(this.endZoomOut, 2000, this);
		}
	}

	// Set the initialize function for a label map question
	this.initQuiz = function() {
		logDebug("Concept map question initQuiz()");
		var i = 0;

		// If no inheritence is specified then create everything from scratch
		if(this.strInherit === "") {
			// Demo layout varibles
			this.layoutX = parseInt(readJSON(configuration.x, "configuration x","20"),10);
			this.layoutY = parseInt(readJSON(configuration.y, "configuration y","20"),10);
			this.layoutWidth = parseInt(readJSON(configuration.width, "configuration width","440"),10);
			this.layoutHeight = parseInt(readJSON(configuration.height, "configuration height","220"),10);

			// The dragable background image for the label
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
					// Center the label map in the layout
					var pntDrag = new Point();
					pntDrag.x = this.layoutX + (this.layoutWidth * 0.5) - (this.intImageWidth * 0.5);
					pntDrag.y = this.layoutY + (this.layoutHeight * 0.5) - (this.intImageHeight * 0.5);
					this.lyrDrag.setPosition(pntDrag.x, pntDrag.y);
				// If Larger then the defined layout size
				} else {
					// Set the label map to be dragable
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
				logError("Concept map questions require a background image.");
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

				// Refernce the global label list from the parent scene
				this.allLabels = readJSON(this.scenes[parentScene].allLabels, "parent scene labels",[0,0,0]);
			// If no parent scene was for the throw an error
			} else {
				logError("Unable to inherit from the scene " + this.strInherit);
			}
		}

		// Load non-inheritable varibles from the configuration
		this.textHeight = parseInt(readJSON(configuration.text_height, "configuration text height","50"),10);
		this.tweenX = parseInt(readJSON(configuration.tween_x, "configuration tween x position","20"),10);
		this.tweenY = parseInt(readJSON(configuration.tween_y, "configuration tween y position","20"),10);
		this.currentLabels = readJSON(configuration.labels, "configuration labels",[0,0,0]);

		// Record the range of the labels for this question
		this.enableFrom = this.allLabels.length;
		this.enableTo = this.allLabels.length + this.currentLabels.length;

		// Add all the labels to the global
		for(i = 0; i < this.currentLabels.length; i++) {
			this.allLabels.push(new THM_Label(this.plugin, this.lyrDrop, this.currentLabels[i]));
		}

		// Create and add the zoom button to the answer panel
		this.bButton = false;
		if(this.layoutWidth < this.intImageWidth && this.layoutHeight < this.intImageHeight) {
			this.btnChangeDisplay = new THM_CustomButton(this.plugin, "Zoom", 5, 200, 55, 24);
			this.btnChangeDisplay.setColor(0.2,0.6,0.9,1.0);
			this.btnChangeDisplay.setBorderColor(0.1,0.3,0.6,1.0);
			this.btnChangeDisplay.downCallback(this, "buttonDown");
			this.btnChangeDisplay.unsubscribe();
			this.thmDemo.answerPanelLayer.addChild(this.btnChangeDisplay);
			this.bButton = true;
		}

		// Create a semi-transparent rectangle behind the instructions to ease readability
		var rectInstruction = new Primitive(this.plugin, "rectangle", 10, 288 - this.textHeight, 460, this.textHeight);
		rectInstruction.setColor(1.0,1.0,1.0,0.8);
		this.bgLayer.addChild(rectInstruction);
	};

	// Set the display function for a label map question
	this.loadQuiz = function() {
		logDebug("Concept map question loadQuiz()");

		// Allow dragging and tween the background to the define position
		this.lyrDrag.subscribe();
		this.lyrDrag.addTween("x:"+this.tweenX+",y:"+this.tweenY+",time:1");

		// Show the drop down menus
		this.lyrDrop.setVisibility(true);

		// Show the answers for any labels from previous questions
		for(var i = 0; i < this.enableFrom; i++) {
			this.allLabels[i].showAnswer();
		}

		// Enable any labels from this questions
		for(i = this.enableFrom; i < this.enableTo; i++) {
			this.allLabels[i].enable();
		}

		// Disable any labels from future questions
		for(i = this.enableTo; i < this.allLabels.length; i++) {
			this.allLabels[i].disable();
		}

		//  If the button exist then show it and subscribe it
		if(this.bButton) {
			this.btnChangeDisplay.setVisibility(true);
			this.btnChangeDisplay.subscribe();
		}
	};

	// Set the clean up function for a label map question
	this.cleanUp = function() {
		logDebug("Concept map question cleanUp()");
		// Resize the image to it's original size and unsubscribe it
		this.sprImage.setDimensions(this.intImageWidth, this.intImageHeight);
		this.lyrDrag.unsubscribe();

		//  If the button exist then hide it and unsubscribe it
		if(this.bButton) {
			this.btnChangeDisplay.setVisibility(false);
			this.btnChangeDisplay.unsubscribe();
		}
	};

	// Set the reset function for a label map question
	this.resetQuiz = function() {
		logDebug("Concept map question resetQuiz()");
		this.loadQuiz();
	};

	// Set the show correct answer function for a label map question
	this.showCorrectAnswer = function() {
		logDebug("Concept map question showCorrectAnswer()");
		// Show the answer for all the labels for this question
		for(var i = this.enableFrom; i < this.enableTo; i++) {
			this.allLabels[i].showAnswer();
		}
	};

	// Set the check answer function for a label map question
	this.checkAnswer = function() {
		logDebug("Concept map question checkAnswer()");
		var bResult = true;
		// Check all the labels for this question
		for(var i = this.enableFrom; i < this.enableTo; i++) {
			if(!this.allLabels[i].check()) bResult = false;
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
THM_LabelingQuestion.prototype = new Osmosis();
