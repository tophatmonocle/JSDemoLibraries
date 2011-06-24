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
