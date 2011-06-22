/*! THM_point.js */
// ---------------------------------------------------------------------
// A two dimensional point class for MGL
// Author: Ethan Greavette
// Date: 7/07/2010
// Comments: Contains a x,y point location
// ---------------------------------------------------------------------

/**
A class for representing a two dimensional point.
@class Point
@param  {number} passX The x position of the point
@param  {number} passY The y position of the point
@return {void} Nothing
*/
function Point(passX, passY)
{
	// Optional parameter x, y default to 0
	if ( passX === undefined ) { this.x = 0; } else { this.x = passX; }
	if ( passY === undefined ) { this.y = 0; } else { this.y = passY; }

	/**
	This function checks if another point is equal to "this" one.
	@param  {object} comparedPoint The point to compare "this" point to.
	@return {boolean} True if this point equals the passed in point and false otherwise.
	*/
	this.equals = function(comparedPoint) {
		if(this.y === comparedPoint.y && this.x === comparedPoint.x) {
			return true;
		} else {
			return false;
		}
	};

	/**
	Create a copy of this point and return it.
	@param {void} Nothing.
	@return {object} Returns a new copy of this point.
	*/
	this.clone = function() {
		var tempPoint = new Point(this.x,this.y);
		return tempPoint;
	};

	/**
	Normalizes this point to be in between 0-1.
	@param {void} Nothing.
	@return {void} Nothing.
	*/
	this.normalize = function() {
		var length = Math.sqrt ( this.x*this.x + this.y*this.y );
		this.x=this.x/length;
		this.y=this.y/length;
	};

	/**
	Offset this point by the passed in numbers
	@param  {number} passX The new x position to offset this point by.
	@param  {number} passY The new y position to offset this point by.
	@return {void} Nothing
	*/
	this.offset = function(pass_dx,pass_dy)	{
		var dx;
		var dy;
		if ( pass_dx === undefined ) { dx = 0; } else { dx = pass_dx; }
		if ( pass_dy === undefined ) { dy = 0; } else { dy = pass_dy; }
		this.x+=dx;
		this.y+=dy;
	};

	/**
	Return a string containing the x and y positions
	@param {void} Nothing.
	@return {string} The x and y positions in a formatted string
	*/
	this.toString = function() {
		return "(x=" + this.x + ", y=" + this.y + ")";
	};
}

/**
Create a new point inbetween the two points passed in and the ratio of the new point.
@class interpolatePoints
@param  {object} point1 The frist point to interpolate inbetween.
@param  {object} point2 The second point to interpolate inbetween.
@param	{number} f The ratio between (0-1) with 0 being point2 and 1 being point1.
@return {object} The new interpolated point.
*/
function interpolatePoints(point1, point2, f)
{
	var interpolatedPoint = new Point();
	var deltaX = point2.x - point1.x;
	var deltaY = point2.y - point1.y;

	interpolatedPoint.x = point2.x - deltaX * f;
	interpolatedPoint.y = point2.y - deltaY * f;

	return interpolatedPoint;
}

/**
Measures the distance inbetween the two points passed in.
@class distancePoints
@param  {object} point1 The frist point to measure from.
@param  {object} point2 The second point to measure to.
@return {number} The distance inbetween the two passed in points.
*/
function distancePoints(point1, point2)
{
	var distance;
	var deltaX = point2.x - point1.x;
	var deltaY = point2.y - point1.y;

	distance = Math.sqrt((deltaX*deltaX)+(deltaY*deltaY));
	return distance;
}