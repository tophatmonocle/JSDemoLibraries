//------------------------------------------------------------------------------
// Socket Item data structure
function THM_Socket(x, y, objAnswer) {
	// Local socket varibles
	this.pntCenter = new Point(x,y);
	this.objAnswer = objAnswer;
	this.objItem = null;
}

//------------------------------------------------------------------------------
// Socket List the list of all the socket items
function THM_Sockets(plugin, lyrParent, jSockets, stack, maxDist) {
	// Local socket list varibles
	this.plugin = plugin;
	this.arrSocket = [];
	this.lyrParent = lyrParent;
	this.jSockets = jSockets;
	this.stack = stack;
	this.maxDistance = maxDist * maxDist;

	// Create the socket list based on the socket JSON
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

	// Reset of the sockets to be empty
	this.reset = function() {
		for(var i = 0; i < this.arrSocket.length; i++) {
			this.arrSocket[i].objItem = null;
		}
	};

	// Go through the sockut list and unsocket any item that matches
	this.unsocket = function(objItem) {
		for(var i = 0; i < this.arrSocket.length; i++) {
			if(this.arrSocket[i].objItem === objItem) {
				this.arrSocket[i].objItem = null;
			}
		}
	};

	// Setup any show answer animations required
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

	// Check if all the objects are in the correct location
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

	// Find the closest empty socket to the passed object
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

//------------------------------------------------------------------------------
// Create a stack of objects
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

	// Setup the item and add it to the passed parent
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

	// The callback from an item that's its being dragged
	this.isDragging = function(numItem, bDragging) {
		if(this.funcDrag !== undefined && this.funcScope !== undefined) {
			this.funcDrag.apply(this.funcScope, arguments);
		}
	};

	// Get the name of an object in the stack and return the object
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

	// Snap the passed item number to the passed location
	this.snap = function(numItem, x, y) {
		this.arrStack[numItem].x = x;
		this.arrStack[numItem].y = y;
		this.arrStack[numItem].setPosition(x, y);
		this.arrStack[numItem].inStack = false;
		this.enable();
	};

	// Set the passed item to tween by to it's origin
	this.origin = function(numItem) {
		this.arrStack[numItem].addTween("x:"+this.arrStack[numItem].originX+",y:"+this.arrStack[numItem].originY+",time:1");
		this.arrStack[numItem].inStack = true;
		this.enable();
	};

	// Snap all the stack object back to the stack
	this.reset = function() {
		this.index = this.arrStack.length - 1;
		for(var i = 0; i < this.arrStack.length; i++) {
			this.arrStack[i].setPosition(this.arrStack[i].originX, this.arrStack[i].originY);
			this.arrStack[i].inStack = true;
		}
		this.enable();
	};

	// Enable only the top of the stack or any objects outside of the stack
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

	// Unsubscribe everything
	this.disable = function() {
		for(var i = 0; i < this.arrStack.length; i++) {
			this.arrStack[i].unsubscribe();
		}
	};

	this.create();
}

//------------------------------------------------------------------------------
// The placement style question built by JSON
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

	// The local call back for dragging the objects
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

	// Set the initialize function for Placement Question
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

	// Set the display function for Placement Question
	this.loadQuiz = function() {
		logDebug("Placement question loadQuiz()");

		// Reset everything back to the begining
		this.stack.reset();
		this.sockets.reset();
	};

	// Set the clean up function for Placement Question
	this.cleanUp = function() {

		logDebug("Placement question cleanUp()");
		// Unsubscribe the stack
		this.stack.disable();
	};

	// Set the reset function for Placement Question
	this.resetQuiz = function() {
		logDebug("Placement question resetQuiz()");
		this.loadQuiz();
	};

	// Set the show correct answer function for Placement Question
	this.showCorrectAnswer = function() {
		logDebug("Placement question showCorrectAnswer()");
		this.sockets.showAnimation();
	};

	// Set the check answer function for Placement Question
	this.checkAnswer = function() {
		logDebug("Placement question checkAnswer()");
		return this.sockets.check();
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
THM_PlacementQuestion.prototype = new Osmosis();
