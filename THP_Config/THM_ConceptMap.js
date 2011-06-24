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
