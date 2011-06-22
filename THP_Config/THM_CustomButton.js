//------------------------------------------------------------------------------
// A custom button class
function THM_CustomButton(plugin, text, x, y, width, height){
	this.plugin = plugin;
	this.width = width;
	this.height = height;
	this.x = x;
	this.y = y;
	this.text = text;

	// Create the button
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

	// Set the border color
	this.setBorderColor = function(r, g, b, a){
		this.borderCol.setColor(r, g, b, a);
		this.background.setBorderColor(r, g, b, a);
	};

	// Set the background color
	this.setColor = function(r, g, b, a){
		this.bgCol.setColor(r, g, b, a);
		this.background.setColor(r, g, b, a);
	};

	// Set the text caption color
	this.setCaptionColor = function(r, g, b, a){
		this.textColor.setColor(r, g, b, a);
		this.label.setCaptionColor(r, g, b, a);
	};

	// Set the up callback of the invisible sprite
	this.upCallback = function(object, func){
		this.inv.upCallback(object, func);
	};

	// Set the down callback of the invisible sprite
	this.downCallback = function(object, func){
		this.inv.downCallback(object, func);
	};

	// Set the text of the label
	this.setText = function(text){
		this.text = text;
		this.label.setText(this.text);
	};

	// Subscribe the invisible sprite
	this.subscribe = function(){
		this.inv.subscribe();
	};

	// Unsubscribe the invisible sprite
	this.unsubscribe = function(){
		this.inv.unsubscribe();
	};

	this.create();
}
THM_CustomButton.prototype = new Osmosis();
