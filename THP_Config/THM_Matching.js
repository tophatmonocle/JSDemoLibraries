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
