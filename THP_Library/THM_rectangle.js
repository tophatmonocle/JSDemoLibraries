/*! THM_rectangle.js */
// ---------------------------------------------------------------------
// A two dimensional rectangle class for MGL
// Author: Ethan Greavette
// Date: 7/07/2010
// Comments: Contain a x, y, width and height box
// ---------------------------------------------------------------------

/**
A class for representing a two dimensional rectangle.
@class Rectangle
@param  {number} passX The x position of the rectangle.
@param  {number} passY The y position of the rectangle.
@param  {number} passW The width of the rectangle.
@param  {number} passH The height of the rectangle.
@return {void} Nothing
*/
function Rectangle(passX, passY, passW, passH) {

	// Optional parameter default to default to 0
	if ( passX === undefined ) { this.x = 0; } else {this.x = passX;}
	if ( passY === undefined ) { this.y = 0; } else {this.y = passY;}
	if ( passW === undefined ) { this.width = 0; } else {this.width = passW;}
	if ( passH === undefined ) { this.height = 0; } else {this.height = passH;}

	/**
	Checks if two rectangles intersect.
	@param  {object} passRect The rectangle to test against this rectangle.
	@return {boolean} Return true if the rectangles intersect or false otherwise.
	*/
	this.intersects = function(passRect) {
	    if( ((this.x + this.width) < passRect.x) || ((passRect.x + passRect.width) < this.x) || ((this.y + this.height) < passRect.y) || ((passRect.y + passRect.height) < this.y)) {
		   return false;
		} else {
		   return true;
		}
	};

	/**
	Checks if this rectangle contains the passed in point
	@param  {object} passPoint The point to test against this rectangle.
	@return {boolean} Return true if the rectangle contains the passed point or false otherwise.
	*/
	this.containsPoint = function(passPoint) {
		if(passPoint.x >= this.x && passPoint.x <= (this.x + this.width) && passPoint.y >= this.y && passPoint.y <= (this.y + this.height)) {
			return true;
		} else {
			return false;
		}
	};

	/**
	Checks if this rectangle contains the passed in rectangle completely.
	@param  {object} passRect The rectangle to test against this rectangle.
	@return {boolean} Return true if the rectangle contains the passed rectangle or false otherwise.
	*/
	this.containsRect = function(passRect) {
		var testRect = passRect;
		var point1 = new Array();
		var point2 = new Array();
		var counter = 0;

		point1.push(new Point(this.x,this.y));
		point1.push(new Point(this.x+this.width,this.y+this.height));

		point2.push(new Point(passRect.x,passRect.y));
		point2.push(new Point(passRect.x+passRect.width,passRect.y+passRect.height));

		for(var i = 0 ; i < point2.length ; i++) {
			if(point2[i].x >= point1[0].x && point2[i].x <= point1[1].x && point2[i].y >= point1[0].y && point2[i].y <= point1[1].y) {
				counter++;
			}
		}
		if(counter==2) {
			return true;
		} else {
			return false;
		}
	};

	/**
	Create a copy of this rectangle and return it.
	@param {void} Nothing.
	@return {object} Returns a new copy of this rectangle.
	*/
	this.clone = function() {
		var tempRect = new Rectangle(this.x, this.y, this.width, this.height);
		return tempRect;
	};
}
