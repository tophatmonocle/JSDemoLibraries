/*! THM_circleVector.js */
// ---------------------------------------------------------------------
// A two dimensional vector for MGL
// Author: Ethan Greavette
// Created: 6/21/2011
// Comments: A class for representing a polar angle and magnitude.
// ---------------------------------------------------------------------

/**
A class for representing a polar angle and magnitude.
@class circleVector
@param  {number} passRadial The magnitude of the vector
@param  {number} passTheta The angle of the vector
@return {void} Nothing
*/
function circleVector(passRadial, passTheta)
{
    this.radial = 0;
	this.theta = 0;

	/**
	Change both values of this vector and check that they are valid.
	@param  {number} passRadial The magnitude of the vector.
	@param  {number} passTheta The angle of the vector.
	@return {void} Nothing.
	*/
	this.setVector = function(passRadial, passTheta) {
		this.radial = passRadial;
		this.theta = passTheta;
		this.checkAngles();
	};

	/**
	Create a copy of this vector and return it.
	@param {void} Nothing.
	@return {object} Returns a new copy of this vector.
	*/
	this.clone = function() {
		var ret= new circleVector();
		ret.setVector(this.radial, this.theta);
		return ret;
	};

	/**
	Add the passed angle to the current angle and check to make sure it's valid.
	@param  {number} passTheta A new angle to add to this current angle of the vector.
	@return {void} Nothing.
	*/
	this.addTheta = function(passTheta) {
		this.theta += passTheta;
		this.checkAngles();
	};

	/**
	Ensure the theta angle is inbetween 0 and 360 degrees.
	@param {void} Nothing.
	@return {void} Nothing.
	*/
	this.checkAngles = function() {
		while(this.theta < 0 || this.theta >= 360)
		{
			if(this.theta < 0) this.theta += 360;
			if(this.theta >= 360) this.theta -= 360;
		}
	};

	/**
	Set this vector to the magnitude and angle of the passed points.
	@param  {object} startPoint The start point of the new vector.
	@param  {object} endPoint The end point of the new vector.
	@return {void} Nothing.
	*/
	this.getPolar = function(startPoint, endPoint) {
		var ret= -1;
		var x = startPoint.x - endPoint.x;
		var y = (320- startPoint.y) - (320 - endPoint.y);

		// Get length
		radial = distancePoints(startPoint,endPoint);

		// do special cases first of 0, 90, 180, 270 angles
		if (startPoint.x == endPoint.x && startPoint.y == endPoint.y) ret = 0;

		if (startPoint.x == endPoint.x && startPoint.y < endPoint.y)  ret = 90;
		if (startPoint.x == endPoint.x && startPoint.y > endPoint.y)  ret = 270;

		if (startPoint.y == endPoint.y && startPoint.x > endPoint.x)  ret = 180;
		if (startPoint.y == endPoint.y && startPoint.x < endPoint.x)  ret = 0;

		// Check if we already have answer
		if(ret != -1)
		{
			this.theta = ret;
			return ret;
		}

		// test which side we are on
		if(x < 0  && y < 0)
			ret = Math.atan(y/x) * (180 / Math.PI);
		else if (x < 0 && y > 0)
			ret = 360 + Math.atan(y/x) * (180 / Math.PI);
		else
			ret = 180 + (Math.atan(y/x) * (180 / Math.PI));

		this.theta = ret;
		return ret;
	};

	// Make sure the passed in values are defined
	if(passRadial===undefined) {
		passRadial=0;
	}
	if(passTheta===undefined) {
		passTheta=0;
	}

	//
	this.setVector(passRadial, passTheta);
}
