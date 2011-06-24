var fastMath;
/**
Creates an arrow from a define start point to the end point.  The end point always has an arrow head.
@class THM_Arrow
@param  {object} plugin The monocleGL plugin object.
@param  {object} lyrParent The layer to add the arrow to.
@return {void} Nothing
*/
function THM_Arrow(plugin, lyrParent) {
	// Setup local varibles
    this.plugin = plugin;
	this.lyrParent = lyrParent;

	// All the important points for drawing the line
	this.pntStart = new Point(0,0);
	this.pntEnd = new Point(0,0);
	this.pntRight = new Point(0,0);
	this.pntLeft = new Point(0,0);

	// The vectors of each line
	this.vecMain = new circleVector(0,0);
	this.vecLeft = new circleVector(0,0);
	this.vecRight = new circleVector(0,0);

	// Arrow presets
	this.numLegLength = 10;
	this.numLegAngle = 135;

	// Create the singleton class for fast math if it hasn't been created before
	if(fastMath === undefined) {
		fastMath = new THM_fastMath();
	}

	/**
	Setup the arrow and add it to the passed parent.  Called internally during creation and only needs to called once.
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.create = function() {
		// Create the 3 lines for the arrow
		this.lineMain = new Line(this.plugin, 0, 0, 0, 0);
		this.lineRight = new Line(this.plugin, 0, 0, 0, 0);
		this.lineLeft = new Line(this.plugin, 0, 0, 0, 0);

		// Add all the lines to the parent layer
		this.lyrParent.addChild(this.lineMain);
		this.lyrParent.addChild(this.lineRight);
		this.lyrParent.addChild(this.lineLeft);
	};

	/**
	Set the start point of the arrow and redraw the arrow.
	@param  {number} x The new x position of the start point for the arrow.
	@param  {number} y The new y position of the start point for the arrow.
	@return {void} Nothing
	*/
	this.setStart = function(x,y) {
		this.pntStart.x = x;
		this.pntStart.y = y;
		this.drawArrow();
	};

	/**
	Set the end point of the arrow and redraw the arrow.
	@param  {number} x The new x position of the end point for the arrow.
	@param  {number} y The new y position of the end point for the arrow.
	@return {void} Nothing
	*/
	this.setEnd = function(x,y) {
		this.pntEnd.x = x;
		this.pntEnd.y = y;
		this.drawArrow();
	};

	/**
	Set the thickness of each of the lines.
	@param  {number} thickness The new thickness of all the lines used to create the arrow.
	@return {void} Nothing
	*/
	this.setThickness = function(thickness) {
		this.lineMain.setThickness(thickness);
		this.lineRight.setThickness(thickness);
		this.lineLeft.setThickness(thickness);
	};

	/**
	Set the color of each of the lines.
	@param  {number} r The new amount of red in the lines (range 0 to 1).
	@param  {number} g The new amount of green in the lines (range 0 to 1).
	@param  {number} b The new amount of blue in the lines (range 0 to 1).
	@param  {number} a The new amount of alpha in the lines (range 0 to 1).
	@return {void} Nothing
	*/
	this.setColor = function(r,g,b,a) {
		this.lineMain.setColor(r,g,b,a);
		this.lineRight.setColor(r,g,b,a);
		this.lineLeft.setColor(r,g,b,a);
	};

	/**
	Set the length of the both arrow legs and redraw the arrow.
	@param  {number} length The new length of the arrow head legs in pixels.
	@return {void} Nothing
	*/
	this.setLegLength = function(length) {
		this.numLegLength = length;
		this.drawArrow();
	};

	/**
	Set the angle of the both arrow legs and redraw the arrow.
	@param  {number} angle The new angle of the arrow head legs in degrees.
	@return {void} Nothing
	*/
	this.setLegAngle = function(angle) {
		this.numLegAngle = angle;
		this.drawArrow();
	};

	/**
	Draw the arrow based on the start and end point.
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.drawArrow = function() {
		// Figure out the vector of the arrow
		this.vecMain.radial = distancePoints(this.pntStart, this.pntEnd);
		this.vecMain.theta = piecewiseArcTan(this.pntStart, this.pntEnd);

		// Set the vector of the right leg
		this.vecRight.radial = this.numLegLength;
		this.vecRight.theta = this.vecMain.theta + this.numLegAngle;

		// Get the point based on the right leg vector and arrow end point
		this.pntRight = fastMath.moveVector2D(this.pntEnd,this.vecRight);

		// Set the vector of the left leg
		this.vecLeft.radial = this.numLegLength;
		this.vecLeft.theta = this.vecMain.theta - this.numLegAngle;

		// Get the point based on the right leg vector and arrow end point
		this.pntLeft = fastMath.moveVector2D(this.pntEnd,this.vecLeft);

		// Set both points of the main line
		this.lineMain.setPosition(this.pntStart.x, this.pntStart.y);
		this.lineMain.setDimensions(this.pntEnd.x, this.pntEnd.y);

		// Set both points of the right leg line
		this.lineRight.setPosition(this.pntEnd.x, this.pntEnd.y);
		this.lineRight.setDimensions(this.pntRight.x, this.pntRight.y);

		// Set both points of the left leg line
		this.lineLeft.setPosition(this.pntEnd.x, this.pntEnd.y);
		this.lineLeft.setDimensions(this.pntLeft.x, this.pntLeft.y);
	};

	// Create the item
	this.create();
}
THM_Object.prototype = new Osmosis();

/**
Figure out the arc tan of two points in degrees without using the slow Math librarys.
@class piecewiseArcTan
@param  {object} pointA The frist point to get the arc tan of.
@param  {object} pointB The second point to get the arc tan of.
@return {number} The angle of the two points passed in.
*/
function piecewiseArcTan(pointA, pointB) {
	// Figure out the x and y deltas
	var dx = pointA.x - pointB.x;
	var dy = pointA.y - pointB.y;

	// Generate the absolute delta values for the line
	var absDx = dx;
	var absDy = dy;
	if (absDx < 0) absDx *= -1;
	if (absDy < 0) absDy *= -1;

	// Holds the resultant answer
	var result = 0;

	// Using the octant that the line is in apply the approperate formula
	if(dx > 0) {
		if(dy > 0) {
			if(absDx < absDy) {
				// Octant 1
				result = 1 + (1 - (absDx/absDy));
			} else {
				// Octant 0
				result = absDy / absDx;
			}
		} else {
			if(absDx > absDy) {
				// Octant 7
				result = 7 + (1 - (absDy / absDx));
			} else {
				// Octant 6
				result = 6 + (absDx / absDy);
			}
		}
	} else {
		if(dy < 0) {
			if(absDx < absDy) {
				// Octant 5
				result = 5 + (1 - (absDx / absDy));
			} else {
				// Octant 4
				result = 4 + (absDy / absDx);
			}
		} else {
			if(absDx > absDy) {
				// Octant 3
				result = 3 + (1 - (absDy / absDx));
			} else {
				// Octant 2
				result = 2 + (absDx / absDy);
			}
		}
	}

	// Scale the result to be between 0-359
	result = 270 - (result * 45);
	if(result < 0) result += 360;

	return result;
}

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
window.buildDemo = buildDemo;/**
The target element built by JSON.
@class THM_Target
@param  {object} plugin The monocleGL plugin object.
@param  {object} lyrParent The layer to add the target to.
@param  {number} numTarget The number of the target, this value will be returned from a callback.
@param  {object} jTarget The JSON configuration for this target.
@return {void} Nothing
*/
function THM_Target (plugin, lyrParent, numTarget, jTarget) {
	this.plugin = plugin;
	this.lyrParent = lyrParent;
	this.numTarget = numTarget;
	this.jTarget = jTarget;
	this.funcClick = undefined;
	this.funcScope = undefined;
	this.bHit = false;

	/**
	Setup the target and add it to the passed parent.  Called internally during creation and only needs to called once.
	@param  {void} Nothing
	@return {void} Nothing
	*/
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

	/**
	The callback that gets triggered whenever user clicks on the target.
	@param  {number} x The x position of the mouse.
	@param  {number} y The y position of the mouse.
	@return {void} Nothing
	*/
	this.targetClick = function(x,y) {
		this.isClicked(this.numTarget);
	};

	/**
	This callback notifies the demo when a target is clicked.
	@param  {number} numObject The value to passed along to the demo.
	@return {void} Nothing
	*/
	this.isClicked = function(numObject) {
		if(this.funcClick !== undefined && this.funcScope !== undefined) {
			this.funcClick.apply(this.funcScope, arguments);
		}
	};

	/**
	Subscribe the target and show the enabled sprite.
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.enable = function() {
		this.clear();
		this.sprEnabled.subscribe();
	};

	/**
	Unsubscribe the target and show the disabled sprite.
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.disable = function() {
		this.sprEnabled.setVisibility(false);
		this.sprHit.setVisibility(false);
		this.sprDisabled.setVisibility(true);
		this.sprEnabled.unsubscribe();
	};

	/**
	Show the hit sprite and set the hit boolean.
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.hit = function() {
		this.sprEnabled.setVisibility(false);
		this.sprDisabled.setVisibility(false);
		this.sprHit.setVisibility(true);
		this.bHit = true;
	};

	/**
	Show the enabled sprite and clear the hit boolean.
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.clear = function() {
		this.sprDisabled.setVisibility(false);
		this.sprHit.setVisibility(false);
		this.sprEnabled.setVisibility(true);
		this.bHit = false;
	};

	/**
	Toggle inbetween the hit and enabled sprites.
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.toggle = function() {
		if(this.bHit) {
			this.clear();
		} else {
			this.hit();
		}
	};

	/**
	Show the answer for the this target.
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.showAnswer = function() {
		if(this.correct) {
			this.hit();
		} else {
			this.clear();
		}
	};

	/**
	Check if the hit boolean matchs JSON correct answer.
	@param  {void} Nothing
	@return {boolean} True if this target is set corectly and false otherwise.
	*/
	this.check = function() {
		return this.correct === this.bHit;
	};

	this.create();
}
THM_Target.prototype = new Osmosis();

/**
The target map style question built by JSON
@class THM_ClickOnTargetQuestion
@param  {object} plugin The monocleGL plugin object.
@param  {object} configuration The JSON configuration for this question.
@param  {object} thmDemo The refernce to the THM_Template object for inheritence.
@return {void} Nothing
*/
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

	/**
	This callback notifies the demo when a target is clicked.
	@param  {number} numTarget The value to passed along to the demo.
	@return {void} Nothing
	*/
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

	/**
	Overload the initialize function for a target map question.
	@param  {void} Nothing
	@return {void} Nothing
	*/
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


	/**
	Overload the display function for a target map question.
	@param  {void} Nothing
	@return {void} Nothing
	*/
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

	/**
	Overload the clean up function for a target map question.
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.cleanUp = function() {
		logDebug("Click on target question cleanUp()");
		// Resize the image to it's original size and unsubscribe it
		this.lyrDrag.unsubscribe();
	};

	/**
	Overload the reset function for a target map question.
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.resetQuiz = function() {
		logDebug("Click on target question resetQuiz()");
		this.loadQuiz();
	};

	/**
	Overload the show correct answer function for a target map question.
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.showCorrectAnswer = function() {
		logDebug("Click on target question showCorrectAnswer()");
		// Show the answer for all the targets for this question
		for(var i = this.enableFrom; i < this.enableTo; i++) {
			this.allTargets[i].showAnswer();
		}
	};

	/**
	Overload the check answer function for a target map question.
	@param  {void} Nothing
	@return {boolean} True if the question is correct and false otherwise.
	*/
	this.checkAnswer = function() {
		logDebug("Click on target question checkAnswer()");
		var bResult = true;
		// Check all the targets for this question
		for(var i = this.enableFrom; i < this.enableTo; i++) {
			if(!this.allTargets[i].check()) bResult = false;
		}
		return bResult;
	};

	/**
	Adds this scene to the plugin.
	@param  {void} Nothing
	@return {void} Nothing
	*/
    this.addScene = function() {
        this.plugin.addScene(this.id);
    };

	/**
	Changes to the next scene in the plugin.
	@param  {void} Nothing
	@return {void} Nothing
	*/
    this.nextScene = function() {
        this.plugin.nextScene();
    };

	/**
	Changes to the previous scene in the plugin.
	@param  {void} Nothing
	@return {void} Nothing
	*/
    this.prevScene = function() {
        this.plugin.prevScene();
    };

	/**
	Sets the current scene to this one.
	@param  {void} Nothing
	@return {void} Nothing
	*/
    this.setScene = function() {
        this.plugin.setScene(this.getId());
    };

	/**
	Sets the number of tries for this scene.
	@param  {number} tries The number of tries for this scene
	@return {void} Nothing
	*/
    this.setTries = function(tries) {
        if(typeof tries !== "number") {
            return;
        }
        this.tries = tries;
    };

	/**
	Decrements the number of tries by one.
	@param  {void} Nothing
	@return {void} Nothing
	*/
    this.decrementTries = function() {
        if(!(this.tries === 0)) {
            this.tries = this.tries - 1;
        }
    };

	/**
	Gets the number of tries for this scene.
	@param  {void} Nothing
	@return {number} The number of tries for this scene
	*/
    this.getTries = function() { return this.tries; };

	/**
	Sets if the scene is correct
	@param  {boolean} correct True if this scene is correct and false otherwise
	@return {void} Nothing
	*/
    this.setCorrect = function(correct) {
        if(typeof correct !== "boolean") {
            logError("correct must have a value of type 'boolean'");
            return;
        }
        this.correct = correct;
        this.completed = true;
    };

	/**
	Gets if the scene is correct
	@param  {void} Nothing
	@return {boolean} True if this scene is correct and false otherwise
	*/
    this.getCorrect = function() { return this.correct; };

	/**
	Sets if the scene is completed
	@param  {boolean} completed True if this scene is completed and false otherwise
	@return {void} Nothing
	*/
    this.setCompleted = function(completed) {
        if(typeof completed !== "boolean") {
            logError("completed must have a value of type 'boolean'");
            return;
        }
        this.completed = completed;
    };

	/**
	Gets if the scene is completed
	@param  {void} Nothing
	@return {boolean} True if this scene is completed and false otherwise
	*/
    this.getCompleted = function() { return this.completed; };

	/**
	Sets if the scene status has been recieved by the server
	@param  {boolean} serverStatus True if this scenes status has been recieved by the server and false otherwise
	@return {void} Nothing
	*/
    this.setServerStatus = function(serverStatus) {
        if(typeof serverStatus !== "boolean") {
            logError("serverStatus must have a value of type 'boolean'");
            return;
        }
        this.serverStatus = serverStatus;
    };

	/**
	Gets if the scene status has been recieved by the server
	@param  {void} Nothing
	@return {boolean} True if this scenes status has been recieved by the server and false otherwise
	*/
    this.getServerStatus = function() { return this.serverStatus; };
}
THM_ClickOnTargetQuestion.prototype = new Osmosis();
/**
Color storage and conversion object.
@class THM_Color
@param  {number} r The new amount of red (range 0 to 1).
@param  {number} g The new amount of green (range 0 to 1).
@param  {number} b The new amount of blue (range 0 to 1).
@param  {number} a The new amount of alpha (range 0 to 1).
@return {void} Nothing
*/
function THM_Color(r, g, b, a) {

	if(r === undefined) { this.r = 0; } else { this.r = r; }
	if(g === undefined) { this.g = 0; } else { this.g = g; }
	if(b === undefined) { this.b = 0; } else { this.b = b; }
	if(a === undefined) { this.a = 0; } else { this.a = a; }

	/**
	Convert a hexdecimal string to openGL color ranges
	@param  {string} strHex A 6 charactor string for 24 bit color or a 8 charactor string for 32 bit color
	@return {void} Nothing
	*/
	this.convertHex = function(strHex) {
		var numHex = parseInt(strHex, 16);

		// Check if the color is 24 or 32 bit
		if(strHex.length === 8) {
			this.r = ((numHex >> 24) & 0xFF) / 0xFF;
			this.g = ((numHex >> 16) & 0xFF) / 0xFF;
			this.b = ((numHex >> 8) & 0xFF) / 0xFF;
			this.a = (numHex & 0xFF) / 0xFF;
		} else {
			this.r = ((numHex >> 16) & 0xFF) / 0xFF;
			this.g = ((numHex >> 8) & 0xFF) / 0xFF;
			this.b = (numHex & 0xFF) / 0xFF;
			this.a = 1.0;
		}
	};

	/**
	Convert from standard color range (0-255) to openGL color range (0-1)
	@param  {number} newR The new amount of red (range 0 to 255).
	@param  {number} newG The new amount of green (range 0 to 255).
	@param  {number} newB The new amount of blue (range 0 to 255).
	@param  {number} newA The new amount of alpha (range 0 to 255).
	@return {void} Nothing
	*/
	this.convertRGBA = function(newR, newG, newB, newA) {
		this.r = newR / 0xFF;
		this.g = newG / 0xFF;
		this.b = newB / 0xFF;
		this.a = newA / 0xFF;
	};

	/**
	No conversion just a direct copy.
	@param  {number} newR The new amount of red (range 0 to 1).
	@param  {number} newG The new amount of green (range 0 to 1).
	@param  {number} newB The new amount of blue (range 0 to 1).
	@param  {number} newA The new amount of alpha (range 0 to 1).
	@return {void} Nothing
	*/
	this.setColor = function(newR, newG, newB, newA) {
		this.r = newR;
		this.g = newG;
		this.b = newB;
		this.a = newA;
	};
}
/**
The relationship element built by JSON
@class THM_Relationship
@param  {object} plugin The monocleGL plugin object.
@param  {object} lyrParent The layer to add the relationship to.
@param  {object} jRelationship The JSON configuration for this relationship.
@return {void} Nothing
*/
function THM_Relationship (plugin, lyrParent, jRelationship) {
	this.plugin = plugin;
	this.lyrParent = lyrParent;
	this.jRelationship = jRelationship;

	/**
	Setup the relationship and add it to the passed parent.  Called internally during creation and only needs to called once.
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.create = function() {
		// Read the relationship details from JSON
		this.x = parseInt(readJSON(this.jRelationship.x, "relationship x","0"), 10);
		this.y = parseInt(readJSON(this.jRelationship.y, "relationship y","0"), 10);
		this.width = parseInt(readJSON(this.jRelationship.width, "relationship width","80"), 10);
		this.height = parseInt(readJSON(this.jRelationship.height, "relationship height","20"), 10);
		this.strAnswer = readJSON(this.jRelationship.answer, "relationship answer","");
		this.arrOptions = readJSON(this.jRelationship.options, "relationship options",[""]);

		// Collect the arrow information
		this.arrow_start_x = parseInt(readJSON(this.jRelationship.arrow_start_x, "relationship arrow start x","0"), 10);
		this.arrow_start_y = parseInt(readJSON(this.jRelationship.arrow_start_y, "relationship arrow start y","0"), 10);
		this.arrow_end_x = parseInt(readJSON(this.jRelationship.arrow_end_x, "relationship arrow end x","0"), 10);
		this.arrow_end_y = parseInt(readJSON(this.jRelationship.arrow_end_y, "relationship arrow end y","0"), 10);
		this.arrow_thickness = parseInt(readJSON(this.jRelationship.arrow_thickness, "relationship arrow thickness","2"), 10);
		this.arrow_color = new THM_Color();
		this.arrow_color.convertHex(readJSON(this.jRelationship.arrow_color, "relationship arrow color","000000"));

		// Create the layer for each item
		this.lyrBG = new Layer(this.plugin, this.x, this.y, this.width, 20);
		this.lyrBG.setColor(0,0,0,0);
		this.id = this.lyrBG.id;

		// If the arrow is not using all of the default positions then create an arrow for this relationship
		if(this.arrow_start_x !== 0 && this.arrow_start_y !== 0 && this.arrow_end_x !== 0 && this.arrow_end_y !== 0) {
			this.arrow = new THM_Arrow(this.plugin, this.lyrParent);
			this.arrow.setStart(this.arrow_start_x, this.arrow_start_y);
			this.arrow.setEnd(this.arrow_end_x, this.arrow_end_y);
			this.arrow.setThickness(this.arrow_thickness);
			this.arrow.setColor(this.arrow_color.r, this.arrow_color.g, this.arrow_color.b, this.arrow_color.a);
		}

		// The color overlay of the drop down
		this.lyrColor = new Layer(this.plugin, 0, -(20 - this.height), this.width, 20);
		this.lyrColor.setColor(0,0,0,0);

		// Create the drop down menu for the relationship
		this.dd = new DropDown(this.plugin, 0, 0, this.width, this.height);
		this.dd.addOption("Select One");
		this.dd.setDefaultOption("Select One");

		// Set the drop down menu options
		for(var i = 0; i < this.arrOptions.length; i++) {
			this.dd.addOption(this.arrOptions[i]);
		}

		// Put the drop down and overlay on the background layer
		this.lyrBG.addChild(this.dd);
		this.lyrBG.addChild(this.lyrColor);
		this.lyrParent.addChild(this.lyrBG)
	};

	/**
	Subscribe the drop down and clear the color overlay.
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.enable = function() {
		// Subscribe and reset drop down
		this.dd.subscribe();
		this.dd.setText("Select One");

		// Move the layer to the front
		this.lyrParent.removeChild(this.lyrBG);
		this.lyrParent.addChild(this.lyrBG);

		// Tween the color overlay to be clear
		this.lyrColor.removeTween();
		this.lyrColor.addTween("red:0,green:0,blue:0,alpha:0,time:1");
	};

	/**
	Unsubscribe the drop down and set a grey color overlay.
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.disable = function() {
		// Unsubscribe and reset drop down
		this.dd.unsubscribe();
		this.dd.setText("Select One");

		// Tween the color overlay to be grey
		this.lyrColor.removeTween();
		this.lyrColor.addTween("red:0,green:0,blue:0,alpha:0.33,time:1");
	};

	/**
	Unsubscribe the drop down and set a green color overlay.
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.showAnswer = function() {
		// Unsubscribe and set drop down to show the answer
		this.dd.unsubscribe();
		this.dd.setText(this.strAnswer);

		// Tween the color overlay to be red
		this.lyrColor.removeTween();
		this.lyrColor.addTween("red:0.5,green:1.0,blue:0.45,alpha:0.33,time:1");
	};

	/**
	Check if the drop down is correct and animate the color overlay.
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.check = function() {
		var bResult = this.dd.getText() === this.strAnswer;

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
THM_Relationship.prototype = new Osmosis();

/**
The background layer with all the concepts and relationships on it for dragging
@class THM_ConceptMap
@param  {object} plugin The monocleGL plugin object.
@param  {object} lyrParent The layer to add the concepts to.
@param  {object} jConcepts The JSON configuration for this concepts.
@return {void} Nothing
*/
function THM_ConceptMap (plugin, parentLayer, jConcepts) {
	this.plugin = plugin;
	this.parentLayer = parentLayer;
	this.jConcepts = jConcepts;
	this.concepts = [];

	/**
	Create the concept map based on the JSON definations.  Called internally during creation and only needs to called once.
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.create = function() {
		var i;

		// Set the region varibles
		this.x = 0;
		this.y = 0;
		this.width = 0;
		this.height = 0;

		// Create a background layer to attached all the objects to
		this.bgLayer = new Layer(this.plugin, this.x, this.y, this.width, this.height);
		this.bgLayer.setColor(0, 0, 0, 0);
		this.id = this.bgLayer.id;

		// Add the background layer to the parent
		this.parentLayer.addChild(this.bgLayer);

		// Add each of the defined objects to the concept map
		var maxX, maxY;
		for(i = 0; i < this.jConcepts.length; i++) {

			// Create the object
			this.concepts[i] = new THM_Object(this.plugin, this.bgLayer, i, this.jConcepts[i]);
			maxX = this.concepts[i].x + this.concepts[i].width;
			maxY = this.concepts[i].y + this.concepts[i].height;

			// If the new object is outside hte current region then update the region
			if(this.width < maxX) this.width = maxX;
			if(this.height < maxY) this.height = maxY;
		}

		// Reset the dimensions to cover the concept map region
		this.bgLayer.setDimensions(this.width,this.height);
	};

	this.create();
}
THM_ConceptMap.prototype = new Osmosis();

/**
The concept map style question built by JSON
@class THM_ConceptMapQuestion
@param  {object} plugin The monocleGL plugin object.
@param  {object} configuration The JSON configuration for this question.
@param  {object} thmDemo The refernce to the THM_Template object for inheritence.
@return {void} Nothing
*/
function THM_ConceptMapQuestion (plugin, configuration, thmDemo) {

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

    // The shared and current relationships list
    this.allRelationships = [];
    this.currentRelationships = [];

	/**
	Overload the initialize function for a concept map question.
	@param  {void} Nothing
	@return {void} Nothing
	*/
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

			// Load all the concepts for this concept map
			this.jConcepts = readJSON(configuration.concepts, "concept map concepts",[]);
			this.cMap = new THM_ConceptMap(this.plugin, this.bgLayer, this.jConcepts);

			// Calculate the drag region for the
			var rectDrag = new Rectangle();
			rectDrag.x = this.layoutWidth - this.cMap.width;
			rectDrag.y = this.layoutHeight - this.cMap.height;
			rectDrag.width = this.layoutX + this.cMap.width - rectDrag.x;
			rectDrag.height = this.layoutY + this.cMap.height - rectDrag.y;

			// Set the concept map to be dragable
			this.cMap.setDraggable(true);
			this.cMap.setDragRegion(rectDrag.x, rectDrag.y, rectDrag.width, rectDrag.height);
		} else {
			// Look for the parent scene in the scene array
			var parentScene = undefined;
			var parentName = "";
			for (i = 0 ; i < this.scenes.length; i++) {
				parentName = readJSON(this.scenes[i].strName, "inherited name for scene " + i, "");
				if(parentName === this.strInherit) parentScene = i;
			}

			// If a parent scene was found then reference some of the varibles from that scene
			if ( parentScene !== undefined ) {
				// Reference the layout from the parent scene
				this.layoutX = parseInt(readJSON(this.scenes[parentScene].layoutX, "parent scene width","20"),10);
				this.layoutY = parseInt(readJSON(this.scenes[parentScene].layoutY, "parent scene height","20"),10);
				this.layoutWidth = parseInt(readJSON(this.scenes[parentScene].layoutWidth, "parent scene width","440"),10);
				this.layoutHeight = parseInt(readJSON(this.scenes[parentScene].layoutHeight, "parent scene height","220"),10);

				// Load the concept map from the parent scene
				this.cMap = readJSON(this.scenes[parentScene].cMap, "parent scene concept map",undefined)
				this.bgLayer.addChild(this.cMap);

				// Refernce the global label list from the parent scene
				this.allRelationships = readJSON(this.scenes[parentScene].allRelationships, "parent scene relationships",[0,0,0]);
			}
		}

		// Load non-inheritable varibles from the configuration
		this.textHeight = parseInt(readJSON(configuration.text_height, "configuration text height","50"),10);
		this.tweenX = parseInt(readJSON(configuration.tween_x, "configuration tween x position","20"),10);
		this.tweenY = parseInt(readJSON(configuration.tween_y, "configuration tween y position","20"),10);
		this.currentRelationships = readJSON(configuration.relationships, "configuration relationships",[0,0,0]);

		// Record the range of the relationships for this question
		this.enableFrom = this.allRelationships.length;
		this.enableTo = this.allRelationships.length + this.currentRelationships.length;

		// Add all the relationships to the global
		for(i = 0; i < this.currentRelationships.length; i++) {
			this.allRelationships.push(new THM_Relationship(this.plugin, this.cMap, this.currentRelationships[i]));
		}

		// Create a semi-transparent rectangle behind the instructions to ease readability
		var rectInstruction = new Primitive(this.plugin, "rectangle", 10, 288 - this.textHeight, 460, this.textHeight);
		rectInstruction.setColor(1.0,1.0,1.0,0.8);
		this.bgLayer.addChild(rectInstruction);
	};

	/**
	Overload the display function for a concept map question.
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.loadQuiz = function() {
		logDebug("Concept map question loadQuiz()");

		// Allow dragging and tween the background to the define position
		this.cMap.subscribe();
		this.cMap.addTween("x:"+this.tweenX+",y:"+this.tweenY+",time:1");

		// Show the answers for any relationships from previous questions
		for(var i = 0; i < this.enableFrom; i++) {
			this.allRelationships[i].showAnswer();
		}

		// Enable any relationships from this questions
		for(i = this.enableFrom; i < this.enableTo; i++) {
			this.allRelationships[i].enable();
		}

		// Disable any relationships from future questions
		for(i = this.enableTo; i < this.allRelationships.length; i++) {
			this.allRelationships[i].disable();
		}
	};

	/**
	Overload the clean up function for a concept map question.
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.cleanUp = function() {
		logDebug("Concept map question cleanUp()");
		this.cMap.unsubscribe();
	};

	/**
	Overload the reset function for a concept map question.
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.resetQuiz = function() {
		logDebug("Concept map question resetQuiz()");
		this.loadQuiz();
	};

	/**
	Overload the show correct answer function for a concept map question.
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.showCorrectAnswer = function() {
		logDebug("Concept map question showCorrectAnswer()");
		// Show the answer for all the labels for this question
		for(var i = this.enableFrom; i < this.enableTo; i++) {
			this.allRelationships[i].showAnswer();
		}
	};

	/**
	Overload the check answer function for a concept map question.
	@param  {void} Nothing
	@return {boolean} True if the question is correct and false otherwise.
	*/
	this.checkAnswer = function() {
		logDebug("Concept map question checkAnswer()");
		var bResult = true;
		// Check all the labels for this question
		for(var i = this.enableFrom; i < this.enableTo; i++) {
			if(!this.allRelationships[i].check()) bResult = false;
		}
		return bResult;
	};

	/**
	Adds this scene to the plugin.
	@param  {void} Nothing
	@return {void} Nothing
	*/
    this.addScene = function() {
        this.plugin.addScene(this.id);
    };

	/**
	Changes to the next scene in the plugin.
	@param  {void} Nothing
	@return {void} Nothing
	*/
    this.nextScene = function() {
        this.plugin.nextScene();
    };

	/**
	Changes to the previous scene in the plugin.
	@param  {void} Nothing
	@return {void} Nothing
	*/
    this.prevScene = function() {
        this.plugin.prevScene();
    };

	/**
	Sets the current scene to this one.
	@param  {void} Nothing
	@return {void} Nothing
	*/
    this.setScene = function() {
        this.plugin.setScene(this.getId());
    };

	/**
	Sets the number of tries for this scene.
	@param  {number} tries The number of tries for this scene
	@return {void} Nothing
	*/
    this.setTries = function(tries) {
        if(typeof tries !== "number") {
            return;
        }
        this.tries = tries;
    };

	/**
	Decrements the number of tries by one.
	@param  {void} Nothing
	@return {void} Nothing
	*/
    this.decrementTries = function() {
        if(!(this.tries === 0)) {
            this.tries = this.tries - 1;
        }
    };

	/**
	Gets the number of tries for this scene.
	@param  {void} Nothing
	@return {number} The number of tries for this scene
	*/
    this.getTries = function() { return this.tries; };

	/**
	Sets if the scene is correct
	@param  {boolean} correct True if this scene is correct and false otherwise
	@return {void} Nothing
	*/
    this.setCorrect = function(correct) {
        if(typeof correct !== "boolean") {
            logError("correct must have a value of type 'boolean'");
            return;
        }
        this.correct = correct;
        this.completed = true;
    };

	/**
	Gets if the scene is correct
	@param  {void} Nothing
	@return {boolean} True if this scene is correct and false otherwise
	*/
    this.getCorrect = function() { return this.correct; };

	/**
	Sets if the scene is completed
	@param  {boolean} completed True if this scene is completed and false otherwise
	@return {void} Nothing
	*/
    this.setCompleted = function(completed) {
        if(typeof completed !== "boolean") {
            logError("completed must have a value of type 'boolean'");
            return;
        }
        this.completed = completed;
    };

	/**
	Gets if the scene is completed
	@param  {void} Nothing
	@return {boolean} True if this scene is completed and false otherwise
	*/
    this.getCompleted = function() { return this.completed; };

	/**
	Sets if the scene status has been recieved by the server
	@param  {boolean} serverStatus True if this scenes status has been recieved by the server and false otherwise
	@return {void} Nothing
	*/
    this.setServerStatus = function(serverStatus) {
        if(typeof serverStatus !== "boolean") {
            logError("serverStatus must have a value of type 'boolean'");
            return;
        }
        this.serverStatus = serverStatus;
    };

	/**
	Gets if the scene status has been recieved by the server
	@param  {void} Nothing
	@return {boolean} True if this scenes status has been recieved by the server and false otherwise
	*/
    this.getServerStatus = function() { return this.serverStatus; };
}
THM_ConceptMapQuestion.prototype = new Osmosis();
/**
A custom button class
@class THM_CustomButton
@param  {object} plugin The monocleGL plugin object.
@param  {string} text The text to display in the button.
@param  {number} x The x position of the button
@param  {number} y The y position of the button
@param  {number} width The width of the button
@param  {number} height The height of the button
@return {void} Nothing
*/
function THM_CustomButton(plugin, text, x, y, width, height){
	this.plugin = plugin;
	this.width = width;
	this.height = height;
	this.x = x;
	this.y = y;
	this.text = text;

	/**
	Setup the custom button and add it to a single layer.  Called internally during creation and only needs to called once.
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.create = function() {
		// Define all the colors
		this.borderCol = new THM_Color(0,0,0,1);
		this.bgCol = new THM_Color(0.5,0.5,0.5,1);
		this.textCol = new THM_Color(0,0,0,1);

		// The main layer
		this.layer = new Layer(this.plugin, this.x, this.y, this.width, this.height);
		this.layer.setColor(0.0,0.0,0.0,0.0);
		this.id = this.layer.getId();

		// Create background
		this.background = new Primitive(this.plugin, "rectangle", 0.0, 0.0, this.width, this.height);
		this.background.setColor(this.bgCol.r, this.bgCol.g, this.bgCol.b, this.bgCol.a);
		this.background.setBorderColor(this.borderCol.r, this.borderCol.g, this.borderCol.b, this.borderCol.a);
		this.background.setBorderWidth(2);
		this.layer.addChild(this.background);

		// Invisible sprite for button actions
		this.inv = new Sprite(this.plugin, "", 0.0, 0.0, this.width, this.height);
		this.inv.setVisibility(false);
		this.inv.subscribe();
		this.layer.addChild(this.inv);

		// Label for the button
		this.label = new Label(this.plugin, this.text, 12, -2, 2, this.width*2, this.height-4);
		this.label.setVisibility(true);
		this.label.setWrap(true);
		this.label.setColor(0,0,0,0);
		this.label.setCaptionColor(this.textCol.r, this.textCol.g, this.textCol.b, this.textCol.a);
		this.layer.addChild(this.label);
	};

	/**
	Sets the buttons border color.
	@param  {number} r The new amount of red (range 0 to 1).
	@param  {number} g The new amount of green (range 0 to 1).
	@param  {number} b The new amount of blue (range 0 to 1).
	@param  {number} a The new amount of alpha (range 0 to 1).
	@return {void} Nothing
	*/
	this.setBorderColor = function(r, g, b, a){
		this.borderCol.setColor(r, g, b, a);
		this.background.setBorderColor(r, g, b, a);
	};

	/**
	Sets the buttons background color.
	@param  {number} r The new amount of red (range 0 to 1).
	@param  {number} g The new amount of green (range 0 to 1).
	@param  {number} b The new amount of blue (range 0 to 1).
	@param  {number} a The new amount of alpha (range 0 to 1).
	@return {void} Nothing
	*/
	this.setColor = function(r, g, b, a){
		this.bgCol.setColor(r, g, b, a);
		this.background.setColor(r, g, b, a);
	};

	/**
	Sets the buttons text caption color.
	@param  {number} r The new amount of red (range 0 to 1).
	@param  {number} g The new amount of green (range 0 to 1).
	@param  {number} b The new amount of blue (range 0 to 1).
	@param  {number} a The new amount of alpha (range 0 to 1).
	@return {void} Nothing
	*/
	this.setCaptionColor = function(r, g, b, a){
		this.textColor.setColor(r, g, b, a);
		this.label.setCaptionColor(r, g, b, a);
	};

	/**
	Add a callback to be triggered whenever the invisible sprite has the mouse click up on it.
	@param  {object} obj The object for JavaScript to call the callback on.
	@param  {string} func The name of the function to call when a callback occurs.
	@return {void} Nothing
	*/
	this.upCallback = function(object, func){
		this.inv.upCallback(object, func);
	};

	/**
	Add a callback to be triggered whenever the invisible sprite has the mouse click down on it.
	@param  {object} obj The object for JavaScript to call the callback on.
	@param  {string} func The name of the function to call when a callback occurs.
	@return {void} Nothing
	*/
	this.downCallback = function(object, func){
		this.inv.downCallback(object, func);
	};

	/**
	Sets the string that will be displayed in the label.
	@param  {string} text The string to be displayed inside label.
	@return {void} Nothing
	*/
	this.setText = function(text){
		this.text = text;
		this.label.setText(this.text);
	};

	/**
	Notifies the plugin that the invisible sprite wants to recieve events.
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.subscribe = function(){
		this.inv.subscribe();
	};

	/**
	Notifies the plugin that the invisible sprite does NOT want to recieve events.
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.unsubscribe = function(){
		this.inv.unsubscribe();
	};

	this.create();
}
THM_CustomButton.prototype = new Osmosis();
//------------------------------------------------------------------------------
//

/**
Safely read JSON objects within a browser with out stopping on error
@class readJSON
@param  {object} jObject The JSON variable we are trying to read.
@param  {string} strType The text to display when jObject is undefined.
@param  {object} objDefault The default variable to return when jObject is undefined.
@return {object} Returns the value of jObject if defined or objDefault when jObject is undefined.
*/
function readJSON(jObject, strType, objDefault) {
	var strError = "";
	var rObject = null;

	// Check if an error message was defined
	if(strType == undefined) {
		strError = "undefined error";
	} else {
		strError = strType;
	}

	// Check if JSON object exists before reading it
	if(jObject === undefined) {
		logError("WARNING could not read JSON " + strError);
		rObject = objDefault;
	} else {
		rObject = jObject;
	}

	// Return the JSON object value or an error message
	return rObject;
}
/**
Little wrapper function used to test is the answer is a number
@class isNumber
@param  {object} o The object to test if it's a number.
@return {boolean} True if is a number and false otherwise.
*/
function isNumber (o) {
  return ! isNaN (o-0);
}

/**
A custom button class
@class THM_Label
@param  {object} plugin The monocleGL plugin object.
@param  {object} lyrParent The parent layer to add this label to.
@param  {object} jLabel The JSON definetion of the label.
@return {void} Nothing
*/
function THM_Label (plugin, lyrParent, jLabel) {
	this.plugin = plugin;
	this.lyrParent = lyrParent;
	this.jLabel = jLabel;
	this.bDropdown = false;

	/**
	Setup the textbox / drop down and add it to a single layer.  Called internally during creation and only needs to called once.
	@param  {void} Nothing
	@return {void} Nothing
	*/
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

	/**
	Subscribe the drop down and clear the color overlay.
	@param  {void} Nothing
	@return {void} Nothing
	*/
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

	/**
	Unsubscribe the drop down and set a grey color overlay.
	@param  {void} Nothing
	@return {void} Nothing
	*/
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

	/**
	Unsubscribe the drop down and set a green color overlay.
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.showAnswer = function() {
		// Unsubscribe and set drop down to show the answer
		this.dd.unsubscribe();
		this.dd.setText(this.strAnswer);

		// Tween the color overlay to be red
		this.lyrColor.removeTween();
		this.lyrColor.addTween("red:0.5,green:1.0,blue:0.45,alpha:0.33,time:1");
	};

	/**
	Check if the drop down is correct and animate the color overlay.
	@param  {void} Nothing
	@return {boolean} True is the user answered this label correctly otherwise false.
	*/
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

/**
The label map style question built by JSON
@class THM_LabelingQuestion
@param  {object} plugin The monocleGL plugin object.
@param  {object} configuration The JSON definetion of this question.
@param  {object} thmDemo The refernce to this demo.
@return {void} Nothing
*/
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

    /**
	Trigger when the label map is safe the drag around again.
	@param  {object} that To protect the scope that is this.  Confusing?  Blame javascript.
	@return {void} Nothing
	*/
    this.endZoomOut = function(that) {
		// Show the drop down menus and allow dragging
		that.lyrDrop.setVisibility(true);
		that.lyrDrag.subscribe();

		// Lift up the curtain
		that.thmDemo.hideCurtain();
	}

	/**
	Triggers when the user clicks on the change display button.
	@param  {number} x The x position of the mouse.
	@param  {number} y The y position of the mouse.
	@return {void} Nothing
	*/
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

	/**
	Overload the initialize function for a label map question.
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.initQuiz = function() {
		logDebug("Label map question initQuiz()");
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

	/**
	Overload the display function for a label map question.
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.loadQuiz = function() {
		logDebug("Label map question loadQuiz()");

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

	/**
	Overload the clean up function for a label map question.
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.cleanUp = function() {
		logDebug("Label map question cleanUp()");
		// Resize the image to it's original size and unsubscribe it
		this.sprImage.setDimensions(this.intImageWidth, this.intImageHeight);
		this.lyrDrag.unsubscribe();

		//  If the button exist then hide it and unsubscribe it
		if(this.bButton) {
			this.btnChangeDisplay.setVisibility(false);
			this.btnChangeDisplay.unsubscribe();
		}
	};

	/**
	Overload the reset function for a label map question.
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.resetQuiz = function() {
		logDebug("Label map question resetQuiz()");
		this.loadQuiz();
	};

	/**
	Overload the show correct answer function for a label map question.
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.showCorrectAnswer = function() {
		logDebug("Label map question showCorrectAnswer()");
		// Show the answer for all the labels for this question
		for(var i = this.enableFrom; i < this.enableTo; i++) {
			this.allLabels[i].showAnswer();
		}
	};

	/**
	Overload the check answer function for a label map question.
	@param  {void} Nothing
	@return {boolean} True if the question is correct and false otherwise.
	*/
	this.checkAnswer = function() {
		logDebug("Label map question checkAnswer()");
		var bResult = true;
		// Check all the labels for this question
		for(var i = this.enableFrom; i < this.enableTo; i++) {
			if(!this.allLabels[i].check()) bResult = false;
		}
		return bResult;
	};

	/**
	Adds this scene to the plugin.
	@param  {void} Nothing
	@return {void} Nothing
	*/
    this.addScene = function() {
        this.plugin.addScene(this.id);
    };

	/**
	Changes to the next scene in the plugin.
	@param  {void} Nothing
	@return {void} Nothing
	*/
    this.nextScene = function() {
        this.plugin.nextScene();
    };

	/**
	Changes to the previous scene in the plugin.
	@param  {void} Nothing
	@return {void} Nothing
	*/
    this.prevScene = function() {
        this.plugin.prevScene();
    };

	/**
	Sets the current scene to this one.
	@param  {void} Nothing
	@return {void} Nothing
	*/
    this.setScene = function() {
        this.plugin.setScene(this.getId());
    };

	/**
	Sets the number of tries for this scene.
	@param  {number} tries The number of tries for this scene
	@return {void} Nothing
	*/
    this.setTries = function(tries) {
        if(typeof tries !== "number") {
            return;
        }
        this.tries = tries;
    };

	/**
	Decrements the number of tries by one.
	@param  {void} Nothing
	@return {void} Nothing
	*/
    this.decrementTries = function() {
        if(!(this.tries === 0)) {
            this.tries = this.tries - 1;
        }
    };

	/**
	Gets the number of tries for this scene.
	@param  {void} Nothing
	@return {number} The number of tries for this scene
	*/
    this.getTries = function() { return this.tries; };

	/**
	Sets if the scene is correct
	@param  {boolean} correct True if this scene is correct and false otherwise
	@return {void} Nothing
	*/
    this.setCorrect = function(correct) {
        if(typeof correct !== "boolean") {
            logError("correct must have a value of type 'boolean'");
            return;
        }
        this.correct = correct;
        this.completed = true;
    };

	/**
	Gets if the scene is correct
	@param  {void} Nothing
	@return {boolean} True if this scene is correct and false otherwise
	*/
    this.getCorrect = function() { return this.correct; };

	/**
	Sets if the scene is completed
	@param  {boolean} completed True if this scene is completed and false otherwise
	@return {void} Nothing
	*/
    this.setCompleted = function(completed) {
        if(typeof completed !== "boolean") {
            logError("completed must have a value of type 'boolean'");
            return;
        }
        this.completed = completed;
    };

	/**
	Gets if the scene is completed
	@param  {void} Nothing
	@return {boolean} True if this scene is completed and false otherwise
	*/
    this.getCompleted = function() { return this.completed; };

	/**
	Sets if the scene status has been recieved by the server
	@param  {boolean} serverStatus True if this scenes status has been recieved by the server and false otherwise
	@return {void} Nothing
	*/
    this.setServerStatus = function(serverStatus) {
        if(typeof serverStatus !== "boolean") {
            logError("serverStatus must have a value of type 'boolean'");
            return;
        }
        this.serverStatus = serverStatus;
    };

	/**
	Gets if the scene status has been recieved by the server
	@param  {void} Nothing
	@return {boolean} True if this scenes status has been recieved by the server and false otherwise
	*/
    this.getServerStatus = function() { return this.serverStatus; };
}
THM_LabelingQuestion.prototype = new Osmosis();
/**
A single match link pair
@class THM_Match
@param  {object} referenceA The match objects frist part of the pair.
@param  {object} referenceB The match objects second part of the pair.
@return {void} Nothing
*/
function THM_Match(referenceA, referenceB) {
	this.referenceA = referenceA;
	this.referenceB = referenceB;
}

/**
The match maker handle the logic to creating and removing connections.
@class THM_MatchMaker
@param  {object} plugin The monocleGL plugin object.
@param  {object} lyrParent The parent layer to add these matches too.
@param  {object} arrObjects The array of the JSON definetions of all the matches.
@param  {number} lines The maximum number of lines needed for this question.
@param  {string} connectionColor The color to change the lines to once they have be connected.
@return {void} Nothing
*/
function THM_MatchMaker(plugin, lyrParent, arrObjects, lines, connectionColor) {
	this.plugin = plugin;
	this.lines = lines;
	this.lyrParent = lyrParent;
	this.arrObjects = arrObjects;
	this.connectionColor = connectionColor;
	this.arrPairs = [];
	this.arrConnections = [];

	/**
	Creates the layer and all the required connection lines.  Called internally during creation and only needs to called once.
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.create = function() {

		// Create a background layer for all the lines
		this.bgLayer = new Layer(this.plugin, 0, 0, 480, 320);
		this.bgLayer.setColor(0,0,0,0);
		this.lyrParent.addChild(this.bgLayer);

		// Create the total number of connections based on the smaller group
		for(var i = 0; i < this.lines; i++) {
			// Create the line for the connection
			this.arrConnections.push(new Line(this.plugin, 0, 0, 480, 320));
			this.arrConnections[i].setColor(this.connectionColor.r, this.connectionColor.g, this.connectionColor.b, this.connectionColor.a);
			this.arrConnections[i].setVisibility(false);
			this.arrConnections[i].setThickness(5);

			// Append an in use varible and two reference varibles
			this.arrConnections[i].inUse = false;
			this.arrConnections[i].referenceA = -1;
			this.arrConnections[i].referenceB = -1;

			// Add the line to the layer
			this.bgLayer.addChild(this.arrConnections[i]);
		}
	};

	/**
	Add a pair by the string and link them to actual objects.
	@param  {string} strRefA The match objects frist part of the pair.
	@param  {string} strRefB The match objects second part of the pair.
	@return {void} Nothing
	*/
	this.addPair = function(strRefA, strRefB) {
		var referenceA = undefined;
		var referenceB = undefined;

		// Look for the matching numerical references
		for(var i = 0 ; i < this.arrObjects.length; i++) {
			if(this.arrObjects[i].name === strRefA) {
				referenceA = i;
			}
			if(this.arrObjects[i].name === strRefB) {
				referenceB = i;
			}
		}

		// If no matches where found throw an error
		if(referenceA === undefined || referenceB === undefined) {
			logError("Linking Error, unable to match the pairs " + strRefA + " and " + strRefB + " together");
		// If both matches where found the add the pair to the list
		} else {
			this.arrPairs.push(new THM_Match(referenceA, referenceB))
		}

	};

	/**
	Clear previous answers and link the correct answers.
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.showAnswers = function() {
		// Clear previous connections
		this.resetConnections();
		for ( var i = 0; i < this.arrPairs.length; i++) {
			// Add the correct conection and animate green
			this.addConnection(this.arrPairs[i].referenceA, this.arrPairs[i].referenceB);
			this.arrObjects[this.arrPairs[i].referenceA].showCorrect(true);
			this.arrObjects[this.arrPairs[i].referenceB].showCorrect(true);
		}
	};

	/**
	Check all the connections and return if correct or not.
	@param  {void} Nothing
	@return {boolean} True if all thematches are correct and false otherwise.
	*/
	this.checkAnswers = function() {
		var count = 0;
		var bResult = false;

		// Go through each in use connection
		for(var i = 0; i < this.arrConnections.length; i++) {
			if(this.arrConnections[i].inUse) {

				// Compare each connection to the answer pairs
				bResult = false;
				for( var j = 0; j <	this.arrPairs.length; j++) {
					if((this.arrConnections[i].referenceA === this.arrPairs[j].referenceA &&
					   this.arrConnections[i].referenceB === this.arrPairs[j].referenceB) ||
					   (this.arrConnections[i].referenceB === this.arrPairs[j].referenceA &&
					   this.arrConnections[i].referenceA === this.arrPairs[j].referenceB) ) {
						bResult = true;
					}
				}

				// If the connection is correct animate green and increment the counter
				if(bResult) {
					count++;
					this.arrObjects[this.arrConnections[i].referenceA].showCorrect(true);
					this.arrObjects[this.arrConnections[i].referenceB].showCorrect(true);

				// If the connection is incorrect animate red
				} else {
					this.arrObjects[this.arrConnections[i].referenceA].showCorrect(false);
					this.arrObjects[this.arrConnections[i].referenceB].showCorrect(false);
				}
			}
		}

		// If the counter matches the number of connections return true other wise return false
		return count === this.arrConnections.length;
	};

	/**
	Clear previous answers and link the correct answers.
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.resetConnections = function() {
		for( var i = 0; i < this.arrObjects.length; i++) {
			this.removeConnection(i, false);
		}
	};

	/**
	Remove a connection based on one of the object references
	@param  {number} index The index number of the matchs to remove.
	@param  {boolean} bAnimate If true then animated the color change other just do it.
	@return {void} Nothing
	*/
	this.removeConnection = function(index, bAnimate) {
		// Go though each connection
		for(var i = 0; i < this.arrConnections.length; i++) {
			// Remove the connection if it's in use and one the renfernces match the index
			if(this.arrConnections[i].inUse &&
			  (this.arrConnections[i].referenceA === index ||
			   this.arrConnections[i].referenceB === index) ) {
				// Set all the status flags to be false
				this.arrConnections[i].inUse = false;
				this.arrObjects[this.arrConnections[i].referenceA].selected = false;
				this.arrObjects[this.arrConnections[i].referenceB].selected = false;

				// Animate to is original color if bAnimate is true
				if(bAnimate) {
					this.arrObjects[this.arrConnections[i].referenceA].originalTween(1.0, 0.0);
					this.arrObjects[this.arrConnections[i].referenceB].originalTween(1.0, 0.0);
				}
				// Reset the references and make the line invisible
				this.arrConnections[i].referenceA = -1;
				this.arrConnections[i].referenceB = -1;
				this.arrConnections[i].setVisibility(false);

				// Break out of this loop
				break;
			}
		}
	};

	/**
	Add connection and color the object as disabled for visual cue
	@param  {number} indexA The index number of the first match.
	@param  {number} indexB The index number of the first match.
	@param  {string} disabledColor The color to change the matching line to.
	@return {void} Nothing
	*/
	this.addConnection = function(indexA, indexB, disabledColor) {
		// If both indexes are valid
		if(indexA >= 0 && indexB >= 0) {
			// Remove a previous connection if exists on idnex A
			if( this.arrObjects[indexA].selected ) {
				this.removeConnection(indexA, true);
			}
			// Remove a previous connection if exists on idnex A
			if( this.arrObjects[indexB].selected ) {
				this.removeConnection(indexB, true);
			}

			// Set the two objects to be selected
			this.arrObjects[indexA].selected = true;
			this.arrObjects[indexB].selected = true;

			// Go through each connection
			for(var i = 0; i < this.arrConnections.length; i++) {
				// If the connection is free to be used
				if(!this.arrConnections[i].inUse) {
					// Set the connection to be in use
					this.arrConnections[i].inUse = true;

					// Record the indexes as references
					this.arrConnections[i].referenceA = indexA;
					this.arrConnections[i].referenceB = indexB;

					// If the disabledColor was defined then tween both objects to be that color
					if(disabledColor !== undefined) {
						this.arrObjects[indexA].colorTween(disabledColor.r, disabledColor.g, disabledColor.b, disabledColor.a, 1.0, 0.0);
						this.arrObjects[indexB].colorTween(disabledColor.r, disabledColor.g, disabledColor.b, disabledColor.a, 1.0, 0.0);
					}

					// Draw the connection line inbtween the two anchors and make the line visible
					this.arrConnections[i].setPosition(this.arrObjects[indexA].anchorX, this.arrObjects[indexA].anchorY);
					this.arrConnections[i].setDimensions(this.arrObjects[indexB].anchorX, this.arrObjects[indexB].anchorY);
					this.arrConnections[i].setVisibility(true);

					// Break out of this loop
					break;
				}
			}
		}
	};

	this.create();
}
THM_MatchMaker.prototype = new Osmosis();


/**
The matching line the updates as the user drags around the screen.
@class THM_MatchMaker
@param  {object} plugin The monocleGL plugin object.
@param  {object} lyrParent The parent layer to add these matches too.
@param  {string} overlayColor The color of tthe overlay line that gets dragged.
@return {void} Nothing
*/
function THM_MatchingLine(plugin, lyrParent, overlayColor) {
	this.plugin = plugin;
	this.lyrParent = lyrParent;
	this.overlayColor = overlayColor;
	this.funcDrag = undefined;
	this.funcScope = undefined;
	this.arrRects = [];

	/**
	Creates the layer and the draggable line.  Called internally during creation and only needs to called once.
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.create = function() {

		// Set the line to by accross the screen so it triggers no matter where the mouse is
		this.dragLine = new Line(this.plugin, 0, 0, 480, 320);
		this.dragLine.setColor(this.overlayColor.r, this.overlayColor.g, this.overlayColor.b, this.overlayColor.a);
		this.dragLine.setThickness(5);
		this.dragLine.setVisibility(false);

		// Set the line to be draggable accross the whole screen
		this.dragLine.setDrag();
		this.dragLine.setDragRegion(0, 0, 480, 320);
		this.dragLine.addDragStartCallback(this, "startDrag");
		this.dragLine.addDropCallback(this, "stopDrag");
		this.dragLine.unsubscribe();

		// Add to the parent
		this.lyrParent.addChild(this.dragLine);
	};

	/**
	Add a objects rectangle to the list for checking where the mouse is.
	@param  {number} num The index number of this rectangle.
	@param  {number} x The x position of the rectangle
	@param  {number} y The y position of the rectangle
	@param  {number} width The width of the rectangle
	@param  {number} height The height of the rectangle
	@return {void} Nothing
	*/
	this.addRect = function(num, x, y, width, height) {
		this.arrRects[num] = new Rectangle(x, y, width, height);
	};

	/**
	Triggered when the user start dragging figure out if the mouse is over an object.
	@param  {number} x The x position of the mouse.
	@param  {number} y The y position of the mouse.
	@return {void} Nothing
	*/
	this.startDrag = function(x,y) {
		var pntMouse = new Point(x,y);

		// Go through each object rectangle and if the mouse inside then notify the question
		for(var i = 0; i < this.arrRects.length; i++) {
			if(this.arrRects[i].containsPoint(pntMouse)) {
				this.isDragging(i, true);
				break;
			}
		}
	};

	/**
	Triggered when the user stops dragging figure.
	@param  {number} x The x position of the mouse.
	@param  {number} y The y position of the mouse.
	@return {void} Nothing
	*/
	this.stopDrag = function(x,y) {
		var pntMouse = new Point(x,y);

		// Go through each object rectangle and if the mouse inside then notify the question
		for(var i = 0; i < this.arrRects.length; i++) {
			if(this.arrRects[i].containsPoint(pntMouse)) {
				this.isDragging(i, false);
			}
		}
	};

	/**
	This callback notifies the question when the line is being dragging.
	@param  {number} numObject The index of the object clicked on.
	@param  {number} bDragging True if the mouse is down and false otherwise.
	@return {void} Nothing
	*/
	this.isDragging = function(numObject, bDragging) {
		if(this.funcDrag !== undefined && this.funcScope !== undefined) {
			this.funcDrag.apply(this.funcScope, arguments);
		}
	};

	/**
	Shortcut to subscribe the draggble line.
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.subscribe = function() {
		this.dragLine.subscribe();
	};

	/**
	Shortcut to unsubscribe the draggble line.
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.unsubscribe = function() {
		this.dragLine.unsubscribe();
	};

	this.create();
}

/**
The matching style question built by JSON
@class THM_MatchingQuestion
@param  {object} plugin The monocleGL plugin object.
@param  {object} configuration The JSON definetion of this question.
@return {void} Nothing
*/
function THM_MatchingQuestion (plugin, configuration) {

	// Scene specfic values
	this.plugin = plugin;
    this.id = this.plugin.newScene();
    this.strInstruction = readJSON(configuration.text, "configuration text","Question text");
   	this.strImage = readJSON(configuration.image, "configuration image","");

    // Question status flags
    this.tries = 3;
    this.correct = false;
    this.completed = false;
    this.serverStatus = false;

	// Setup the background layer
    this.bgLayer = new Layer(this.plugin, 0, 0, 480, 320);
    this.bgLayer.setColor(0, 0, 0, 0);

	// Get the layout information
	this.strLayout = readJSON(configuration.layout, "configuration layout","vertical").toLowerCase();
	this.layout = this.strLayout === "vertical";
	this.layoutX = parseInt(readJSON(configuration.x, "configuration x","20"),10);
	this.layoutY = parseInt(readJSON(configuration.y, "configuration y","20"),10);
	this.layoutWidth = parseInt(readJSON(configuration.width, "configuration width","440"),10);
	this.layoutHeight = parseInt(readJSON(configuration.height, "configuration height","220"),10);

	// Get the colors use in this question
	this.disabledColor = new THM_Color();
	this.overlayColor = new THM_Color();
	this.connectionColor = new THM_Color();
	this.disabledColor.convertHex(readJSON(configuration.disabled_color, "configuration disabled color","c0c0c0"));
	this.overlayColor.convertHex(readJSON(configuration.overlay_color, "configuration overlay color","00000080"));
	this.connectionColor.convertHex(readJSON(configuration.connection_color, "configuration connection color","000000a0"));

	// The local variables
	this.arrObjects = [];
	this.numLast = -1;
	this.matchMaker;

	/**
	The callback from an item that's its being dragged.
	@param  {number} numObject The index of the object clicked on.
	@param  {number} bDragging True if the mouse is down and false otherwise.
	@return {void} Nothing
	*/
	this.isDragging = function(numObject, bDragging) {
		this.numObject = numObject;
		this.bIsDragging = bDragging;

		// If the line has finish been dragged then make/break connections
		if(!this.bIsDragging) {
			// If the last and current objects are the same then remove the connection
			if(this.numObject === this.numLast) {
				this.matchMaker.removeConnection(this.numObject, true);
			// If the objects are NOT in the same row create a connect
			} else if( (this.numObject < this.groupA.length && this.numLast >= this.groupA.length) ||
			    (this.numObject >= this.groupA.length && this.numLast < this.groupA.length) ) {
				this.matchMaker.addConnection(this.numLast,this.numObject,this.disabledColor);
			}
			// Clear the last number
			this.numLast = -1;

		// If the line has start been dragged then record the the current item
		} else {
			this.numLast = this.numObject;
		}
	};

	/**
	Overload the initialize function for a matching question.
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.initQuiz = function() {
		logDebug("Matching question initQuiz()");
		var i = 0;

		// Setup the background image
		if(this.strImage !== "") {
			this.sprImage = new Sprite(this.plugin, mediaURL + slugUUID + this.strImage, 0, 0, 480, 320);
			this.bgLayer.addChild(this.sprImage);
		}

		// Read the JSON for groupA and groupB
		this.groupA = readJSON(configuration.group_a, "configuration matching group a",[]);
		this.groupB = readJSON(configuration.group_b, "configuration matching group b",[]);

		// Local temporary varibles for randomization
		var swap = 0;
		var randomize = 0;
		var reorderA = [];
		var reorderB = [];
		var loopBreaker = 0;
		var bRandomA = false;
		var bRandomB = false;
		var bRandomBoth = false;

		// Setup array for the random group A order
		for(i = 0; i < this.groupA.length; i++ ) {
			reorderA[i] = i;
		}

		// Setup array for the random group B order
		for(i = 0; i < this.groupB.length; i++ ) {
			reorderB[i] = i;
		}

		// Continue to loop until the order is random
		while(!bRandomA && !bRandomB && !bRandomBoth) {
			// If for whatever reason we can't randomize then log error and break out
			if(++loopBreaker > 10) {
				logError("ERROR can't randomize objects, continuing with setup");
				break;
			}

			// Go through the group A list and reorder the list
			for(i = 0; i < this.groupA.length; i++ ) {
				randomize = parseInt(Math.random() * this.groupA.length, 10);
				swap = reorderA[i];
				reorderA[i] = reorderA[randomize];
				reorderA[randomize] = swap;
			}

			// Go through the group B list and reorder the list
			for(i = 0; i < this.groupB.length; i++ ) {
				randomize = parseInt(Math.random() * this.groupB.length, 10);
				swap = reorderB[i];
				reorderB[i] = reorderB[randomize];
				reorderB[randomize] = swap;
			}

			// Check that the new order of group A is truely random
			bRandomA = false;
			for(i = 0; i < this.groupA.length; i++ ) {
				if(reorderA[i] !== i) bRandomA = true;
			}

			// Check that the new order of group B is truely random
			bRandomB = false;
			for(i = 0; i < this.groupB.length; i++ ) {
				if(reorderB[i] !== i) bRandomB = true;
			}

			// Check that the new order of group A & B don't match
			bRandomBoth = false;
			for(i = 0; i < this.groupB.length; i++ ) {
				if(reorderA[i] !== reorderB[i]) bRandomBoth = true;
			}
		}

		// Create all of the objects for group A
		for(i = 0; i < this.groupA.length; i++) {
			this.arrObjects.push(new THM_Object(this.plugin, this.bgLayer, i, this.groupA[reorderA[i]]));
		}

		// Create all of the objects for group B
		for(i = 0; i < this.groupB.length; i++) {
			this.arrObjects.push(new THM_Object(this.plugin, this.bgLayer, this.groupA.length + i, this.groupB[reorderB[i]]));
		}

		// Create a draggable line for this question and link the callback
		this.dragLine = new THM_MatchingLine(this.plugin, this.bgLayer, this.overlayColor);
		this.dragLine.funcDrag = this.isDragging;
		this.dragLine.funcScope = this;

		var pntA, pntB, paddingA = 0, paddingB = 0;
		// If the layout is vertical
		if(this.layout) {
			// Figure out the starting points based on the layout
			pntA = new Point(this.layoutX, this.layoutY);
			pntB = new Point(this.layoutX + this.layoutWidth, this.layoutY);

			// Count the total height of all the objects and figure out the padding required to make it fit
			for(i = 0; i < this.groupA.length; i++) {
				paddingA += this.arrObjects[i].height;
			}
			paddingA = (this.layoutHeight - paddingA) / (this.groupA.length + 1);
			pntA.y += paddingA;

			// Position each group A's object w/ padding and create anchor locations
			for(i = 0; i < this.groupA.length; i++) {
				this.arrObjects[i].setPosition(pntA.x, pntA.y);
				this.arrObjects[i].anchorX = pntA.x + (this.arrObjects[i].width * 0.9);
				this.arrObjects[i].anchorY = pntA.y + (this.arrObjects[i].height * 0.5);
				this.dragLine.addRect(i, pntA.x, pntA.y, this.arrObjects[i].width, this.arrObjects[i].height);
				pntA.y += this.arrObjects[i].height + paddingA;
			}

			// Count the total height of all the objects and figure out the padding required to make it fit
			for(i = this.groupA.length; i < this.groupA.length + this.groupB.length; i++) {
				paddingB += this.arrObjects[i].height;
			}
			paddingB = (this.layoutHeight - paddingB) / (this.groupB.length + 1);
			pntB.y += paddingB;

			// Position each group B's object w/ padding and create anchor locations
			for(i = this.groupA.length; i < this.groupA.length + this.groupB.length; i++) {
				this.arrObjects[i].setPosition(pntB.x - this.arrObjects[i].width, pntB.y);
				this.arrObjects[i].anchorX = pntB.x - (this.arrObjects[i].width * 0.9);
				this.arrObjects[i].anchorY = pntB.y + (this.arrObjects[i].height * 0.5);
				this.dragLine.addRect(i, pntB.x - this.arrObjects[i].width, pntB.y, this.arrObjects[i].width, this.arrObjects[i].height);
				pntB.y += this.arrObjects[i].height + paddingB;
			}
		// If the layout is horizontal
		} else {
			pntA = new Point(this.layoutX, this.layoutY);
			pntB = new Point(this.layoutX, this.layoutY + this.layoutHeight);

			// Count the total width of all the objects and figure out the padding required to make it fit
			for(i = 0; i < this.groupA.length; i++) {
				paddingA += this.arrObjects[i].width;
			}
			paddingA = (this.layoutWidth - paddingA) / (this.groupA.length + 1);
			pntA.x += paddingA;

			// Position each group A's object w/ padding and create anchor locations
			for(i = 0; i < this.groupA.length; i++) {
				this.arrObjects[i].selected = false;
				this.arrObjects[i].setPosition(pntA.x, pntA.y);
				this.arrObjects[i].anchorX = pntA.x + (this.arrObjects[i].width * 0.5);
				this.arrObjects[i].anchorY = pntA.y + (this.arrObjects[i].height * 0.9);
				this.dragLine.addRect(i, pntA.x, pntA.y, this.arrObjects[i].width, this.arrObjects[i].height);
				pntA.x += this.arrObjects[i].width + paddingA;
			}

			// Count the total width of all the objects and figure out the padding required to make it fit
			for(i = this.groupA.length; i < this.groupA.length + this.groupB.length; i++) {
				paddingB += this.arrObjects[i].width;
			}
			paddingB = (this.layoutWidth - paddingB) / (this.groupB.length + 1);
			pntB.x += paddingB;

			// Position each group B's object w/ padding and create anchor locations
			for(i = this.groupA.length; i < this.groupA.length + this.groupB.length; i++) {
				this.arrObjects[i].selected = false;
				this.arrObjects[i].setPosition(pntB.x, pntB.y - this.arrObjects[i].height);
				this.arrObjects[i].anchorX = pntB.x + (this.arrObjects[i].width * 0.5);
				this.arrObjects[i].anchorY = pntB.y - (this.arrObjects[i].height * 0.9);
				this.dragLine.addRect(i, pntB.x, pntB.y - this.arrObjects[i].height, this.arrObjects[i].width, this.arrObjects[i].height);
				pntB.x += this.arrObjects[i].width + paddingB;
			}
		}

		// Create the match maker logic class
		var smallestLength = this.groupA.length;
		if(smallestLength >= this.groupB.length) smallestLength = this.groupB.length;
		this.matchMaker = new THM_MatchMaker(this.plugin, this.bgLayer, this.arrObjects, smallestLength, this.connectionColor);

		// Load all of the answer pairs
		this.pairs = readJSON(configuration.pairs, "configuration matching pairs",[]);
		var strRefA, strRefB;
		for(i = 0; i < this.pairs.length; i++) {
			strRefA = readJSON(this.pairs[i].reference_a, "pair " + i + " reference a","reference a");
			strRefB = readJSON(this.pairs[i].reference_b, "pair " + i + " reference b","reference b");
			this.matchMaker.addPair(strRefA, strRefB);
		}

	};

	/**
	Overload the display function for a matching question.
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.loadQuiz = function() {
		logDebug("Matching question loadQuiz()");
		// Enable the draggable line
		this.dragLine.subscribe();
		this.numLast = -1;

		// Reset all the connections
		this.matchMaker.resetConnections();
	};

	/**
	Overload the clean up function for a matching question.
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.cleanUp = function() {
		logDebug("Matching question cleanUp()");
		// Disable the draggable line
		this.dragLine.unsubscribe();
	};

	/**
	Overload the reset function for a matching question.
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.resetQuiz = function() {
		logDebug("Matching question resetQuiz()");
		this.loadQuiz();
	};

	/**
	Overload the show correct answer animation function for a matching question.
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.showCorrectAnswer = function() {
		logDebug("Matching question showCorrectAnswer()");
		this.matchMaker.showAnswers();
	};

	/**
	Overload the check answer function for a matching question.
	@param  {void} Nothing
	@return {boolean} True if correct and false otherwise.
	*/
	this.checkAnswer = function() {
		logDebug("Matching question checkAnswer()");
		return this.matchMaker.checkAnswers();
	};

	/**
	Adds this scene to the plugin.
	@param  {void} Nothing
	@return {void} Nothing
	*/
    this.addScene = function() {
        this.plugin.addScene(this.id);
    };

	/**
	Changes to the next scene in the plugin.
	@param  {void} Nothing
	@return {void} Nothing
	*/
    this.nextScene = function() {
        this.plugin.nextScene();
    };

	/**
	Changes to the previous scene in the plugin.
	@param  {void} Nothing
	@return {void} Nothing
	*/
    this.prevScene = function() {
        this.plugin.prevScene();
    };

	/**
	Sets the current scene to this one.
	@param  {void} Nothing
	@return {void} Nothing
	*/
    this.setScene = function() {
        this.plugin.setScene(this.getId());
    };

	/**
	Sets the number of tries for this scene.
	@param  {number} tries The number of tries for this scene
	@return {void} Nothing
	*/
    this.setTries = function(tries) {
        if(typeof tries !== "number") {
            return;
        }
        this.tries = tries;
    };

	/**
	Decrements the number of tries by one.
	@param  {void} Nothing
	@return {void} Nothing
	*/
    this.decrementTries = function() {
        if(!(this.tries === 0)) {
            this.tries = this.tries - 1;
        }
    };

	/**
	Gets the number of tries for this scene.
	@param  {void} Nothing
	@return {number} The number of tries for this scene
	*/
    this.getTries = function() { return this.tries; };

	/**
	Sets if the scene is correct
	@param  {boolean} correct True if this scene is correct and false otherwise
	@return {void} Nothing
	*/
    this.setCorrect = function(correct) {
        if(typeof correct !== "boolean") {
            logError("correct must have a value of type 'boolean'");
            return;
        }
        this.correct = correct;
        this.completed = true;
    };

	/**
	Gets if the scene is correct
	@param  {void} Nothing
	@return {boolean} True if this scene is correct and false otherwise
	*/
    this.getCorrect = function() { return this.correct; };

	/**
	Sets if the scene is completed
	@param  {boolean} completed True if this scene is completed and false otherwise
	@return {void} Nothing
	*/
    this.setCompleted = function(completed) {
        if(typeof completed !== "boolean") {
            logError("completed must have a value of type 'boolean'");
            return;
        }
        this.completed = completed;
    };

	/**
	Gets if the scene is completed
	@param  {void} Nothing
	@return {boolean} True if this scene is completed and false otherwise
	*/
    this.getCompleted = function() { return this.completed; };

	/**
	Sets if the scene status has been recieved by the server
	@param  {boolean} serverStatus True if this scenes status has been recieved by the server and false otherwise
	@return {void} Nothing
	*/
    this.setServerStatus = function(serverStatus) {
        if(typeof serverStatus !== "boolean") {
            logError("serverStatus must have a value of type 'boolean'");
            return;
        }
        this.serverStatus = serverStatus;
    };

	/**
	Gets if the scene status has been recieved by the server
	@param  {void} Nothing
	@return {boolean} True if this scenes status has been recieved by the server and false otherwise
	*/
    this.getServerStatus = function() { return this.serverStatus; };
}
THM_MatchingQuestion.prototype = new Osmosis();
/**
A generic object with a background rectangle and label
@class THM_Object
@param  {object} plugin The monocleGL plugin object.
@param  {object} lyrParent The parent layer to add these objects too.
@param  {number} numObject The number to passed along in callbacks.
@param  {object} jObject The object JSON defination.
@return {void} Nothing
*/
function THM_Object(plugin, lyrParent, numObject, jObject) {
	// Setup local varibles
    this.plugin = plugin;
	this.lyrParent = lyrParent;
	this.numObject = numObject;
	this.jObject = jObject;
	this.funcDrag = undefined;
	this.funcScope = undefined;
	this.bBringToFront = false;

	// The minimum amount the layout can span
	this.minPercent = 0.25;

	/**
	Creates the item and adds it to the passed parent. Called internally during creation and only needs to called once.
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.create = function() {
		this.name = readJSON(this.jObject.name, "object " + this.numObject + " name","untitled");

		// Read the image details from JSON
		this.width = parseInt(readJSON(this.jObject.width, "object " + this.numObject + " width","128"), 10);
		this.height = parseInt(readJSON(this.jObject.height, "object " + this.numObject + " height","32"), 10);
		this.x = parseInt(readJSON(this.jObject.x, "object " + this.numObject + " x","0"), 10);
		this.y = parseInt(readJSON(this.jObject.y, "object " + this.numObject + " y",String(-this.height)), 10);
		this.strImage = readJSON(this.jObject.image, "object " + this.numObject + " image","");
		this.intImageWidth = parseInt(readJSON(this.jObject.image_width, "object " + this.numObject + " image width",""+this.width), 10);
		this.intImageHeight = parseInt(readJSON(this.jObject.image_height, "object " + this.numObject + " image height",""+this.height), 10);
		this.intHeightRatio = this.intImageHeight / this.intImageWidth;
		this.intWidthRatio =  this.intImageWidth / this.intImageHeight;
		this.strName = readJSON(this.jObject.name, "object " + this.numObject + " name","untitled #"+this.numObject);

		// Read the text details from JSON
		this.strText = readJSON(this.jObject.text, "object " + this.numObject + " text","");
		this.strTextLayout = readJSON(this.jObject.text_layout, "object " + this.numObject + " text layout","full").toLowerCase();
		this.strTextAlign = readJSON(this.jObject.text_align, "object " + this.numObject + " text align","center").toLowerCase();
		this.intTextSize = parseInt(readJSON(this.jObject.text_size, "object " + this.numObject + " text size","12"), 10);
		this.strTextColor = new THM_Color();
		this.strTextColor.convertHex(readJSON(this.jObject.text_color, "object " + this.numObject + " text color","000000"));

		// Read the back ground rectangle details from JSON
		this.strBgColor = new THM_Color();
		this.strBgColor.convertHex(readJSON(this.jObject.background_color, "object " + this.numObject + " background color","FFCC99"));
		this.strOrgColor = new THM_Color(this.strBgColor.r, this.strBgColor.g, this.strBgColor.b, this.strBgColor.a);
		this.strLastColor = new THM_Color(this.strBgColor.r, this.strBgColor.g, this.strBgColor.b, this.strBgColor.a);
		this.intCorners = parseInt(readJSON(this.jObject.rounded_corners, "object " + this.numObject + " text size","12"), 10);
		this.intPaddingX = parseInt(readJSON(this.jObject.horizontal_padding, "object " + this.numObject + " text vertical padding","5"), 10);
		this.intPaddingY = parseInt(readJSON(this.jObject.vertical_padding, "object " + this.numObject + " text vertical padding","5"), 10);

		// Create the layer for each item
		this.lyrItem = new Layer(this.plugin, this.x, this.y, this.width, this.height);
		this.lyrItem.setColor(0,0,0,0);
		this.id = this.lyrItem.id;

		// Create a with the padding already accounted for
		this.lyrPadded = new Layer(this.plugin, this.intPaddingX, this.intPaddingY, this.width - (this.intPaddingX*2), this.height - (this.intPaddingY*2));
		this.lyrPadded.setColor(0,0,0,0);

		// Create the background rectangle for the item
		this.rectItem = new Primitive(this.plugin, "rectangle", 0, 0, this.width, this.height);
		this.rectItem.setCornerRadius(this.intCorners);
		this.rectItem.setColor(this.strBgColor.r, this.strBgColor.g, this.strBgColor.b, this.strBgColor.a);

		// Create the label for this item
		this.lblItem = new Label(this.plugin, this.strText, this.intTextSize, 0, 0, this.lyrPadded.width, this.lyrPadded.height);
		this.lblItem.setCaptionColor(this.strTextColor.r,this.strTextColor.g,this.strTextColor.b, this.strTextColor.a);
		this.lblItem.setColor(0,0,0,0);
		this.lblItem.setAnchor(this.strTextAlign);
		this.lblItem.setWrap(true);

		// Create the image for this item
		this.sprItem = new Sprite(this.plugin, mediaURL + slugUUID + this.strImage, 0, 0, this.lyrPadded.width, this.lyrPadded.height);

		// Add every thing to the item layer and add to the parent
		if(this.strImage !== "") this.lyrPadded.addChild(this.sprItem);
		if(this.strText !== "") this.lyrPadded.addChild(this.lblItem);
		this.lyrItem.addChild(this.rectItem);
		this.lyrItem.addChild(this.lyrPadded);
		this.lyrParent.addChild(this.lyrItem);
	};

	/**
	Preforms any layout organizing needed. Called internally during creation and only needs to called once.
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.layout = function() {
		var rectImage = new Rectangle(this.sprItem.x, this.sprItem.y, this.sprItem.width, this.sprItem.height);
		var rectText = new Rectangle(this.lblItem.x, this.lblItem.y, this.lblItem.width, this.lblItem.height);
		var percentage = 0;
		var centerGap = 0;

		//------------------------------------------------------------------------------
		// Adjust the layout to split horizontally
		if(this.strTextLayout === "top" || this.strTextLayout === "bottom") {
			// Get the percentage of the image width vs the item width
			rectImage.height = rectImage.width * this.intHeightRatio;
			percentage = rectImage.height / this.lyrPadded.height;

			// Limit the percent range
			if(percentage < this.minPercent) percentage = this.minPercent;
			if(percentage > (1.0 - this.minPercent)) percentage = 1.0 - this.minPercent;

			// If the image would over flow then resize completely
			if(rectImage.height > percentage * this.lyrPadded.height) {
				rectImage.height = percentage * this.lyrPadded.height;
				rectImage.width = rectImage.height * this.intWidthRatio;
				rectImage.x = (this.lyrPadded.width - rectImage.width) * 0.5;
			}

			// Resize the text
			rectText.height = (1.0 - percentage) * this.lyrPadded.height;

			// Figure out if any gap is needed inbetween the text and images
			centerGap = (this.lyrPadded.height - rectText.height - rectImage.height) * 0.5;

			if(this.strTextLayout === "top") {
				// Reposition the text and image
				rectImage.y = centerGap;
				rectText.y = rectImage.y + rectImage.height + centerGap;
			} else {
				// Reposition the image
				rectImage.y = rectText.y + rectText.height + centerGap;
			}

		//------------------------------------------------------------------------------
		// Adjust the layout to split vertically
		} else if(this.strTextLayout === "left" ||  this.strTextLayout === "right") {
			// Get the percentage of the image width vs the item width
			rectImage.width = rectImage.height * this.intWidthRatio;
			percentage = rectImage.width / this.lyrPadded.width;

			// Limit the percent range
			if(percentage < this.minPercent) percentage = this.minPercent;
			if(percentage > (1.0 - this.minPercent)) percentage = 1.0 - this.minPercent;

			// If the image would over flow then resize completely
			if(rectImage.width > percentage * this.lyrPadded.width) {
				rectImage.width = percentage * this.lyrPadded.width;
				rectImage.height = rectImage.width * this.intHeightRatio;
				rectImage.y = (this.lyrPadded.height - rectImage.height) * 0.5;
			}

			// Resize the text
			rectText.width = (1.0 - percentage) * this.lyrPadded.width;

			// Figure out if any gap is needed inbetween the text and images
			centerGap = (this.lyrPadded.width - rectText.width - rectImage.width) * 0.5;

			if(this.strTextLayout === "left" ){
				// Reposition the image
				rectImage.x = rectText.x + rectText.width + centerGap;
			} else {

				// Reposition the image and text
				rectImage.x = centerGap;
				rectText.x = rectImage.x + rectImage.width + centerGap;
			}
		} else if(this.strTextLayout === "center") {
			// Get the percentage of the image width vs the item width
			rectImage.width = rectImage.height * this.intWidthRatio;
			percentage = rectImage.width / this.lyrPadded.width;

			// Limit the percent range
			if(percentage < this.minPercent) percentage = this.minPercent;
			if(percentage > (1.0 - this.minPercent)) percentage = 1.0 - this.minPercent;

			// If the image would over flow then resize completely
			if(rectImage.width > percentage * this.lyrPadded.width) {
				rectImage.width = percentage * this.lyrPadded.width;
				rectImage.height = rectImage.width * this.intHeightRatio;
			}
			rectImage.x = (this.lyrPadded.width - rectImage.width) * 0.5;
			rectImage.y = (this.lyrPadded.height - rectImage.height) * 0.5;
		}

		// Reposition image
		this.sprItem.setPosition(rectImage.x, rectImage.y);
		this.sprItem.setDimensions(rectImage.width, rectImage.height);

		// Account for label padding
		rectText.x -= 10;
		//rectText.width += 5;
		rectText.y += 10;
		rectText.height -= 5;

		// Reposition text
		this.lblItem.setPosition(rectText.x, rectText.y);
		this.lblItem.setDimensions(rectText.width, rectText.height);
	}

	/**
	Send the object to the front of the display list.
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.sendToFront = function() {
		this.lyrParent.removeChild(this.lyrItem);
		this.lyrParent.addChild(this.lyrItem);
	}

	/**
	Triggered when the user start dragging object.
	@param  {number} x The x position of the mouse.
	@param  {number} y The y position of the mouse.
	@return {void} Nothing
	*/
	this.startDrag = function(x,y) {
		if(this.bBringToFront) {
			this.sendToFront();
		}
		this.x = x;
		this.y = y;
		this.isDragging(this.numObject, true);
	};

	/**
	Triggered when the user stastopsrt dragging object.
	@param  {number} x The x position of the mouse.
	@param  {number} y The y position of the mouse.
	@return {void} Nothing
	*/
	this.stopDrag = function(x,y) {
		this.x = x;
		this.y = y;
		this.isDragging(this.numObject, false);
	};

	/**
	This callback notifies the question when the line is being dragging.
	@param  {number} numObject The index of the object clicked on.
	@param  {number} bDragging True if the mouse is down and false otherwise.
	@return {void} Nothing
	*/
	this.isDragging = function(numObject, bDragging) {
		if(this.funcDrag !== undefined && this.funcScope !== undefined) {
			this.funcDrag.apply(this.funcScope, arguments);
		}
	};

	/**
	Shortcut to subscribe the draggble line.
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.subscribe = function() {
		this.lyrItem.subscribe();
	};

	/**
	Shortcut to unsubscribe the draggble line.
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.unsubscribe = function() {
		this.lyrItem.unsubscribe();
	};

	/**
	Set up a color tween of the background rectangle.
	@param  {number} r The new amount of red (range 0 to 1).
	@param  {number} g The new amount of green (range 0 to 1).
	@param  {number} b The new amount of blue (range 0 to 1).
	@param  {number} a The new amount of alpha (range 0 to 1).
	@param  {number} time The amount of time the tween will take.
	@param  {number} delay The amount of time to wait before starting the tween.
	@return {void} Nothing
	*/
	this.colorTween = function(r, g, b, a, time, delay) {
		this.strLastColor.setColor(this.strBgColor.r, this.strBgColor.g, this.strBgColor.b, this.strBgColor.a);
		this.strBgColor.setColor(r, g, b, a);
		this.rectItem.addTween("red:" + r + ",green:" + g + ",blue:" + b + ",alpha:" + a + ",time:" + time + ",delay:" + delay);
	}

	/**
	Set up a color tween of the background rectangle back to it's original color.
	@param  {number} time The amount of time the tween will take.
	@param  {number} delay The amount of time to wait before starting the tween.
	@return {void} Nothing
	*/
	this.originalTween = function(time, delay) {
		this.rectItem.addTween("red:" + this.strOrgColor.r + ",green:" + this.strOrgColor.g + ",blue:" + this.strOrgColor.b + ",alpha:" + this.strOrgColor.a + ",time:" + time + ",delay:" + delay);
	}

	/**
	Set up a color tween of the background rectangle back to it's last color.
	@param  {number} time The amount of time the tween will take.
	@param  {number} delay The amount of time to wait before starting the tween.
	@return {void} Nothing
	*/
	this.resetTween = function(time, delay) {
		this.strBgColor.setColor(this.strLastColor.r, this.strLastColor.g, this.strLastColor.b, this.strLastColor.a);
		this.rectItem.addTween("red:" + this.strLastColor.r + ",green:" + this.strLastColor.g + ",blue:" + this.strLastColor.b + ",alpha:" + this.strLastColor.a + ",time:" + time + ",delay:" + delay);
	}

	/**
	The answer animation routine.
	@param  {boolean} bCorrect If true color rectangle green else color rectangle red.
	@return {void} Nothing
	*/
	this.showCorrect = function(bCorrect) {
		// If correct tween green
		if(bCorrect) {
			this.colorTween(0.5, 0.875, 0.45, 1.0, 1.0, 0.0);
		// If wrong tween red
		} else {
			this.colorTween(1.0, 0.22, 0.25, 1.0, 1.0, 0.0);
		}
		// Tween back to the original color
		this.resetTween(1.0, 2.0);
	}

	// Create the item
	this.create();
	this.layout();
}
THM_Object.prototype = new Osmosis();
/**
The ordering grid that notifies the demo when the mouse goes over a new part of the grid
@class THM_OrderGrid
@param  {object} plugin The monocleGL plugin object.
@param  {object} lyrParent The parent layer to add this grid too.
@param  {number} x The x position of the grid.
@param  {number} y The y position of the grid.
@param  {number} width The width of the grid.
@param  {number} height The height of the grid.
@param  {number} object The number of objects in grid.
@param  {boolean} layout If true the layout is horizontal else the layout is vertical.
@return {void} Nothing
*/
function THM_OrderGrid(plugin, lyrParent, x, y, width, height, objects, layout) {
	// Setup local varibles
    this.plugin = plugin;
	this.lyrParent = lyrParent;
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.objects = objects;
	this.layout = layout;
	this.gridWidth = this.width / this.objects;
	this.gridHeight = this.height / this.objects;
	this.funcGrid = undefined;
	this.funcScope = undefined;

	/**
	Creates the grid and adds it to the passed parent. Called internally during creation and only needs to called once.
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.create = function() {
		// Create the layer for each item
		this.lyrGrid = new Layer(this.plugin, this.x, this.y, this.width, this.height);
		this.lyrGrid.setColor(0,0,0,0);
		this.id = this.lyrGrid.id;

		// Create each section of the grid and assign a callback based on the grid position.
		var strCall;
		this.sprGrid = [];
		for(var i = 0; i < this.objects; i++) {
			// Make a grid item to trigger mouseOver events
			if(this.layout) {
				this.sprGrid[i] = new Sprite(this.plugin, "", (this.objects - i - 1) * this.gridWidth, 0, this.gridWidth, this.height);
			} else {
				this.sprGrid[i] = new Sprite(this.plugin, "", 0, (this.objects - i - 1) * this.gridHeight, this.width, this.gridHeight);
			}

			this.sprGrid[i].setColor(0,0,0,0);
			strCall = "mouseOver" + parseInt(i,10);
			this.sprGrid[i].overCallback(this, strCall);
			this.lyrGrid.addChild(this.sprGrid[i]);
		}

		this.lyrParent.addChild(this.lyrGrid);
	};

	// Kinda of a hack but until we can pass user data in callbacks this will have to do
	this.mouseOver0 = function(x,y) { this.overGrid(0); };
	this.mouseOver1 = function(x,y) { this.overGrid(1); };
	this.mouseOver2 = function(x,y) { this.overGrid(2); };
	this.mouseOver3 = function(x,y) { this.overGrid(3); };
	this.mouseOver4 = function(x,y) { this.overGrid(4); };
	this.mouseOver5 = function(x,y) { this.overGrid(5); };
	this.mouseOver6 = function(x,y) { this.overGrid(6); };
	this.mouseOver7 = function(x,y) { this.overGrid(7); };
	this.mouseOver8 = function(x,y) { this.overGrid(8); };
	this.mouseOver9 = function(x,y) { this.overGrid(9); };

	/**
	Shortcut to subscribe the grid
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.subscribe = function() {
		for(var i = 0; i < this.objects; i++) {
			this.sprGrid[i].subscribe();
		}
	};

	/**
	Shortcut to unsubscribe the grid
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.unsubscribe = function() {
		for(var i = 0; i < this.objects; i++) {
			this.sprGrid[i].unsubscribe();
		}
	};

	/**
	This callback notifies the demo when the mouse goes over a new part of the grid.
	@param  {number} gridNumber The index of the of the part of the grid the user is over.
	@return {void} Nothing
	*/
	this.overGrid = function(gridNumber) {
		if(this.funcGrid !== undefined && this.funcScope !== undefined) {
			this.funcGrid.apply(this.funcScope, arguments);
		}
	};

	// Create the item
	this.create();
}
THM_OrderGrid.prototype = new Osmosis();

/**
The ordering style question built by JSON
@class THM_OrderingQuestion
@param  {object} plugin The monocleGL plugin object.
@param  {object} configuration The JSON definetion of this question.
@return {void} Nothing
*/
function THM_OrderingQuestion (plugin, configuration) {

	// Scene specfic values
	this.plugin = plugin;
    this.id = this.plugin.newScene();
    this.strInstruction = readJSON(configuration.text, "configuration text","Question text");
   	this.strImage = readJSON(configuration.image, "configuration image","");

    // Question status flags
    this.tries = 3;
    this.correct = false;
    this.completed = false;
    this.serverStatus = false;

	// Setup the background layer
    this.bgLayer = new Layer(this.plugin, 0, 0, 480, 320);
    this.bgLayer.setColor(0, 0, 0, 0);

	//Demo-specific varibles
	this.jObjects = readJSON(configuration.objects, "configuration items",[0,0,0]);
	this.numItems = this.jObjects.length;

	this.strLayout = readJSON(configuration.layout, "configuration layout","vertical").toLowerCase();
	this.layout = this.strLayout === "vertical";

	this.layoutX = parseInt(readJSON(configuration.x, "configuration x","20"),10);
	this.layoutY = parseInt(readJSON(configuration.y, "configuration y","20"),10);
	this.layoutWidth = parseInt(readJSON(configuration.width, "configuration width","440"),10);
	this.layoutHeight = parseInt(readJSON(configuration.height, "configuration height","220"),10);

	// Setup the order arrays
	this.arrOrder = [0,1,2,3,4,5,6,7,8,9];
	this.arrRandom = [0,1,2,3,4,5,6,7,8,9];
	this.arrItems = [];
	this.grid = undefined;

	// Local varibible to keep track of the
	this.currentItem = -1;
	this.itemPadding = 0;
	this.itemHeight = 0;
	this.itemWidth = 0;
	this.placeHolder = 0;
	this.bIsDragging = false;

	/**
	The reposition the items based on the arrOrder
	@param  {boolean} bAnimate If true animate the objects to the correct positions otherwise warp them.
	@return {void} Nothing
	*/
	this.positionOrder = function(bAnimate) {
		var newX;
		var newY;

		for(i = 0; i < this.numItems; i++) {
			// Precalculate the y position
			if(this.layout) {
				newY = this.layoutY;
				newX = this.layoutX + ((this.numItems - i - 1) * this.itemPadding);
			} else {
				newY = this.layoutY + ((this.numItems - i - 1) * this.itemPadding);
				newX = this.layoutX;
			}

			// Check if the new and current y match or if this is the current item
			if((this.arrItems[this.arrOrder[i]].y != newY
			   || this.arrItems[this.arrOrder[i]].x != newX)
			   && this.arrOrder[i] != this.currentItem) {

				// Remove any previous tweens on the item
				this.arrItems[this.arrOrder[i]].removeTween();

				// If the animate flag was used then animate it otherwise warp the item
				if(bAnimate) {
					this.arrItems[this.arrOrder[i]].addTween("x:" + newX + ",y:" + newY + ",time:0.5");
				} else {
					this.arrItems[this.arrOrder[i]].setPosition(newX, newY);
				}

				// Record the new position to JS so we are sync'd
				this.arrItems[this.arrOrder[i]].x = newX;
				this.arrItems[this.arrOrder[i]].y = newY;
			}
		}
	};

	/**
	The callback from the grid of whre in the grid the mouse is.
	@param  {number} gridNumber The index value of the part of the grid the mouse is over.
	@return {void} Nothing
	*/
	this.overGrid = function(gridNumber) {
		if(this.bIsDragging) {
			// Remove the element for the order array
			this.arrOrder.splice(this.placeHolder,1);

			// Update the place holder position to the new grid position
			this.placeHolder = gridNumber;

			// Insert the element at the new place holder position
			this.arrOrder.splice(this.placeHolder,0,this.currentItem);

			// Anitmate any changes needed
			this.positionOrder(true);
		}
	};

	/**
	The callback from an object that's its being dragged
	@param  {number} numObject The index of the object clicked on.
	@param  {number} bDragging True if the mouse is down and false otherwise.
	@return {void} Nothing
	*/
	this.isDragging = function(numItem, bDragging) {
		var i = 0;
		this.bIsDragging = bDragging;

		// If the is being dragged the update the place holder and current item
		if(this.bIsDragging) {
			for(i = 0; i < this.numItems; i++) {
				if(this.arrOrder[i] == numItem) this.placeHolder = i;
			}
			this.currentItem = numItem;

		// If the item has been dropped changes the y and reset the current item
		} else {
			// If a current item has been moved the reset it to -1 so it's repositioned
			if(this.currentItem !== -1) {
				this.arrItems[this.currentItem].y = -1;
			}

			// Set the current item to be -1
			this.currentItem = -1;

			// Warp all the items to the new positions
			this.positionOrder(false);
		}
	};

	/**
	Overload the initialize function for a ordering question.
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.initQuiz = function() {
		logDebug("Ordering question initQuiz()");

		if(this.strImage !== "") {
			this.sprImage = new Sprite(this.plugin, mediaURL + slugUUID + this.strImage, 0, 0, 480, 320);
			this.bgLayer.addChild(this.sprImage);
		}

		// Setup the grid to let us know where the mouse is
		this.grid = new THM_OrderGrid(this.plugin, this.bgLayer, this.layoutX, this.layoutY, this.layoutWidth, this.layoutHeight, this.numItems, this.layout);
		this.grid.funcGrid = this.overGrid;
		this.grid.funcScope = this;

		// Setup the item padding and item height
		if(this.layout) {
			this.itemPadding = this.layoutWidth / this.numItems;
			this.itemHeight = this.layoutHeight;
			this.itemWidth = this.itemPadding - 6;
		} else {
			this.itemPadding = this.layoutHeight / this.numItems;
			this.itemHeight = this.itemPadding - 6;
			this.itemWidth = this.layoutWidth;
		}

		// Setup all the items and link to this demo
		for(var i = 0; i < this.numItems; i++) {
			this.jObjects[i].width = this.itemWidth;
			this.jObjects[i].height = this.itemHeight;
			this.arrItems[i] = new THM_Object(this.plugin, this.bgLayer, i, this.jObjects[i]);
			this.arrItems[i].lyrItem.addDragStartCallback(this.arrItems[i], "startDrag");
			this.arrItems[i].lyrItem.addDropCallback(this.arrItems[i], "stopDrag");
			this.arrItems[i].lyrItem.setDrag();
			this.arrItems[i].lyrItem.setDragRegion(this.layoutX, this.layoutY, this.layoutWidth, this.layoutHeight);
			this.arrItems[i].lyrItem.unsubscribe();
			this.arrItems[i].bBringToFront = true;
			this.arrItems[i].funcDrag = this.isDragging;
			this.arrItems[i].funcScope = this;
		}

		// Randomize the items
		var bRandom = false;
		var temp = 0;
		var randomize = 0;
		var loopBreaker = 0;

		// Keep randomizing until the random ordering doesn't match the answer
		while(!bRandom) {
			// If for whatever reason we can't randomize then log error and break out
			if(++loopBreaker > 10) {
				logError("ERROR can't randomize items, continuing with setup");
				break;
			}

			// Randomly swapped the items
			for(i = 0; i < this.numItems - 1; i++) {
				randomize = parseInt(Math.random() * this.numItems, 10);
				temp = this.arrRandom[i];
				this.arrRandom[i] = this.arrRandom[randomize];
				this.arrRandom[randomize] = temp;
			}

			// Check if the randomized failed
			for(i = 0; i < this.numItems; i++) {
				if(this.arrRandom[i] !== i) {
					bRandom = true;
				}
			}
		}
	};

	/**
	Overload the display function for a ordering question.
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.loadQuiz = function() {
		logDebug("Ordering question loadQuiz()");
		// Set the items back to the original order
		for(var i = 0; i < this.numItems; i++) {
			this.arrOrder[i] = this.arrRandom[i];
			this.arrItems[i].subscribe();
		}
		// Warp all the items to the new position
		this.currentItem = -1;
		this.positionOrder(false);

		// Subscribe the whole grid
		this.grid.subscribe();
	};

	/**
	Overload the clean up function for a ordering question.
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.cleanUp = function() {
		logDebug("Ordering question cleanUp()");
		// Remove all the subscriptions for this question
		for(var i = 0; i < this.numItems; i++) {
			this.arrItems[i].unsubscribe();
		}
		this.grid.unsubscribe();
	};

	/**
	Overload the reset function for a ordering question.
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.resetQuiz = function() {
		logDebug("Ordering question resetQuiz()");
	};

	/**
	Overload the show correct answer function for a ordering question.
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.showCorrectAnswer = function() {
		logDebug("Ordering question showCorrectAnswer()");

		// Set the order to be correct and flash green
		for(var i = 0; i < this.numItems; i++) {
			this.arrOrder[i] = i;
			this.arrItems[i].showCorrect(true);
		}

		// Animate any out of position items
		this.positionOrder(true);
	};

	/**
	Overload the check answer function for a ordering question.
	@param  {void} Nothing
	@return {boolean} True if correct and false otherwise.
	*/
	this.checkAnswer = function() {
		logDebug("Ordering question checkAnswer()");

		// Check each position and color green if correct and red otherwise
		var bResult = true;
		for(var i = 0; i < this.numItems; i++) {
			if(this.arrOrder[i] === i) {
				this.arrItems[i].showCorrect(true);
			} else {
				this.arrItems[i].showCorrect(false);
				bResult = false;
			}
		}
		return bResult;
	};

	/**
	Adds this scene to the plugin.
	@param  {void} Nothing
	@return {void} Nothing
	*/
    this.addScene = function() {
        this.plugin.addScene(this.id);
    };

	/**
	Changes to the next scene in the plugin.
	@param  {void} Nothing
	@return {void} Nothing
	*/
    this.nextScene = function() {
        this.plugin.nextScene();
    };

	/**
	Changes to the previous scene in the plugin.
	@param  {void} Nothing
	@return {void} Nothing
	*/
    this.prevScene = function() {
        this.plugin.prevScene();
    };

	/**
	Sets the current scene to this one.
	@param  {void} Nothing
	@return {void} Nothing
	*/
    this.setScene = function() {
        this.plugin.setScene(this.getId());
    };

	/**
	Sets the number of tries for this scene.
	@param  {number} tries The number of tries for this scene
	@return {void} Nothing
	*/
    this.setTries = function(tries) {
        if(typeof tries !== "number") {
            return;
        }
        this.tries = tries;
    };

	/**
	Decrements the number of tries by one.
	@param  {void} Nothing
	@return {void} Nothing
	*/
    this.decrementTries = function() {
        if(!(this.tries === 0)) {
            this.tries = this.tries - 1;
        }
    };

	/**
	Gets the number of tries for this scene.
	@param  {void} Nothing
	@return {number} The number of tries for this scene
	*/
    this.getTries = function() { return this.tries; };

	/**
	Sets if the scene is correct
	@param  {boolean} correct True if this scene is correct and false otherwise
	@return {void} Nothing
	*/
    this.setCorrect = function(correct) {
        if(typeof correct !== "boolean") {
            logError("correct must have a value of type 'boolean'");
            return;
        }
        this.correct = correct;
        this.completed = true;
    };

	/**
	Gets if the scene is correct
	@param  {void} Nothing
	@return {boolean} True if this scene is correct and false otherwise
	*/
    this.getCorrect = function() { return this.correct; };

	/**
	Sets if the scene is completed
	@param  {boolean} completed True if this scene is completed and false otherwise
	@return {void} Nothing
	*/
    this.setCompleted = function(completed) {
        if(typeof completed !== "boolean") {
            logError("completed must have a value of type 'boolean'");
            return;
        }
        this.completed = completed;
    };

	/**
	Gets if the scene is completed
	@param  {void} Nothing
	@return {boolean} True if this scene is completed and false otherwise
	*/
    this.getCompleted = function() { return this.completed; };

	/**
	Sets if the scene status has been recieved by the server
	@param  {boolean} serverStatus True if this scenes status has been recieved by the server and false otherwise
	@return {void} Nothing
	*/
    this.setServerStatus = function(serverStatus) {
        if(typeof serverStatus !== "boolean") {
            logError("serverStatus must have a value of type 'boolean'");
            return;
        }
        this.serverStatus = serverStatus;
    };

	/**
	Gets if the scene status has been recieved by the server
	@param  {void} Nothing
	@return {boolean} True if this scenes status has been recieved by the server and false otherwise
	*/
    this.getServerStatus = function() { return this.serverStatus; };
}
THM_OrderingQuestion.prototype = new Osmosis();
/**
Socket Item data structure
@class THM_Socket
@param  {number} x The x position of the center of the socket.
@param  {number} y The y position of the center of the socket.
@param  {object} objAnswer The the object that should be in the socket for the answer to be correct.
@return {void} Nothing
*/
function THM_Socket(x, y, objAnswer) {
	// Local socket varibles
	this.pntCenter = new Point(x,y);
	this.objAnswer = objAnswer;
	this.objItem = null;
}

/**
Socket List the list of all the socket items
@class THM_Sockets
@param  {object} plugin The monocleGL plugin object.
@param  {object} lyrParent The parent layer to add these objects too.
@param  {object} jObject The socket JSON defination.
@param  {object} stack Reference to the object stack.
@param  {number} maxDist The maximum distance that an object will snap to a socket in pixels.
@return {void} Nothing
*/
function THM_Sockets(plugin, lyrParent, jSockets, stack, maxDist) {
	// Local socket list varibles
	this.plugin = plugin;
	this.arrSocket = [];
	this.lyrParent = lyrParent;
	this.jSockets = jSockets;
	this.stack = stack;
	this.maxDistance = maxDist * maxDist;

	/**
	Creates the socket list based on the socket JSON. Called internally during creation and only needs to called once.
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.create = function() {
		// Temporary location varibles
		var socketX = 0;
		var socketY = 0;
		var strName = "";

		// Temporary image varibles
		var sprImage = null;
		var strImage = "";
		var intX = 0;
		var intY = 0;
		var intHeight = 0;
		var intWidth = 0;

		// The object pointer for the correct answer
		var objAnswer = null;

		// Add each socket to the socket list
		for(var i = 0; i < this.jSockets.length; i++) {
			// Read x, y and the correct answer from JSON
			socketX = parseInt(readJSON(jSockets[i].point_x, "socket " + i + " x","0"),10);
			socketY = parseInt(readJSON(jSockets[i].point_y, "socket " + i + " y","0"),10);
			strName = readJSON(jSockets[i].correct, "socket " + i + " correct answer","untitled");
			objAnswer = this.stack.getName(strName);
			this.arrSocket.push(new THM_Socket(socketX, socketY, objAnswer));

			// Check JSON for a background image
			strImage = readJSON(jSockets[i].image, "socket " + i + " image","");
			if(strImage !== ""){
				// Calculate where the image should appear on the screen
				intWidth = parseInt(readJSON(jSockets[i].image_width, "socket " + i + " image width","0"), 10);
				intHeight = parseInt(readJSON(jSockets[i].image_height, "socket " + i + " image height","0"), 10);
				intX = socketX - (intWidth * 0.5);
				intY = socketY - (intHeight * 0.5);

				// If an image is found then load resource and add to parent
				sprImage = new Sprite(this.plugin, mediaURL + slugUUID + strImage, intX, intY, intWidth, intHeight);
				this.lyrParent.addChild(sprImage);
			}
		}
	};

	/**
	Resets all the sockets to be empty.
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.reset = function() {
		for(var i = 0; i < this.arrSocket.length; i++) {
			this.arrSocket[i].objItem = null;
		}
	};

	/**
	Go through the socket list and unsocket any item that matches.
	@param  {object} objItem Unsocket this item if socketed in the list.
	@return {void} Nothing
	*/
	this.unsocket = function(objItem) {
		for(var i = 0; i < this.arrSocket.length; i++) {
			if(this.arrSocket[i].objItem === objItem) {
				this.arrSocket[i].objItem = null;
			}
		}
	};

	/**
	Setup any show answer animations required.
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.showAnimation = function() {
		var newX;
		var newY;

		// Go through each socket and check if it's in the correct place
		for(var i = 0; i < this.arrSocket.length; i++) {

			// Flash the object green if correct and red otherwise
			this.arrSocket[i].objAnswer.showCorrect(true);

			// Check if the object is in the correct location
			if(this.arrSocket[i].objAnswer !== this.arrSocket[i].objItem) {

				// If the object isn't in the right location then tween it to be correct
				newX = this.arrSocket[i].pntCenter.x - (this.arrSocket[i].objAnswer.width * 0.5);
				newY = this.arrSocket[i].pntCenter.y - (this.arrSocket[i].objAnswer.height * 0.5);
				this.arrSocket[i].objAnswer.addTween("x:"+newX+",y:"+newY+",time:1");
			}
		}
	};

	/**
	Setup any show answer animations required.
	@param  {void} Nothing
	@return {boolean} True if every socket has the correct object in it and false otherwise.
	*/
	this.check = function() {
		// Setup boolean flag
		var bResult = true;

		// Check if each socket is correct
		for(var i = 0; i < this.arrSocket.length; i++) {
			// Flash the object green if correct and red otherwise
			if(this.arrSocket[i].objAnswer === this.arrSocket[i].objItem) {
				this.arrSocket[i].objAnswer.showCorrect(true);
			} else {
				this.arrSocket[i].objAnswer.showCorrect(false);
				// even if one object is incorrect then everything is incorrect
				bResult = false;
			}
		}
		return bResult;
	};

	/**
	Find the closest empty socket to the passed object.
	@param  {object} objItem Find the socket closest to this socket.
	@return {number} Returns -1 for no sockets within the maxDist and or return the index number of the socket availible.
	*/
	this.findClosest = function(objItem) {
		// Local positioning variables
		var xTemp = 0;
		var yTemp = 0;
		var length = 0;

		// Set a default item -1 to be this.maxDistance pixels^2 away
		// This means the object has to be closer then this.maxDistance pixels^2 to even be considered
		var lowest = this.maxDistance;
		var closest = -1;

		// Go through each socket in the list
		for(var i = 0; i < this.arrSocket.length; i++) {

			//  get the difference between the socket and object
			xTemp = this.arrSocket[i].pntCenter.x - objItem.x;
			yTemp = this.arrSocket[i].pntCenter.y - objItem.y;

			// Calculate length w/o the Math.sqrt for speed
			// Since it's just a comparsion the actual distance it doesn't matter
			length = (xTemp * xTemp) + (yTemp * yTemp);

			// If the length is less then the current lowest record it
			if(length < lowest && this.arrSocket[i].objItem === null) {
				lowest = length;
				closest = i;
			}
		}
		// Return the closest empty socket or -1 if none.
		return closest;
	};

	this.create();
}

/**
Creates a stack of objects.
@class THM_Stack
@param  {object} plugin The monocleGL plugin object.
@param  {object} lyrParent The parent layer to add these objects too.
@param  {object} jStack The stacks JSON definetion.
@param  {object} position Rectangle defination of the question layout.
@return {void} Nothing
*/
function THM_Stack(plugin, lyrParent, jStack, position) {
	this.plugin = plugin;
	this.lyrParent = lyrParent;
	this.jStack = jStack;

	// Get all the stack layout parameters from pos
	this.pos = position;
	this.x = this.pos.layoutX;
	this.y = this.pos.layoutY;
	this.width = this.pos.layoutWidth;
	this.height = this.pos.layoutHeight;

	// Local stack varibles
	this.arrStack = [];
	this.index = 0;

	// Local stack callbacks
	this.funcDrag = undefined;
	this.funcScope = undefined;

	/**
	Creates the stack and adds it to the passed parent. Called internally during creation and only needs to called once.
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.create = function() {

		// Local temporary varibles for randomization
		var swap = 0;
		var randomize = 0;
		var reorder = [];
		var loopBreaker = 0;
		var bRandom = false;

		// Setup array for the random stack order
		for(var i = 0; i < this.jStack.length; i++ ) {
			reorder[i] = i;
		}

		// Continue to loop until the order is random
		while(!bRandom) {
			// If for whatever reason we can't randomize then log error and break out
			if(++loopBreaker > 10) {
				logError("ERROR can't randomize items, continuing with setup");
				break;
			}

			// Go through the stack list and reorder the list
			for(i = 0; i < this.jStack.length; i++ ) {
				randomize = parseInt(Math.random() * this.jStack.length, 10);
				swap = reorder[i];
				reorder[i] = reorder[randomize];
				reorder[randomize] = swap;
			}

			// Check that the new order is truely random
			for(i = 0; i < this.jStack.length; i++ ) {
				if(reorder[i] !== i) bRandom = true;
			}
		}

		for(i = 0; i < this.jStack.length; i++) {
			// Create the stack object
			this.arrStack[i] = new THM_Object(this.plugin, this.lyrParent, i, this.jStack[reorder[i]]);

			// Setup dragging callbacks
			this.arrStack[i].lyrItem.addDragStartCallback(this.arrStack[i], "startDrag");
			this.arrStack[i].lyrItem.addDropCallback(this.arrStack[i], "stopDrag");

			// Set the origin base on it's the stack X and Y parameters
			this.arrStack[i].originX = this.pos.stackX + (i * this.pos.stackOffsetX);
			this.arrStack[i].originY = this.pos.stackY + (i * this.pos.stackOffsetY);

			// Set extra stack varibles for tracking where the object is
			this.arrStack[i].inStack = true;
			this.arrStack[i].objSocket = null;

			// Snap object to it's origin position
			this.arrStack[i].setPosition(this.arrStack[i].originX, this.arrStack[i].originY);

			// Set the the object to be draggable with stack's region and set local callbacks
			this.arrStack[i].lyrItem.setDrag();
			this.arrStack[i].lyrItem.setDragRegion(this.x, this.y, this.width, this.height);
			this.arrStack[i].funcDrag = this.isDragging;
			this.arrStack[i].funcScope = this;
		}
	};

	/**
	The callback from an object that's its being dragged
	@param  {number} numObject The index of the object clicked on.
	@param  {number} bDragging True if the mouse is down and false otherwise.
	@return {void} Nothing
	*/
	this.isDragging = function(numItem, bDragging) {
		if(this.funcDrag !== undefined && this.funcScope !== undefined) {
			this.funcDrag.apply(this.funcScope, arguments);
		}
	};

	/**
	Get the name of an object in the stack and return the object
	@param  {string} name The name of the object we're looking for.
	@return {object} Returns the object reference if found and undefined otherwise.
	*/
	this.getName = function(name) {
		for(var i = 0; i < this.arrStack.length; i++) {
			// If the passed name matches a stack item then return the pointer
			if(this.arrStack[i].strName === name) {
				return this.arrStack[i];
			}
		}
		// Return undefined otherwise and log as an error
		logError("Placement ERROR: Unable to find the name " + name + " in the stack.");
		return undefined;
	};

	/**
	Snap the passed item number to the passed location.
	@param  {number} numItem The object index to snap.
	@param  {number} x The x position to the snap the object to.
	@param  {number} y The y position to the snap the object to.
	@return {void} Nothing
	*/
	this.snap = function(numItem, x, y) {
		this.arrStack[numItem].x = x;
		this.arrStack[numItem].y = y;
		this.arrStack[numItem].setPosition(x, y);
		this.arrStack[numItem].inStack = false;
		this.enable();
	};

	/**
	Set the passed item to tween by to it's origin in the stack.
	@param  {number} numItem The object index to tween back to stack.
	@return {void} Nothing
	*/
	this.origin = function(numItem) {
		this.arrStack[numItem].addTween("x:"+this.arrStack[numItem].originX+",y:"+this.arrStack[numItem].originY+",time:1");
		this.arrStack[numItem].inStack = true;
		this.enable();
	};

	/**
	Snap all the stack object back to the stack.
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.reset = function() {
		this.index = this.arrStack.length - 1;
		for(var i = 0; i < this.arrStack.length; i++) {
			this.arrStack[i].setPosition(this.arrStack[i].originX, this.arrStack[i].originY);
			this.arrStack[i].inStack = true;
		}
		this.enable();
	};

	/**
	Enable only the top of the stack or any objects outside of the stack.
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.enable = function() {
		var last = this.arrStack[0];
		for(var i = 0; i < this.arrStack.length; i++) {
			if(this.arrStack[i].inStack) {
				// Record the top object in stack
				last = this.arrStack[i];
				this.arrStack[i].unsubscribe();
			} else {
				// Subscribe objects if not in stack
				this.arrStack[i].subscribe();
			}
		}
		// Subscribe the top the object in the stack
		last.subscribe();
	};

	/**
	Unsubscribe everything
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.disable = function() {
		for(var i = 0; i < this.arrStack.length; i++) {
			this.arrStack[i].unsubscribe();
		}
	};

	this.create();
}

/**
The placement style question built by JSON
@class THM_PlacementQuestion
@param  {object} plugin The monocleGL plugin object.
@param  {object} configuration The JSON definetion of this question.
@return {void} Nothing
*/
function THM_PlacementQuestion (plugin, configuration) {
	DEBUG_MODE = true;

	// Scene specfic values
	this.plugin = plugin;
    this.id = this.plugin.newScene();
    this.strInstruction = readJSON(configuration.text, "configuration text","Question text");
   	this.strImage = readJSON(configuration.image, "configuration image","");

    // Question status flags
    this.tries = 3;
    this.correct = false;
    this.completed = false;
    this.serverStatus = false;

	// Setup the background layer
    this.bgLayer = new Layer(this.plugin, 0, 0, 480, 320);
    this.bgLayer.setColor(0, 0, 0, 0);

	// Setup the background layer
    this.bgStack = new Layer(this.plugin, 0, 0, 480, 320);
    this.bgStack.setColor(0, 0, 0, 0);

    // Setup the background layer
    this.bgSockets = new Layer(this.plugin, 0, 0, 480, 320);
    this.bgSockets.setColor(0, 0, 0, 0);

	//Demo-specific varibles
	this.position = new Osmosis();
	this.position.stackX = parseInt(readJSON(configuration.stack_x, "configuration stack x","20"),10);
	this.position.stackY = parseInt(readJSON(configuration.stack_y, "configuration stack y","50"),10);
	this.position.stackOffsetX = parseInt(readJSON(configuration.stack_offset_x, "configuration stack offset x","4"),10);
	this.position.stackOffsetY = parseInt(readJSON(configuration.stack_offset_y, "configuration stack offset y","4"),10);
	this.maxDistance = parseInt(readJSON(configuration.max_distance, "configuration maximum snap distance","75"),10);

	// Load the JSON stack and sockets
	this.jStack = readJSON(configuration.stack, "configuration stack",[0,0,0]);
	this.jSockets = readJSON(configuration.sockets, "configuration sockets",[0,0,0]);

	// Load the JSON layout information
	this.position.layoutX = parseInt(readJSON(configuration.x, "configuration layout x","20"),10);
	this.position.layoutY = parseInt(readJSON(configuration.y, "configuration layout y","20"),10);
	this.position.layoutWidth = parseInt(readJSON(configuration.width, "configuration layout width","440"),10);
	this.position.layoutHeight = parseInt(readJSON(configuration.height, "configuration layout height","220"),10);

	// Set the stack and stocket to be null for now
	this.stack = null;
	this.sockets = null;

	/**
	The local call back for dragging the objects.
	@param  {number} numItem The index of the object clicked on.
	@param  {number} bDragging True if the mouse is down and false otherwise.
	@return {void} Nothing
	*/
	this.objDrag = function(numItem, bDragging) {
		// Local temporary varibles
		var numResult = 0;
		var newX = 0;
		var newY = 0;

		// If the object is being dragged
		if(bDragging) {
			// Unsocket the object so a new object can be placed in the socket
			this.sockets.unsocket(this.stack.arrStack[numItem]);

		// If the object was released
		} else {
			// Get the closest socket to the dragged item
			numResult = this.sockets.findClosest(this.stack.arrStack[numItem]);

			// If the result is -1 then nothing was found so tween the object back to the stack
			if(numResult === -1) {
				this.stack.origin(numItem);

			// Snap the center of the object to the socket
			} else {
				// Calculate new object position based on socket and object width and height
				newX = this.sockets.arrSocket[numResult].pntCenter.x - (this.stack.arrStack[numItem].width * 0.5);
				newY = this.sockets.arrSocket[numResult].pntCenter.y - (this.stack.arrStack[numItem].height * 0.5);

				// Record that the object is in the socket so another object can't be placed inside
				this.sockets.arrSocket[numResult].objItem = this.stack.arrStack[numItem];
				this.stack.snap(numItem, newX, newY);
			}
		}
	};

	/**
	Overload the initialize function for a placement question.
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.initQuiz = function() {
		logDebug("Placement question initQuiz()");

		// If a layout image was specified
		if(this.strImage !== "") {
			this.sprImage = new Sprite(this.plugin, mediaURL + slugUUID + this.strImage, 0, 0, 480, 320);
			this.bgLayer.addChild(this.sprImage);
		}

		// Add the socket layer then the stack layer to the background layer
		this.bgLayer.addChild(this.bgSockets);
		this.bgLayer.addChild(this.bgStack);

		// Build up the stack
		this.stack = new THM_Stack(this.plugin, this.bgStack, this.jStack, this.position);
		this.stack.funcDrag = this.objDrag;
		this.stack.funcScope = this;

		// Build up the sockets
		this.sockets = new THM_Sockets(this.plugin, this.bgSockets, this.jSockets, this.stack, this.maxDistance);
	};

	/**
	Overload the display function for a placement question.
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.loadQuiz = function() {
		logDebug("Placement question loadQuiz()");

		// Reset everything back to the begining
		this.stack.reset();
		this.sockets.reset();
	};

	/**
	Overload the clean up  function for a placement question.
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.cleanUp = function() {

		logDebug("Placement question cleanUp()");
		// Unsubscribe the stack
		this.stack.disable();
	};

	/**
	Overload the reset function for a placement question.
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.resetQuiz = function() {
		logDebug("Placement question resetQuiz()");
		this.loadQuiz();
	};

	/**
	Overload the show correct answer function for a placement question.
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.showCorrectAnswer = function() {
		logDebug("Placement question showCorrectAnswer()");
		this.sockets.showAnimation();
	};

	/**
	Overload the check answer function for a placement question.
	@param  {void} Nothing
	@return {boolean} True if correct and false otherwise.
	*/
	this.checkAnswer = function() {
		logDebug("Placement question checkAnswer()");
		return this.sockets.check();
	};

	/**
	Adds this scene to the plugin.
	@param  {void} Nothing
	@return {void} Nothing
	*/
    this.addScene = function() {
        this.plugin.addScene(this.id);
    };

	/**
	Changes to the next scene in the plugin.
	@param  {void} Nothing
	@return {void} Nothing
	*/
    this.nextScene = function() {
        this.plugin.nextScene();
    };

	/**
	Changes to the previous scene in the plugin.
	@param  {void} Nothing
	@return {void} Nothing
	*/
    this.prevScene = function() {
        this.plugin.prevScene();
    };

	/**
	Sets the current scene to this one.
	@param  {void} Nothing
	@return {void} Nothing
	*/
    this.setScene = function() {
        this.plugin.setScene(this.getId());
    };

	/**
	Sets the number of tries for this scene.
	@param  {number} tries The number of tries for this scene
	@return {void} Nothing
	*/
    this.setTries = function(tries) {
        if(typeof tries !== "number") {
            return;
        }
        this.tries = tries;
    };

	/**
	Decrements the number of tries by one.
	@param  {void} Nothing
	@return {void} Nothing
	*/
    this.decrementTries = function() {
        if(!(this.tries === 0)) {
            this.tries = this.tries - 1;
        }
    };

	/**
	Gets the number of tries for this scene.
	@param  {void} Nothing
	@return {number} The number of tries for this scene
	*/
    this.getTries = function() { return this.tries; };

	/**
	Sets if the scene is correct
	@param  {boolean} correct True if this scene is correct and false otherwise
	@return {void} Nothing
	*/
    this.setCorrect = function(correct) {
        if(typeof correct !== "boolean") {
            logError("correct must have a value of type 'boolean'");
            return;
        }
        this.correct = correct;
        this.completed = true;
    };

	/**
	Gets if the scene is correct
	@param  {void} Nothing
	@return {boolean} True if this scene is correct and false otherwise
	*/
    this.getCorrect = function() { return this.correct; };

	/**
	Sets if the scene is completed
	@param  {boolean} completed True if this scene is completed and false otherwise
	@return {void} Nothing
	*/
    this.setCompleted = function(completed) {
        if(typeof completed !== "boolean") {
            logError("completed must have a value of type 'boolean'");
            return;
        }
        this.completed = completed;
    };

	/**
	Gets if the scene is completed
	@param  {void} Nothing
	@return {boolean} True if this scene is completed and false otherwise
	*/
    this.getCompleted = function() { return this.completed; };

	/**
	Sets if the scene status has been recieved by the server
	@param  {boolean} serverStatus True if this scenes status has been recieved by the server and false otherwise
	@return {void} Nothing
	*/
    this.setServerStatus = function(serverStatus) {
        if(typeof serverStatus !== "boolean") {
            logError("serverStatus must have a value of type 'boolean'");
            return;
        }
        this.serverStatus = serverStatus;
    };

	/**
	Gets if the scene status has been recieved by the server
	@param  {void} Nothing
	@return {boolean} True if this scenes status has been recieved by the server and false otherwise
	*/
    this.getServerStatus = function() { return this.serverStatus; };
}
THM_PlacementQuestion.prototype = new Osmosis();
