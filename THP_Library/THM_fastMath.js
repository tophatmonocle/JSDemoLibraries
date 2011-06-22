/*! THM_fastMath.js */
// ---------------------------------------------------------------------
// An optimized math library for MGL
// Author: Ethan Greavette
// Created: 6/21/2011
// Comments: Create a look up table for sine and cosine values
// ---------------------------------------------------------------------

/**
Create a look up table for sine and cosine values and wrap them into a class.
@class THM_fastMath
@return {void} Nothing
@return {void} Nothing
*/
function THM_fastMath() {
	var sinTable = new Array(3600);
	var cosTable = new Array(3600);

	for(var i = 0 ; i < 3600 ; i++)	{
		sinTable[i] = Math.sin((Math.PI/1800)*i);
		cosTable[i] = Math.cos((Math.PI/1800)*i);
	}

	/**
	Return the sine value of the passed angle.
	@param  {number} passAngle The angle to get the sine of.
	@return {number} The sine value of the passed angle.
	*/
	this.sin = function(passAngle) {
		this.theta = Math.round(passAngle*10);
		this.checkAngles();
		return sinTable[this.theta];
	};

	/**
	Return the cosine value of the passed angle.
	@param  {number} passAngle The angle to get the cosine of.
	@return {number} The cosine value of the passed angle.
	*/
	this.cos = function(passAngle) {
		this.theta = Math.round(passAngle*10);
		this.checkAngles();
		return cosTable[this.theta];
	};

	/**
	Return the tangent value of the passed angle.
	@param  {number} passAngle The angle to get the tangent of.
	@return {number} The tangent value of the passed angle.
	*/
	this.tan = function(passAngle) {
		this.theta = Math.round(passAngle*10);
		this.checkAngles();
		//Should return some arbitrary value if cosTable=0;
		return (sinTable[this.theta]/cosTable[this.theta]);
	};

	/**
	Ensure the theta angle is inbetween 0 and 360 degrees.
	@param {void} Nothing.
	@return {void} Nothing.
	*/
	this.checkAngles = function() {
		while(this.theta< 0 || this.theta>= 3600)
		{
			if(this.theta >= 3600) {
				this.theta -= 3600;
			}
			else if(this.theta < 0) {
				this.theta += 3600;
			}
		}
	};

	/**
	Takes in a point and vector then traverses the point along vector and returns the new point.
	@param {object} passPoint The point to start with before the traversal.
	@param {object} passCircleVector The vector to traverse the passed point along.
	@return {object} The resulting point after the traversal.
	*/
	this.moveVector2D = function(passPoint,passCircleVector)
	{
		passCircleVector.checkAngles();
		var tempPoint = new Point();

		tempPoint.x = passPoint.x + passCircleVector.radial*this.sin(passCircleVector.theta);
		tempPoint.y = passPoint.y + passCircleVector.radial*this.cos(passCircleVector.theta);

		return tempPoint;
	};
}
