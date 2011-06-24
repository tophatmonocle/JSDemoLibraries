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
