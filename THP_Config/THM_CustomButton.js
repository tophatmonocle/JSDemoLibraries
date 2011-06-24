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
