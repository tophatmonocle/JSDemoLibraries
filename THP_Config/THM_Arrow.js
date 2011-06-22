var fastMath;

//------------------------------------------------------------------------------
// A generic object with a background rectangle and label
function THM_Arrow(plugin, lyrParent) {
	// Setup local varibles
    this.plugin = plugin;
	this.lyrParent = lyrParent;

	// All the important points for drawing the line
	this.pntStart = new Point(0,0);
	this.pntEnd = new Point(0,0);
	this.pntRight = new Point(0,0);
	this.pntLeft = new Point(0,0);

	// The vectors of each line
	this.vecMain = new circleVector(0,0);
	this.vecLeft = new circleVector(0,0);
	this.vecRight = new circleVector(0,0);

	// Arrow presets
	this.numLegLength = 10;
	this.numLegAngle = 135;

	// Create the singleton class for fast math if it hasn't been created before
	if(fastMath === undefined) {
		fastMath = new THM_fastMath();
	}

	// Setup the item and add it to the passed parent
	this.create = function() {
		// Create the 3 lines for the arrow
		this.lineMain = new Line(this.plugin, 0, 0, 0, 0);
		this.lineRight = new Line(this.plugin, 0, 0, 0, 0);
		this.lineLeft = new Line(this.plugin, 0, 0, 0, 0);

		// Add all the lines to the parent layer
		this.lyrParent.addChild(this.lineMain);
		this.lyrParent.addChild(this.lineRight);
		this.lyrParent.addChild(this.lineLeft);
	};

	// Set the start point of the arrow and redraw the arrow
	this.setStart = function(x,y) {
		this.pntStart.x = x;
		this.pntStart.y = y;
		this.drawArrow();
	};

	// Set the end point of the arrow and redraw the arrow
	this.setEnd = function(x,y) {
		this.pntEnd.x = x;
		this.pntEnd.y = y;
		this.drawArrow();
	};

	// Set the thickness of each of the lines
	this.setThickness = function(thickness) {
		this.lineMain.setThickness(thickness);
		this.lineRight.setThickness(thickness);
		this.lineLeft.setThickness(thickness);
	};

	// Set the color of each of the lines
	this.setColor = function(r,g,b,a) {
		this.lineMain.setColor(r,g,b,a);
		this.lineRight.setColor(r,g,b,a);
		this.lineLeft.setColor(r,g,b,a);
	};

	// Set the length of the both arrow legs and redraw the arrow
	this.setLegLength = function(length) {
		this.numLegLength = length;
		this.drawArrow();
	};

	// Set the angle of the both arrow legs and redraw the arrow
	this.setLegAngle = function(angle) {
		this.numLegAngle = angle;
		this.drawArrow();
	};

	// Draw the arrow based on the start and end point
	this.drawArrow = function() {
		// Figure out the vector of the arrow
		this.vecMain.radial = distancePoints(this.pntStart, this.pntEnd);
		this.vecMain.theta = piecewiseArcTan(this.pntStart, this.pntEnd);

		// Set the vector of the right leg
		this.vecRight.radial = this.numLegLength;
		this.vecRight.theta = this.vecMain.theta + this.numLegAngle;

		// Get the point based on the right leg vector and arrow end point
		this.pntRight = fastMath.moveVector2D(this.pntEnd,this.vecRight);

		// Set the vector of the left leg
		this.vecLeft.radial = this.numLegLength;
		this.vecLeft.theta = this.vecMain.theta - this.numLegAngle;

		// Get the point based on the right leg vector and arrow end point
		this.pntLeft = fastMath.moveVector2D(this.pntEnd,this.vecLeft);

		// Set both points of the main line
		this.lineMain.setPosition(this.pntStart.x, this.pntStart.y);
		this.lineMain.setDimensions(this.pntEnd.x, this.pntEnd.y);

		// Set both points of the right leg line
		this.lineRight.setPosition(this.pntEnd.x, this.pntEnd.y);
		this.lineRight.setDimensions(this.pntRight.x, this.pntRight.y);

		// Set both points of the left leg line
		this.lineLeft.setPosition(this.pntEnd.x, this.pntEnd.y);
		this.lineLeft.setDimensions(this.pntLeft.x, this.pntLeft.y);
	};

	// Create the item
	this.create();
}
THM_Object.prototype = new Osmosis();

// Figure out the arc tan of two points in degrees without using the slow Math librarys
function piecewiseArcTan(pointA, pointB) {
	// Figure out the x and y deltas
	var dx = pointA.x - pointB.x;
	var dy = pointA.y - pointB.y;

	// Generate the absolute delta values for the line
	var absDx = dx;
	var absDy = dy;
	if (absDx < 0) absDx *= -1;
	if (absDy < 0) absDy *= -1;

	// Holds the resultant answer
	var result = 0;

	// Using the octant that the line is in apply the approperate formula
	if(dx > 0) {
		if(dy > 0) {
			if(absDx < absDy) {
				// Octant 1
				result = 1 + (1 - (absDx/absDy));
			} else {
				// Octant 0
				result = absDy / absDx;
			}
		} else {
			if(absDx > absDy) {
				// Octant 7
				result = 7 + (1 - (absDy / absDx));
			} else {
				// Octant 6
				result = 6 + (absDx / absDy);
			}
		}
	} else {
		if(dy < 0) {
			if(absDx < absDy) {
				// Octant 5
				result = 5 + (1 - (absDx / absDy));
			} else {
				// Octant 4
				result = 4 + (absDy / absDx);
			}
		} else {
			if(absDx > absDy) {
				// Octant 3
				result = 3 + (1 - (absDy / absDx));
			} else {
				// Octant 2
				result = 2 + (absDx / absDy);
			}
		}
	}

	// Scale the result to be between 0-359
	result = 270 - (result * 45);
	if(result < 0) result += 360;

	return result;
}

