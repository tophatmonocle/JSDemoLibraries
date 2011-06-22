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
/*! osmosis.js */
// ---------------------------------------------------------------------
// Osmosis Objected Oriented Compatibility Layer for MGL
// Author: Anson MacKeracher, Ethan Greavette
// Created: 6/9/2010
// Comments: This "library" acts as an intermetiate layer between monocleGL
//           and the JavaScript that implements the demo. Use this library
//           to access the plugin in a more object oriented way.
// ---------------------------------------------------------------------

var DEBUG_MODE = false;
var targetURL = "www.tophatmonocle.com";
var node_map = {};

/**
Trigger an event to a node
@class monoclegl_trigger_event
@param  {void} Nothing
@return {void} Nothing
*/
var monoclegl_trigger_event = function() {
    try {
        var args = Array.prototype.slice.call(arguments);
        var node_id = args.shift();
        var node = node_map[node_id];
        if (node != undefined) {
            setTimeout(function() { node.trigger.apply(node, args); }, 0);
        }
    } catch (error) {
        logError("Error in trigger event.\n -> " + error);
    }
};
/**
Setup up monocleGL trigger events
@class monoclegl_initialize
@param  {object} plugin The monocleGL plugin object
@return {void} Nothing
*/
var monoclegl_initialize = function(plugin) {
    try {
        plugin.initialize(monoclegl_trigger_event);
    } catch (error) {
        logError("Error initializing monocleGL.\n -> " + error);
    }
};

/**
Safe debug logging
@class logDebug
@param  {string} passStr The debug string to print out to console
@return {void} Nothing
*/
function logDebug(passStr) {
    if(typeof console !== 'undefined' && DEBUG_MODE) {
        console.log(passStr);
    }
}

/**
Safe error logging
@class logError
@param  {string} passStr The error string to print out to console
@return {void} Nothing
*/
function logError(passStr) {
    if(typeof console !== 'undefined') {
        console.log(passStr);
    }
}

/**
The abstract layer in between the plugin and JavaScript
@class Osmosis
@param  {void} Nothing
@return {void} Nothing
*/
function Osmosis() {
    this.boolSubscribed = false;
    this.boolCallbacks = false;

    this.x = 0.0;
    this.y = 0.0;
    this.width = 0.0;
    this.height = 0.0;
	this.scale = 1.0;
    this.rotation = 0.0;
    this.centerX = 0.5;
    this.centerY = 0.5;

	/**
	This callback is called automatically by the plugin whenever a node position, rotation or scale changes
	@param  {number} x The new x position of the node
	@param  {number} y The new y position of the node
	@param  {number} width The new width of the node
	@param  {number} height The new height of the node
	@param  {number} scale The new scale of the node
	@param  {number} rotation The new rotation of the node
	@param  {number} centerX The new x position center point of the node
	@param  {number} centerY The new y position center point of the node
	@return {void} Nothing
	*/
	this.updateCallback = function(x, y, width, height, scale, rotation, centerX, centerY) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.scale = scale;
        this.rotation = rotation;
        this.centerX = centerX;
        this.centerY = centerY;
    };

	/**
	This function returns an array of all the callbacks for this node of the passed in type
	@param  {string} type The type of callback we are interested in
	@return {array} Returns a list of callbacks of the passed in type
	*/
	this.getCallbacksByType = function(type) {
        if (typeof type !== "string") {
            logError("getCallbacksByType argument must be string type");
        }

        if (this.callbacks[type] === undefined) {
            logError("No callbacks of type " + type + " defined");
            return [];
        }

        return this.callbacks[type];
    };

	/**
	Bind adds a new callback to this nodes callback list
	@param  {string} eventType The type bucket to add the callback to
	@param  {object} funcObject The functor (function pointer) that the callback uses
	@param  {object} global Reference to the global namespace (for future compatibility)
	@return {void} Nothing
	*/
    this.bind = function(eventType, funcObject, global) {
        try {
            // Inform MGL that we are listening for events of type eventType (pruned for duplicates)
            if (this.callbacks[eventType].length === 0) {
                this.listen(eventType);
            }

            this.callbacks[eventType].push(funcObject);
        } catch (error) {
            //debugger;
            logError("Unable to bind callback of type " + eventType + ".\n -> " + error);
        }
    };

	/**
	Listen lets the plugin know when it's interest in an event type
	@param  {string} eventType The type of callback we are interested in
	@return {void} Nothing
	*/
    this.listen = function(eventType) {
        this.plugin.listen(this.id, eventType);
    };

	/**
	Trigger is usualy called by the plugin to notify a node that a event has occured
	@param  {void} Nothing
	@return {void} Nothing
	*/
    this.trigger = function() {
        var args = Array.prototype.slice.call(arguments);
        var event_type = args.shift();
        var cb_list = this.getCallbacksByType(event_type);

        var number = cb_list.length;
        for (var i = 0; i < number; i++) {
            if (typeof cb_list[i] === "object") {
                var cb_obj;
                var cb_func;

                // Tweener events have a special tween_id to keep track of their associated callbacks
                if (event_type === "tween_finished") {
                    // Check if the event's tween_id matches the callback's tween_id
                    var tween_id = args.shift();
                    if (cb_list[i].tween_id === tween_id) {
                        // Only call functions listening for this tween
                        cb_obj = cb_list[i].obj;
                        cb_func = cb_list[i].func;
                        cb_obj[cb_func].apply(cb_obj, args);

                        // Remove the callback from the callback list
                        cb_list.splice(i, 1);

                        i--;
                        number--;
                    }
                    continue;
                }

                // Physics events have an associated "other" node
                if (event_type === "physics_collision") {
                    var other_node = args.shift();
                    if (cb_list[i].node === other_node) {
                        // Only call functions listening for collisions between these nodes
                        cb_obj = cb_list[i].obj;
                        cb_func = cb_list[i].func;
                        cb_obj[cb_func].apply(cb_obj, args);
                    }
                    continue;
                }

                // All other callbacks are executed in the following way
                cb_obj = cb_list[i].obj;
                cb_func = cb_list[i].func;
                cb_obj[cb_func].apply(cb_obj, args);
            } else if (typeof cb_list[i] === "function") {
                cb_list[i].apply(null, args);
            } else {
                logError("Callback function object: " + cb_list[i] + " is invalid at index: " + i);
            }
        }
    };


	/**
	Init function sets up the 'preemptive' position callback. This callback is called before impressionist calls Drop callbacks, Animation finished callbacks, drop down changed callbacks, etc. We maintain consistency in the JavaScript through the liberal use of this callback mechanism.
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.init = function() {
        // Add this node's instance to the node map
        node_map[this.id] = this;

        // Initialize callback list
        this.callbacks = {
            // TODO: Add more callback types!
            "mouse_down" : [],
            "mouse_up" : [],
            "mouse_over" : [],
            "mouse_moved" : [],
            "mouse_out" : [],
            "mouse_drag" : [],
            "mouse_drag_start" : [],
            "mouse_drag_enter" : [],
            "mouse_drag_exit" : [],
            "mouse_drop" : [],
            "position_changed" : [],
            "text_changed" : [],
            "tween_finished" : [],
            "enter_pressed" : [],
            "focus_changed" : [],
            "drop_down_changed" : [],
            "preload_update" : [],
            "preload_complete" : [],
            "physics_collision" : []
        };

        this.bind("position_changed", { "obj" : this, "func" : "updateCallback" });
    };

    /**
	getID is an accessor function returns the node ID plugin number of this node
	@param  {void} Nothing
	@return {string} The id number of this node
	*/
    this.getId = function() { return this.id; };

    /**
	Sets the x and y position of this node
	@param  {number} x The new x position of this node
	@param  {number} y The new y position of this node
	@return {void} Nothing
	*/
    this.setPosition = function(x, y) {
        if(typeof x !== "number" || typeof y !== "number") {
            logError("Invalid coordinates supplied for " + getId());
            return;
        }

        if(!this.checkId()) {
            return;
        }

        this.x = x;
        this.y = y;
        this.plugin.positionIs(this.id, this.x, this.y, this.width, this.height);
    };

	/**
	Sets the width and height dimensions of this node
	@param  {number} width The new width dimension of this node
	@param  {number} height The new height dimension of this node
	@return {void} Nothing
	*/
    this.setDimensions = function(width, height) {
        if(typeof width !== "number" || typeof height !== "number") {
            logError("Invalid height or width supplied for " + getId());
            return;
        }

        if(!this.checkId()) {
            return;
        }

        this.width = width;
        this.height = height;
        this.plugin.positionIs(this.id, this.x, this.y, this.width, this.height);
    };

	/**
	Sets the scale of this node with 1.0 being 1:1 ratio
	@param  {number} scale The new scale of this node
	@param  {number} centerX The new x position center point of the node
	@param  {number} centerY The new y position center point of the node
	@return {void} Nothing
	*/
    this.setScale = function(scale, centerX, centerY) {
		if(!this.checkId()) {
            return;
        }

        if( typeof scale !== 'undefined') {
            this.scale = scale;
        }

		if( typeof centerX !== 'undefined' ) {
            this.centerX = centerX;
        }

        if( typeof centerY !== 'undefined' ) {
            this.centerY = centerY;
        }

        this.plugin.orientationIs(this.id, this.scale, this.rotation, this.centerX, this.centerY);
    };

	/**
	Sets the rotation of this node in degrees
	@param  {number} rotation The new rotation of this node
	@param  {number} centerX The new x position center point of the node
	@param  {number} centerY The new y position center point of the node
	@return {void} Nothing
	*/
	this.setRotation = function(rotation, centerX, centerY) {
		if(!this.checkId()) {
            return;
        }

        if( typeof rotation !== 'undefined' ) {
            this.rotation = rotation;
        }

		if( typeof centerX !== 'undefined' ) {
            this.centerX = centerX;
        }

        if( typeof centerY !== 'undefined' ) {
            this.centerY = centerY;
        }

        this.plugin.orientationIs(this.id, this.scale, this.rotation, this.centerX, this.centerY);
    };

	/**
	Sets the color of this node in openGL color format
	@param  {number} r The new amount of red in the node (range 0 to 1)
	@param  {number} g The new amount of green in the node (range 0 to 1)
	@param  {number} b The new amount of blue in the node (range 0 to 1)
	@param  {number} a The new amount of alpha in the node (range 0 to 1)
	@return {void} Nothing
	*/
    this.setColor = function(r, g, b, a) {
        if(typeof r !== "number" || typeof g !== "number" || typeof b !== "number" || typeof a !== "number") {
            logError("Invalid RGBA values provided");
            return;
        }

        if(!this.checkId()) {
            return;
        }

        this.plugin.colorIs(this.id, r, g, b, a);
    };

	/**
	Toggle the visibility of this node from off to on and on to off
	@param  {void} Nothing
	@return {void} Nothing
	*/
    this.toggleVisibility = function() {
        this.plugin.toggleVisibility(this.id);
    };

	/**
	Set the visibility of this node to pass in boolean
	@param  {boolean} visibility Set true to show node and false to hide node
	@return {void} Nothing
	*/
    this.setVisibility = function(visibility) {
        this.plugin.setVisibility(this.id, visibility);
    };

    /**
	Add a child to a layer in the display list
	@param  {object} child The node to be added to this layer
	@return {void} Nothing
	*/
    this.addChild = function(child) {
        if (child === undefined) {
            logError("trying to add undefined child");
        }

        if (this instanceof Sprite) {
            // error
            return;
        }

		if (child === this.id || child.id == this.id) {
            logError("Error in addChild. Node " + this.id + " cannot be a child of itself!");
            return;
        }

        if (typeof child === "string") {
            this.plugin.addChild(this.id, child);
        } else {
            this.plugin.addChild(this.id, child.getId());
        }
    };

	/**
	Remove a child from a layer in the display list
	@param  {object} child The node to be removed from this layer
	@return {void} Nothing
	*/
    this.removeChild = function(child) {
        if (this instanceof Sprite) {
            // TODO: error
            return;
        }

        if(typeof child === "string") {
            this.plugin.removeChild(this.id, child);
        } else {
            this.plugin.removeChild(this.id, child.getId());
        }
    };

	/**
	Move a node from one location to another over a specfied amount of time
	@param  {number} x The new absolute x position for the node to move to
	@param  {number} y The new absolute y position for the node to move to
	@param  {number} duration The amount of time in seconds it will take to move the node
	@return {void} Nothing
	@deprecated Use the addTween command instead
	*/
    this.addMoveTo = function(x, y, duration) {
        this.plugin.addTween(this.id, "x:" + x + ",y:" + y + ",time:" + duration);
    };

    /**
	Move a node from one location to another over a specfied amount of time
	@param  {number} x The new realitive x position for the node to move by
	@param  {number} y The new realitive y position for the node to move by
	@param  {number} duration The amount of time in seconds it will take to move the node
	@return {void} Nothing
	@deprecated Use the addTween command instead
	*/
	this.addMoveBy = function(x, y, duration) {
        var rel_x = this.x + x;
        var rel_y = this.y + y;
        this.plugin.addTween(this.id, "x:" + rel_x + ",y:" + rel_y + ",time:" + duration);
    };

	/**
	Rotate a node from one angle to another over a specfied amount of time
	@param  {number} angle The new absolute angle for the node to rotate to
	@param  {number} duration The amount of time in seconds it will take to rotate the node
	@return {void} Nothing
	@deprecated Use the addTween command instead
	*/
    this.addRotateTo = function(angle, duration) {};

    /**
	Rotate a node from one angle to another over a specfied amount of time
	@param  {number} angle The new realitive angle for the node to rotate by
	@param  {number} duration The amount of time in seconds it will take to rotate the node
	@return {void} Nothing
	@deprecated Use the addTween command instead
	*/
    this.addRotateBy = function(angle, duration) {};

    /**
	Scale a node from one ratio to another over a specfied amount of time
	@param  {number} scale The new absolute scale for the node to scale to
	@param  {number} duration The amount of time in seconds it will take to scale the node
	@return {void} Nothing
	@deprecated Use the addTween command instead
	*/
    this.addScaleTo = function(scale, duration) {};

    /**
	Scale a node from one ratio to another over a specfied amount of time
	@param  {number} scale The new realitive scale for the node to scale by
	@param  {number} duration The amount of time in seconds it will take to scale the node
	@return {void} Nothing
	@deprecated Use the addTween command instead
	*/
    this.addScaleBy = function(scale, duration) {};

	/**
	Add a tween command to the node to change it's members over time.
	@param  {string} command The command to send to the plugin
	@param  {object} obj (optional) The object for JavaScript to call the callback on
	@param  {string} callback (optional) The name of the function to call when a callback occurs
	@return {void} Nothing
	*/
    this.addTween = function(command, obj, callback) {
   		if( typeof obj === 'undefined' || typeof callback === 'undefined' ) {
            this.plugin.addTween(this.id, command);
        } else {
			var tween_id = this.plugin.addTween(this.id, command);
            this.bind("tween_finished", { "tween_id" : tween_id, "obj" : obj, "func" : callback });
        }
   	};

	/**
	Remove all the tweens for this node.  Any animations in mid action will stop.
	@param  {void} Nothing
	@return {void} Nothing
	*/
   	this.removeTween = function() {
   		this.plugin.removeTween(this.id);
   	};

	/**
	Pause all the tweens for this node.
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.pauseTween = function() {
   		this.plugin.pauseTween(this.id);
   	};

	/**
	Resume all the tweens for this node.
	@param  {void} Nothing
	@return {void} Nothing
	*/
   	this.resumeTween = function() {
   		this.plugin.resumeTween(this.id);
   	};

	/**
	Add physics properties to this node
	@param  {string} command The command to send to the plugin
	@return {void} Nothing
	*/
   	this.addPhysics = function(command) {
    		this.plugin.addPhysics(this.id, command);
   	};

	/**
	Add a joint constraint between this node and the passed child node
	@param  {object} child The child node to constrain with this node
	@param  {string} command The command to send to the plugin
	@return {void} Nothing
	*/
	this.addJoint = function(child, command) {
		if(child === "NULL") {
   			this.plugin.addJoint(this.id, child, command);
   		} else {
   			this.plugin.addJoint(this.id, child.id, command);
   		}
   	};

	/**
	Add a callback to be trigger when two nodes collide
	@param  {object} nodeB The node to trigger a callback when it collides with this node
	@param  {object} obj The object for JavaScript to call the callback on
	@param  {string} callback The name of the function to call when a callback occurs
	@return {void} Nothing
	*/
   	this.addCollision = function(nodeB, object, callback) {
        // Bind this callback
        this.bind("physics_collision", { "node" : nodeB.id, "obj" : object, "func" : callback});
        // Listen for physics collision events
        this.listen("physics_collision");
        // Let the physics engine know that we are interested in these events
   		this.plugin.addCollision(this.id, nodeB.id);
   	};

	/**
	Applies a force and velocity to this node
	@param  {number} fX The new x-axis force to be applied to this node
	@param  {number} fY The new y-axis force to be applied to this node
	@param  {number} vX The new x-axis velocity to be applied to this node
	@param  {number} vY The new y-axis velocity to be applied to this node
	@return {void} Nothing
	*/
   	this.applyForce = function(fX, fY, vX, vY) {
   		this.plugin.applyForce(this.id, fX, fY, vX, vY);
   	};

	/**
	Remove all physics properities from this node
	@param  {void} Nothing
	@return {void} Nothing
	*/
   	this.removePhysics = function() {
   		this.plugin.removePhysics(this.id);
   	};

	/**
	Remove the joint constraint between this node and the child node
	@param  {object} child The node to remove the joint from
	@return {void} Nothing
	*/
   	this.removeJoint = function(child) {
   		if(child === "NULL") {
   			this.plugin.removeJoint(this.id, child, command);
   		} else {
   			this.plugin.removeJoint(this.id, child.id, command);
   		}
   	};

	/**
	Remove the collision between this node and nodeB
	@param  {object} nodeB The node to remove collision callback from
	@return {void} Nothing
	*/
   	this.removeCollision = function(nodeB) {
   		this.plugin.removeCollision(this.id, nodeB.id);
   	};

	/**
	Used to get the current position of a node from the plugin
	@param  {void} Nothing
	@return {void} Nothing
	@deprecated Plugin automatically updates JavaScript of position changes in the node
	*/
    this.getPosition = function() {
        return this.plugin.getPosition(this.id);
    };

	/**
	Used to update the current position of a node from the plugin
	@param  {void} Nothing
	@return {void} Nothing
	@deprecated Plugin automatically updates JavaScript of position changes in the node
	*/
    this.update = function() {};

    /**
	Checks if this object has an ID meaning it's a legit node
	@param  {void} Nothing
	@return {boolean} True if a valid object and false otherwise
	*/
    this.checkId = function() {
        if(this.getId() === undefined) {
            logError("Method called on uninitialized object: " + this);
            return false;
        } else {
            return true;
        }
    };

	/**
	Add a callback to be triggered whenever this node has started being dragged.
	@param  {object} obj The object for JavaScript to call the callback on
	@param  {string} callback The name of the function to call when a callback occurs
	@return {void} Nothing
	*/
    this.addDragStartCallback = function(obj, callback) {
        this.bind("mouse_drag_start", { "obj" : obj, "func" : callback });
    };

	/**
	Add a callback to be triggered each time the mouse drags this node to a new location. Warning: Called often so will cause poor preformence on a mobile device if used heavily.
	@param  {object} obj The object for JavaScript to call the callback on
	@param  {string} callback The name of the function to call when a callback occurs
	@return {void} Nothing
	*/
    this.addDragCallback = function(obj, callback) {
        this.bind("mouse_drag", { "obj" : obj, "func" : callback });
    };

	/**
	Add a callback to be triggered whenever this node has finished being dragged.
	@param  {object} obj The object for JavaScript to call the callback on
	@param  {string} callback The name of the function to call when a callback occurs
	@return {void} Nothing
	*/
    this.addDropCallback = function(obj, callback) {
        this.bind("mouse_drop", { "obj" : obj, "func" : callback });
    };

	/**
	Add a callback to be triggered whenever this node has another node dragged over it.
	@param  {object} obj The object for JavaScript to call the callback on
	@param  {string} callback The name of the function to call when a callback occurs
	@return {void} Nothing
	*/
    this.addDragEnterCallback = function(obj, callback) {
        this.bind("mouse_drag_enter", { "obj" : obj, "func" : callback });
    };

	/**
	Add a callback to be triggered whenever this node has another node dragged out of it.
	@param  {object} obj The object for JavaScript to call the callback on
	@param  {string} callback The name of the function to call when a callback occurs
	@return {void} Nothing
	*/
    this.addDragExitCallback = function(obj, callback) {
        this.bind("mouse_drag_exit", { "obj" : obj, "func" : callback });
    };

    /**
	Enables this node to be draggable
	@param  {boolean} draggable If true then this node is draggable and not if false.
	@return {void} Nothing
	*/
    this.setDraggable = function(draggable) {
        this.plugin.setDraggable(this.id, draggable);
    };

	/**
	Sets a drop target for this node
	@param  {object} dropTarget The node which will trigger drop target events.
	@return {void} Nothing
	*/
    this.setDropTarget = function(dropTarget) {
        this.plugin.setDropTarget(this.id, dropTarget);
    };

	/**
	Notifies the plugin that this node wants to recieve events.
	@param  {void} Nothing
	@return {void} Nothing
	*/
    this.subscribe = function() {
        if(!this.boolSubscribed) { this.plugin.subscribe(this.id); }
        this.boolSubscribed = true;
    };

	/**
	Notifies the plugin that this node does not want to recieve events.
	@param  {void} Nothing
	@return {void} Nothing
	*/
    this.unsubscribe = function() {
        if(this.boolSubscribed) { this.plugin.unsubscribe(this.id); }
        this.boolSubscribed = false;
    };

	/**
	Add a callback to be triggered whenever this node has the mouse move over it. Warning: Called often so will cause poor preformence on a mobile device if used heavily.
	@param  {object} obj The object for JavaScript to call the callback on
	@param  {string} func The name of the function to call when a callback occurs
	@return {void} Nothing
	*/
    this.moveCallback = function(obj, func) {
        if(typeof obj != "object") {
            return;
        }
        this.bind("mouse_moved", { "obj" : obj, "func" : func });
    };

	/**
	Add a callback to be triggered whenever this node has the mouse click down on it.
	@param  {object} obj The object for JavaScript to call the callback on
	@param  {string} func The name of the function to call when a callback occurs
	@return {void} Nothing
	*/
    this.downCallback = function(obj, func) {
        if(typeof obj != "object") {
            return;
        }
        this.bind("mouse_down", { "obj" : obj, "func" : func });
    };

	/**
	Add a callback to be triggered whenever this node has the mouse move over it. This function is a one shot call.
	@param  {object} obj The object for JavaScript to call the callback on
	@param  {string} func The name of the function to call when a callback occurs
	@return {void} Nothing
	*/
    this.overCallback = function(obj, func) {
        if(typeof obj != "object") {
            return;
        }
        this.bind("mouse_over", { "obj" : obj, "func" : func });
    };

	/**
	Add a callback to be triggered whenever this node has the mouse move out of it. This function is a one shot call.
	@param  {object} obj The object for JavaScript to call the callback on
	@param  {string} func The name of the function to call when a callback occurs
	@return {void} Nothing
	*/
    this.outCallback = function(obj, func) {
        if(typeof obj != "object") {
            return;
        }
        this.bind("mouse_out", { "obj" : obj, "func" : func });
    };

    /**
	Add a callback to be triggered whenever this node has the mouse release the mouse button over it.
	@param  {object} obj The object for JavaScript to call the callback on
	@param  {string} func The name of the function to call when a callback occurs
	@return {void} Nothing
	*/
    this.upCallback = function(obj, func) {
        if(typeof obj != "object") {
            return;
        }
        this.bind("mouse_up", { "obj" : obj, "func" : func });
    };

	/**
	Add a callback to be triggered whenever this node has the mouse click and release the mouse button over it.
	@param  {object} obj The object for JavaScript to call the callback on
	@param  {string} func The name of the function to call when a callback occurs
	@return {void} Nothing
	*/
    this.clickCallback = function(obj, func) {
        if(typeof obj != "object") {
            return;
        }
        this.bind("mouse_up", { "obj" : obj, "func" : func });
    };

	/**
	Set the drag region of this node
	@param  {number} x The x positon of the drag region
	@param  {number} y The y positon of the drag region
	@param  {number} width The width of the drag region
	@param  {number} height The height of the drag region
	@return {void} Nothing
	*/
    this.setDragRegion = function(x, y, width, height) {
        this.plugin.setDragRegion(this.id, x, y, width, height);
    };

    /**
	Enables this node to be draggable
	@param  {mouser} passMouse The object for the mouse position if javascript
	@param  {boolean} passCenter If true then position the node so the mouse is always in the center
	@param  {rectangle} passRect Set the drag region for the node
	@param  {boolean} passGhost If true the display the dragged sprite as semi-transparent sprite while being dragged
	@return {void} Nothing
	@deprecated Use setDraggable and setDragRegion instead
	*/
	this.setDrag = function(passMouse, passCenter, passRect, passGhost) {

		// Optional parameter for centering the sprite on the mouse
		if ( typeof passMouse === "undefined" ) { passMouse = this; }

		// Optional parameter for centering the sprite on the mouse
		if ( typeof passCenter === "undefined" ) { passCenter = true; }

		// Optional parameter for keeping the sprite inside the rectangle
		if ( typeof passRect === "undefined" ) { passRect = new Rectangle(0, 0, 480, 320); }

		// Optional parameter for making a ghost of the image before dragging it.
		if ( typeof passGhost === "undefined" ) { passGhost = false; }

		if(!this.boolCallbacks)	{
			this.setDraggable(true);
            this.setDragRegion(passRect.x, passRect.y, passRect.width, passRect.height);
		}
		this.boolCallbacks = true;
        this.subscribe();
	};

	/**
	Stop this node from being draggable
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.clearDrag = function() {
		this.unsubscribe();
	};
}

/**
The abstract layer in between the Osmosis and Sprites
@class BaseSprite
@augments Osmosis
@param  {object} plugin The monocleGL plugin object
@param  {string} url The URL location of the image resource to download
@param  {number} x The x position of the sprite
@param  {number} y The y position of the sprite
@param  {number} width The width of the sprite
@param  {number} height The height of the sprite
@return {void} Nothing
*/
function BaseSprite(plugin, url, x, y, width, height) {
	/**
	Set the shape of the sprite to be either circle or square
	@param  {string} shape Use "square" for a rectanglar sprite and "circle" for a circlar sprite
	@return {void} Nothing
	@deprecated Not used anymore
	*/
    this.setShape = function(shape) {
        if(typeof shape !== "string") {
            return;
        }

        if(!this.checkId()) {
            return;
        }

        // TODO: Check if shape parameter is a _valid_ string ("circle" or "square")
        this.plugin.shape(this.id, shape);
    };
}

/**
The class for sprite nodes
@class Sprite
@augments BaseSprite
@param  {object} plugin The monocleGL plugin object
@param  {string} url The URL location of the image resource to download
@param  {number} x The x position of the sprite
@param  {number} y The y position of the sprite
@param  {number} width The width of the sprite
@param  {number} height The height of the sprite
@return {void} Nothing
*/
function Sprite(plugin, url, x, y, width, height) {
    // Initialize everything
	this.plugin = plugin;
	this.url = url;
    this.id = plugin.newSprite(url);

	// Optional parameter default to default to 0
	if ( x === undefined ) { this.x = 0; } else { this.x = x; }
	if ( y === undefined ) { this.y = 0; } else { this.y = y; }
	if ( width === undefined ) { this.width = 0; } else { this.width = width; }
	if ( height === undefined ) { this.height = 0; } else { this.height = height; }

    this.init();

    this.plugin.positionIs(this.id, this.x, this.y, this.width, this.height);

	/**
	Sets a new image to be used for this sprite
	@param  {string} url The URL location of the image resource to download
	@return {void} Nothing
	*/
    this.setUrl = function(url) {
        this.plugin.setUrl(this.getId(), url);
    };
}

/**
The class for layer overlay nodes
@class Layer
@augments Osmosis
@param  {object} plugin The monocleGL plugin object
@param  {number} x The x position of the sprite
@param  {number} y The y position of the sprite
@param  {number} width The width of the sprite
@param  {number} height The height of the sprite
@return {void} Nothing
*/
function Layer(plugin, x, y, width, height) {
    this.plugin = plugin;
    this.id = plugin.newLayer();
    if(!x) { this.x = 0; } else { this.x = x; }
    if(!y) { this.y = 0; } else { this.y = y; }
    if(!width) { this.width = 0; } else { this.width = width; }
    if(!height) { this.height = 0; } else { this.height = height; }
    this.init();
    this.plugin.positionIs(this.id, this.x, this.y, this.width, this.height);
}

/**
The class for scene with quiz functions
@class Scene
@augments Osmosis
@param  {object} passPlugin The monocleGL plugin object
@param  {boolean} passStep Weather or not the question is a step questions (deprecated)
@return {void} Nothing
*/
function Scene(passPlugin, passStep) {
    this.plugin = passPlugin;
    this.strInstruction = "";

    // Question status flags
    this.tries = 3;
    this.correct = false;
    this.completed = false;
    this.serverStatus = false;
    this.id = this.plugin.newScene();

    this.bgLayer = new Layer(this.plugin, 0, 0, 480, 320);
    this.bgLayer.setColor(0, 0, 0, 0);

	/**
	Default initQuiz callback to be replaced by the developer
	@param  {void} Nothing
	@return {void} Nothing
	*/
    this.initQuiz = function() {
    	logDebug("initQuiz() default callback");
    };

    /**
	Default loadQuiz callback to be replaced by the developer
	@param  {void} Nothing
	@return {void} Nothing
	*/
    this.loadQuiz = function() {
    	logDebug("loadQuiz() default callback");
    };

    /**
	Default checkAnswer callback to be replaced by the developer
	@param  {void} Nothing
	@return {void} Nothing
	*/
    this.checkAnswer = function() {
    	logDebug("checkAnswer() default callback");
    	return true;
    };

    /**
	Default resetQuiz callback to be replaced by the developer
	@param  {void} Nothing
	@return {void} Nothing
	*/
    this.resetQuiz = function() {
    	logDebug("resetQuiz() default callback");
    	this.loadQuiz();
    };

    /**
	Default showCorrectAnswer callback to be replaced by the developer
	@param  {void} Nothing
	@return {void} Nothing
	*/
    this.showCorrectAnswer = function() {
    	logDebug("showCorrectAnswer() default callback");
    };

    /**
	Default cleanUp callback to be replaced by the developer
	@param  {void} Nothing
	@return {void} Nothing
	*/
    this.cleanUp = function() {
    	logDebug("cleanUp() default callback");
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

/**
The class for the base definations of labels and textboxes
@class BaseLabel
@augments Osmosis
@param  {void} Nothing
@return {void} Nothing
*/
function BaseLabel() {
	/**
	Sets the string that will be displayed
	@param  {string} text The string to be displayed inside label/textbox.
	@return {void} Nothing
	*/
    this.setText = function(text) {
        if(typeof text == "string") {
            this.text = text;
        } else {
            var str = "";
            for (el in text) {
                str = str + text[el];
            }
            this.text = str;
        }
        this.plugin.captionIs(this.id, this.text);
    };

	/**
	Sets the text caption color of this node in openGL color format.
	@param  {number} r The new amount of red in the node (range 0 to 1).
	@param  {number} g The new amount of green in the node (range 0 to 1).
	@param  {number} b The new amount of blue in the node (range 0 to 1).
	@param  {number} a The new amount of alpha in the node (range 0 to 1).
	@return {void} Nothing
	*/
    this.setCaptionColor = function(r, g, b, a) {
        this.plugin.captionColorIs(this.id, r, g, b, a);
    };

	/**
	Sets the text to wrap once it reach the length of the label/textbox.
	@param  {boolean} wrap If true the text will wrap around and otherwise the text will continue to the right until finished.
	@return {void} Nothing
	*/
    this.setWrap = function(wrap) {
        if (typeof wrap != "boolean") {
            // error...
            return;
        }
        this.plugin.wrapText(this.id, wrap);
    };

	/**
	Tells the plugin to attach a key listener event to this node.
	@param  {void} Nothing
	@return {void} Nothing
	*/
    this.addKeyListener = function() {
        this.plugin.addKeyListener(this.id);
    };

	/**
	Set this label/textbox to use the bold font included in the plugin
	@param  {boolean} bold If true set the font to be bold otherwise set it regular.
	@return {void} Nothing
	*/
    this.setBold = function(bold) {
        if (typeof bold != "boolean") {
            return;
        }
        this.plugin.setBold(this.id, bold);
    };

	/**
	Set this label/textbox to use the italic font included in the plugin
	@param  {boolean} italic If true set the font to be italic otherwise set it regular.
	@return {void} Nothing
	*/
    this.setItalic = function(italic) {
        if (typeof italic != "boolean") {
            return;
        }
        this.plugin.setItalic(this.id, italic);
    };

	/**
	Set the anchor of this label to be left, right or centered.
	@param  {string} anchor Side the alignment of the label to be "left", "right" or "center"
	@return {void} Nothing
	*/
    this.setAnchor = function(anchor) {
        if (typeof anchor !== "string") {
            return;
        }
        this.plugin.setAnchor(this.id, anchor);
    };
}

/**
The class for a dynamic label of text
@class Label
@augments BaseLabel
@param  {object} passPlugin The monocleGL plugin object.
@param  {string} text The string to be displayed in the label.
@param	{number} size The in points of the font used.
@param  {number} x The x position of the label.
@param  {number} y The y position of the label.
@param  {number} width The width of the label.
@param  {number} height The height of the label.
@return {void} Nothing
*/
function Label(plugin, text, size, x, y, width, height) {
    this.plugin = plugin;
    this.id = this.plugin.newLabel(text, size);
    this.text = text;
	this.pntOffset = new Point();

    if(!x) { this.x = 0; } else { this.x = x; }
    if(!y) { this.y = 0; } else { this.y = y; }
    if(!width) { this.width = 0; } else { this.width = width; }
    if(!height) { this.height = 0; } else { this.height = height; }
    this.init();
    this.plugin.positionIs(this.id, this.x, this.y, this.width, this.height);
}

/**
The class for a dynamic textbox
@class TextBox
@augments BaseLabel
@param  {object} passPlugin The monocleGL plugin object.
@param  {string} text The string to be displayed in the textbox.
@param	{number} size The in points of the font used.
@param  {number} x The x position of the textbox.
@param  {number} y The y position of the textbox.
@param  {number} width The width of the textbox.
@param  {number} height The height of the textbox.
@return {void} Nothing
*/
function TextBox(plugin, text, size, x, y, width, height) {
    this.plugin = plugin;
    this.id = plugin.newTextBox(text, size);
    this.text = text;
    if(!x) { this.x = 0; } else { this.x = x; }
    if(!y) { this.y = 0; } else { this.y = y; }
    if(!width) { this.width = 0; } else { this.width = width; }
    if(!height) { this.height = 0; } else { this.height = height; }
    this.init();
    this.bind("text_changed", { "obj" : this, "func" : "updateText" });
    this.plugin.positionIs(this.id, this.x, this.y, this.width, this.height);
    this.plugin.addKeyListener(this.getId());

	/**
	An automatically setup callback that triggers whenever the text changes.
	@param  {string} text The string displayed in the textbox.
	@return {void} Nothing
	*/
    this.updateText = function(text) {
        this.text = text;
    };

	/**
	Add a callback to be triggered whenever this node recieves an enter callback
	@param  {object} obj The object for JavaScript to call the callback on
	@param  {string} func The name of the function to call when a callback occurs
	@return {void} Nothing
	*/
    this.addEnterCallback = function(obj, func) {
        if(typeof obj != "object") {
            return;
        }
        this.bind("enter_pressed", { "obj" : obj, "func" : func });
    };

	/**
	Add a callback to be triggered whenever this node recieves or looses focus
	@param  {object} obj The object for JavaScript to call the callback on
	@param  {string} func The name of the function to call when a callback occurs
	@return {void} Nothing
	*/
    this.addFocusChangedCallback = function(obj, func) {
        if(typeof obj != "object") {
            return;
        }
        this.bind("focus_changed", { "obj" : obj, "func" : func });
    };

	/**
	Allow textboxes to recieve events if set to be true
	@param  {boolean} interaction If true allow interaction with textbox else block interaction
	@return {void} Nothing
	*/
    this.setInteraction = function(interaction) {
        if(typeof interaction != "boolean") {
            return;
        }
        this.plugin.setTextBoxInteraction(this.getId(), interaction);
    };

	/**
	Return the text value of the textbox
	@param  {void} Nothing
	@return {string} The string current inside the textbox
	*/
    this.getText = function() {
        return this.text;
    };
}

/**
The class for the interactive button node with one of the presets "submit", "answer", "nextScene", "prevScene", "refresh", "explore", "ok", "ready", "smallArrowDown", "smallArrowLeft", "smallArrowRight" and "smallArrowUp".
@class Button
@augments Sprite
@param  {object} passPlugin The monocleGL plugin object.
@param  {string} type The type of button to be displayed.
@param  {number} x The x position of the button.
@param  {number} y The y position of the button.
@param  {number} width The width of the button.
@param  {number} height The height of the button.
@return {void} Nothing
*/
function Button(plugin, type, x, y, width, height) {
    // Initialize everything
    this.plugin = plugin;
    this.type = type;
    this.id = plugin.newButton(type);
    if(!x) { this.x = 0; } else { this.x = x; }
    if(!y) { this.y = 0; } else { this.y = y; }
    if(!width) { this.width = 0; } else { this.width = width; }
    if(!height) { this.height = 0; } else { this.height = height; }
    this.init();
    this.plugin.positionIs(this.id, this.x, this.y, this.width, this.height);

	/**
	Allows button to recieve events if set to be true.
	@param  {boolean} active If true allow interaction and display the active state button otherwise disable interaction and display the inactive state.
	@return {void} Nothing
	*/
    this.setActive = function(active) {
        if(typeof active != "boolean") {
            return;
        }
        this.plugin.setButtonActive(this.getId(), active);

        // Restore the button's subscribed/unsubscribed state
        if(active === true) {
            this.subscribe();
        } else if (active === false) {
            this.unsubscribe();
        }
    };
}

/**
The class for the interactive button node
@class Primitive
@augments Osmosis
@param  {object} passPlugin The monocleGL plugin object.
@param  {string} shape The type of primitive to be displayed ("rectangle", "circle" or "line").
@param  {number} x The x position of the primitive.
@param  {number} y The y position of the primitive.
@param  {number} width The width of the primitive.
@param  {number} height The height of the primitive.
@return {void} Nothing
*/
function Primitive(plugin, shape, x, y, width, height) {
    // Initialize everything
    this.plugin = plugin;
    if(typeof shape != "string") {
        // TODO: Error
        return;
    }

    this.id = plugin.newPrimitive(shape);
    if(!x) { this.x = 0; } else { this.x = x; }
    if(!y) { this.y = 0; } else { this.y = y; }
    if(!width) { this.width = 0; } else { this.width = width; }
    if(!height) { this.height = 0; } else { this.height = height; }
    this.init();
    this.plugin.positionIs(this.id, this.x, this.y, this.width, this.height);

	/**
	Set the postion and dimensions of this primitive.
	@param  {number} x1 The x position of the primitive.
	@param  {number} y1 The y position of the primitive.
	@param  {number} x2 The new width of the primitive.
	@param  {number} y2 The new height of the primitive.
	@return {void} Nothing
	*/
    this.setPoints = function(x1, y1, x2, y2) {
        this.setPosition(x1, y1);
        this.setDimensions(x2, y2);
    };

	/**
	Set the corner radius of a rectangle.
	@param  {number} radius The corner radius of a rectangle in pixels.
	@return {void} Nothing
	*/
    this.setCornerRadius = function(radius) {
        this.plugin.setRectangleCornerRadius(this.getId(), radius);
    };

	/**
	Set the border width of a rectangle.
	@param  {number} width The border width of a rectangle in pixels.
	@return {void} Nothing
	*/
    this.setBorderWidth = function(width) {
        this.plugin.setBorderWidth(this.getId(), width);
    };

	/**
	Set the color of the rectangles border in openGL color format.
	@param  {number} r The new amount of red in the node (range 0 to 1).
	@param  {number} g The new amount of green in the node (range 0 to 1).
	@param  {number} b The new amount of blue in the node (range 0 to 1).
	@param  {number} a The new amount of alpha in the node (range 0 to 1).
	@return {void} Nothing
	*/
    this.setBorderColor = function(r, g, b, a) {
        this.plugin.setBorderColor(this.getId(), r, g, b, a);
    };
}

/**
The class drawing a thickness adjustable line
@class Line
@augments Osmosis
@param  {object} passPlugin The monocleGL plugin object.
@param  {number} x The x1 position of the line.
@param  {number} y The y1 position of the line.
@param  {number} width The x2 position of the line.
@param  {number} height The y2 position of the line.
@return {void} Nothing
*/
function Line(plugin, x, y, width, height) {
    // Initialize everything
    this.plugin = plugin;
    this.id = plugin.newPrimitive("line");
    if(!x) { this.x = 0; } else { this.x = x; }
    if(!y) { this.y = 0; } else { this.y = y; }
    if(!width) { this.width = 0; } else { this.width = width; }
    if(!height) { this.height = 0; } else { this.height = height; }
    this.init();
    this.plugin.positionIs(this.id, this.x, this.y, this.width, this.height);

	/**
	Set the thicknes of the line.
	@param  {number} thickness The line thickness in pixels.
	@return {void} Nothing
	*/
    this.setThickness = function(thickness) {
        this.plugin.setLineThickness(this.id, thickness);
    };
}

/**
The class for an interactive scrollbar node
@class ScrollBar
@augments Osmosis
@param  {object} passPlugin The monocleGL plugin object.
@param  {number} x The x position of the scrollbar.
@param  {number} y The y position of the scrollbar.
@param  {number} width The width of the scrollbar.
@param  {number} height The height of the scrollbar.
@return {void} Nothing
*/
function ScrollBar(plugin, x, y, width, height) {
    this.plugin = plugin;
    this.id = plugin.newScrollBar();
    if(!x) { this.x = 0; } else { this.x = x; }
    if(!y) { this.y = 0; } else { this.y = y; }
    if(!width) { this.width = 0; } else { this.width = width; }
    if(!height) { this.height = 0; } else { this.height = height; }
    this.init();
    this.plugin.positionIs(this.id, this.x, this.y, this.width, this.height);
}

/**
The class for an interactive drop down menu node
@class DropDown
@augments Osmosis
@param  {object} passPlugin The monocleGL plugin object.
@param  {number} x The x position of the drop down menu.
@param  {number} y The y position of the drop down menu.
@param  {number} width The width of the drop down menu.
@param  {number} height The height of the drop down menu (Note this is the extended length, when retracted the drop down is 20 pixels).
@return {void} Nothing
*/
function DropDown(plugin, x, y, width, height) {
    this.plugin = plugin;
    this.id = plugin.newDropDown();
    this.text = "";
    if(!x) { this.x = 0; } else { this.x = x; }
    if(!y) { this.y = 0; } else { this.y = y; }
    if(!width) { this.width = 0; } else { this.width = width; }
    if(!height) { this.height = 0; } else { this.height = height; }
    this.init();
    this.bind("text_changed", { "obj" : this, "func" : "updateText" });
    this.plugin.positionIs(this.id, this.x, this.y, this.width, this.height);

	/**
	An automatically setup callback that triggers whenever the text changes.
	@param  {string} text The string displayed in the textbox.
	@return {void} Nothing
	*/
	this.updateText = function(text) {
        this.text = text;
    };

	/**
	Add an option to the drop down menu.
	@param  {string} text The new option to be added to the menu.
	@return {void} Nothing
	*/
    this.addOption = function(option) {
        if(typeof option != "string") {
            //TODO: error
            return;
        }
        if (this.text === "") {
            this.text = option;
        }
        this.plugin.addOptionToDropDown(this.id, option);
    };

	/**
	Add a callback to be triggered whenever this node changes it's selected option.
	@param  {object} obj The object for JavaScript to call the callback on
	@param  {string} func The name of the function to call when a callback occurs
	@return {void} Nothing
	*/
    this.addChangedCallback = function(obj, callback) {
        this.bind("drop_down_changed", { "obj" : obj, "func" : callback });
    };

	/**
	Removes the callback thats triggered whenever this node changes it's selected option.
	@param  {object} obj The object for JavaScript to call the callback on
	@param  {string} func The name of the function to call when a callback occurs
	@return {void} Nothing
	*/
    this.removeChangedCallback = function(obj, callback) {
        this.plugin.removeDropDownCallback(this.getId(), obj, callback);
    };

	/**
	Removes all the callbacks on this node.
	@param  {void} Nothing
	@return {void} Nothing
	*/
    this.removeAllCallbacks = function() {
        this.plugin.removeAllDropDownCallbacks(this.getId());
    };

	/**
	Sets the default option for the drop down menu.
	@param  {string} option The prexisting option that the drop down menu defaults too.
	@return {void} Nothing
	*/
    this.setDefaultOption = function(option) {
        if(typeof option != "string") {
            return;
        }
        this.plugin.setDefaultDropDownOption(this.getId(), option);
    };

	/**
	Return the text value of the drop down menu
	@param  {void} Nothing
	@return {string} The string current inside the drop down menu
	*/
    this.getText = function() {
        return this.text;
    };

	/**
	Sets the text value of the drop down menu
	@param  {string} The string current inside the drop down menu
	@return {void} Nothing
	*/
    this.setText = function(text) {
        return this.plugin.setDropDownText(this.getId(), text);
    };

	/**
	Sets the background color of this node in openGL color format.
	@param  {number} r The new amount of red in the node (range 0 to 1).
	@param  {number} g The new amount of green in the node (range 0 to 1).
	@param  {number} b The new amount of blue in the node (range 0 to 1).
	@param  {number} a The new amount of alpha in the node (range 0 to 1).
	@return {void} Nothing
	*/
    this.setColor = function(r, g, b, a) {
        this.plugin.colorIs(this.getId(), r, g, b, a);
    };

	/**
	Sets the text caption color of this node in openGL color format.
	@param  {number} r The new amount of red in the node (range 0 to 1).
	@param  {number} g The new amount of green in the node (range 0 to 1).
	@param  {number} b The new amount of blue in the node (range 0 to 1).
	@param  {number} a The new amount of alpha in the node (range 0 to 1).
	@return {void} Nothing
	*/
    this.setTextColor = function(r, g, b, a) {
        this.plugin.setDropDownTextColor(this.getId(), r, g, b, a);
    };
}

/**
The class drawing a thickness adjustable bezier line
@class Bezier
@augments Osmosis
@param  {object} plugin The monocleGL plugin object.
@param  {array} points Set the points of the Bezier (in a flat array) Example: var points = new Array(x1, y1, x2, y2, x3, y3, ...);
@return {void} Nothing
*/
function Bezier(plugin, points) {
    this.plugin = plugin;
    this.id = plugin.newBezier();

	/**
	Change the points in the bezier curve to the ones passed in.
	@param  {array} points Set the points of the Bezier (in a flat array) Example: var points = new Array(x1, y1, x2, y2, x3, y3, ...);
	@return {void} Nothing
	*/
    this.setPoints = function(points) {
        if(points.constructor.toString().indexOf("Array") != -1) { // Object is an array
            this.plugin.setBezierPoints(this.getId(), points);
        } else {
            return;
        }
    };
    this.setPoints(points);

	/**
	Set the thicknes of the bezier line.
	@param  {number} thickness The line thickness in pixels.
	@return {void} Nothing
	*/
    this.setThickness = function(thickness) {
        if(typeof thickness == "number") {
            this.plugin.setBezierThickness(thickness);
        } else {
            return;
        }
    };
}

/**
The class drawing toggable checkboxes
@class Checkbox
@augments Osmosis
@param  {object} plugin The monocleGL plugin object.
@param  {string} txt The string to be displayed in the checkbox.
@param  {number} x The x position of the checkbox.
@param  {number} y The y position of the checkbox.
@param  {number} width The width of the checkbox.
@param  {number} height The height of the checkbox.
@return {void} Nothing
*/
function Checkbox(plugin, txt, x, y, width, height) {
    this.plugin = plugin;

    if(!txt) { this.txt = "Checkbox"; } else { this.txt = txt; }
    if(!x) { this.x = 0; } else { this.x = x; }
    if(!y) { this.y = 0; } else { this.y = y; }
    if(!width) { this.width = 0; } else { this.width = width; }
    if(!height) { this.height = 0; } else { this.height = height; }

	// This boolean flag is the status of the check box
	this.selected = false;

	// Create a background label to add all the sprites and callbacks to
   	this.lblBG = new Label(this.plugin, "", 1, this.x, this.y, this.width, this.height);
	this.lblBG.downCallback(this, "mouseClick");
   	this.lblBG.setColor(0.0, 0.0, 0.0, 0.0);
    this.lblBG.setCaptionColor(0.0, 0.0, 0.0, 1.0);
	this.lblBG.subscribe();

    // Set this object ID to be the same as the background label ID
   	this.id = this.lblBG.getId();

	// Create the empty checkbox sprite
   	this.sprBox = new Sprite(this.plugin, "checkbox.png", this.x, this.y, this.height, this.height);

	// Create the checkmark sprite and make invisible
   	this.sprCheck = new Sprite(this.plugin, "check.png", this.x, this.y, this.height, this.height);
   	this.sprCheck.setVisibility(false);

	// Figure out the y offset based on the height
	var txtY = this.y;
	if(this.height > 16) txtY = this.y - (this.height * this.height * 0.005);

	// Create the label which display the checkbox's text
   	this.lblTxt = new Label(this.plugin, this.txt, this.height, this.x + (this.height * 0.8), txtY, this.width - this.height, this.height);
	this.lblTxt.setColor(0.0, 0.0, 0.0, 0.0);
    this.lblTxt.setCaptionColor(0.0, 0.0, 0.0, 1.0);

	// Add everything to the background label
   	this.lblBG.addChild(this.sprBox);
   	this.lblBG.addChild(this.sprCheck);
   	this.lblBG.addChild(this.lblTxt);

	/**
	The callback that gets triggered whenever user clicks on the checkbox
	@param  {number} x The x position of the mouse
	@param  {number} y The y position of the mouse
	@return {void} Nothing
	*/
	this.mouseClick = function(x,y) {
		this.setSelected(!this.selected);
	};

	/**
	Set the selected flag and checkmark visibility.
	@param  {boolean} bool If true then set the checkmark to be visible and set invisibile
	@return {void} Nothing
	*/
	this.setSelected = function(bool) {
		this.selected = bool;
		this.sprCheck.setVisibility(this.selected);
	};

	/**
	Get the selected flag of the checkbox.
	@param  {void} Nothing
	@return {boolean} If true then checkbox is selected and will show false otherwise
	*/
	this.getSelected = function() {
		return this.selected;
	};

	/**
	Get the text for checkbox.
	@param  {void} Nothing
	@return {string} The displayed text next to the checkbox
	*/
    this.getText = function() {
    		this.txt = this.lblTxt.getText();
        return this.txt;
    };

	/**
	Set the text for checkbox.
	@param  {string} The displayed text next to the checkbox
	@return {void} Nothing
	*/
    this.setText = function(text) {
  		this.txt = text;
        return this.lblTxt.setText(this.txt);
    };
}

var arrRadioList = new Array();
/**
The class drawing toggable radio buttons.
@class RadioButton
@augments Osmosis
@param  {object} plugin The monocleGL plugin object.
@param  {string} txt The string to be displayed in the radio button.
@param  {string} group The string use to group radio buttons together.
@param  {number} x The x position of the radio button.
@param  {number} y The y position of the radio button.
@param  {number} width The width of the radio button.
@param  {number} height The height of the radio button.
@return {void} Nothing
*/
function RadioButton(plugin, txt, group, x, y, width, height) {
	this.plugin = plugin;

	// Add the radio button to the global list
    arrRadioList.push(this);

    if(!txt) { this.txt = "RadioButton"; } else { this.txt = txt; }
    if(!group) { this.group = "default"; } else { this.group = group; }
    if(!x) { this.x = 0; } else { this.x = x; }
    if(!y) { this.y = 0; } else { this.y = y; }
    if(!width) { this.width = 0; } else { this.width = width; }
    if(!height) { this.height = 0; } else { this.height = height; }

	// This boolean flag is the status of the check box
	this.selected = false;

	// Create a background label to add all the sprites and callbacks to
   	this.lblBG = new Label(this.plugin, "", 1, this.x, this.y, this.width, this.height);
	this.lblBG.downCallback(this, "mouseClick");
   	this.lblBG.setColor(0.0, 0.0, 0.0, 0.0);
    this.lblBG.setCaptionColor(0.0, 0.0, 0.0, 1.0);
	this.lblBG.subscribe();

    // Set this object ID to be the same as the background label ID
   	this.id = this.lblBG.getId();

	// Create the empty checkbox sprite
	// TODO Remove the http:// when the plugin has the images internally
   	this.sprOff = new Sprite(this.plugin, "radioOff.png", this.x, this.y, this.height, this.height);

	// Create the checkmark sprite and make invisible
   	this.sprOn = new Sprite(this.plugin, "radioOn.png", this.x, this.y, this.height, this.height);
   	this.sprOn.setVisibility(false);

	// Figure out the y offset based on the height
	var txtY = this.y;
	if(this.height > 16) txtY = this.y - (this.height * this.height * 0.005);

	// Create the label which display the checkbox's text
   	this.lblTxt = new Label(this.plugin, this.txt, this.height, this.x + (this.height * 0.8), txtY, this.width - this.height, this.height);
	this.lblTxt.setColor(0.0, 0.0, 0.0, 0.0);
    this.lblTxt.setCaptionColor(0.0, 0.0, 0.0, 1.0);

	// Add everything to the background label
   	this.lblBG.addChild(this.sprOff);
   	this.lblBG.addChild(this.sprOn);
   	this.lblBG.addChild(this.lblTxt);

	/**
	The callback that gets triggered whenever user clicks on the radio button.
	@param  {number} x The x position of the mouse.
	@param  {number} y The y position of the mouse.
	@return {void} Nothing
	*/
	this.mouseClick = function(x,y) {
		this.setSelected(true);
	};

	/**
	Set the selected flag and radio circle visibility.  This function will unselect any other radio buttons in the same group.
	@param  {boolean} bool If true then set the radio circle to be visible and set invisibile.
	@return {void} Nothing
	*/
	this.setSelected = function(bool) {
		if(bool) {
			for(var i = 0; i < arrRadioList.length; i++) {
				if(arrRadioList[i].group === this.group) {
					arrRadioList[i].selected = false;
					arrRadioList[i].sprOn.setVisibility(false);
					arrRadioList[i].sprOff.setVisibility(true);
				}
			}
		}

		this.selected = bool;
		this.sprOn.setVisibility(this.selected);
		this.sprOff.setVisibility(!this.selected);
	};

	/**
	Get the selected flag for this radio button.
	@param  {void} Nothing
	@return {boolean} If true then radio button is selected and will show false otherwise.
	*/
	this.getSelected = function() {
		return this.selected;
	};

	/**
	Get the text for the radio button.
	@param  {void} Nothing
	@return {string} The displayed text next to the radio button.
	*/
    this.getText = function() {
    		this.txt = this.lblTxt.getText();
        return this.txt;
    };

	/**
	Set the text for the radio button.
	@param  {string} The displayed text next for the radio button.
	@return {void} Nothing
	*/
    this.setText = function(text) {
  		this.txt = text;
        return this.lblTxt.setText(this.txt);
    };
}

/**
A wrapper class for accessing the physics object.
@class Physics
@param  {object} plugin The monocleGL plugin object.
@return {void} Nothing
*/
function Physics(plugin) {
	this.plugin = plugin;

	/**
	Set the enviromental varibles for this scene.
	@param  {string} command The command to send to the plugin.
	@return {void} Nothing
	*/
	this.setEnvironment = function(command) {
   		this.plugin.setEnvironment(command);
   	};

	/**
	Add physics properties to this node.
	@param  {object} node The node to add physics too.
	@param  {string} command The command to send to the plugin.
	@return {void} Nothing
	*/
   	this.addPhysics = function(node, command)  {
   		this.plugin.addPhysics(node.id, command);
   	};

	/**
	Creates a named invisible physics line.
	@param  {string} name The name used for referencing the physics line.
	@param  {number} x1 The x1 position of the segment.
	@param  {number} y1 The y1 position of the segment.
	@param  {number} x2 The x2 position of the segment.
	@param  {number} y2 The y2 position of the segment.
	@return {void} Nothing
	*/
	this.addSegment = function(name, x1, y1, x2, y2) {
   		this.plugin.addSegment(name, x1, y1, x2, y2);
   	};

	/**
	Add a joint constraint between the parent node and the child node.
	@param  {object} parent The parent node to constrain with the child node.
	@param  {object} child The child node to constrain with the parent node.
	@param  {string} command The command to send to the plugin.
	@return {void} Nothing
	*/
   	this.addJoint = function(parent, child, command) {
		if( parent === "NULL" && child === "NULL") {
			return;
   		} else if(parent === "NULL") {
   			this.plugin.addJoint(parent, child.id, command);
   		} else if(child === "NULL") {
   			this.plugin.addJoint(parent.id, child, command);
   		} else {
   			this.plugin.addJoint(parent.id, child.id, command);
   		}
   	};

	/**
	Add a callback to be trigger when two nodes collide
	@param  {object} nodeA The node to trigger a callback when it collides with node B
	@param  {object} nodeB The node to trigger a callback when node A collides with this node
	@param  {object} obj The object for JavaScript to call the callback on
	@param  {string} callback The name of the function to call when a callback occurs
	@return {void} Nothing
	*/
   	this.addCollision = function(nodeA, nodeB, object, callback) {
        // Bind this callback
        nodeA.bind("physics_collision", { "node" : nodeB.id, "obj" : object, "func" : callback});
        // Listen for physics collision events
        nodeA.listen("physics_collision");
        // Let the physics engine know that we are interested in these events
   		this.plugin.addCollision(nodeA.id, nodeB.id);
   	};

	/**
	Applies a force and velocity to this node.
	@param  {object} node The node to add a force or velocity too.
	@param  {number} fX The new x-axis force to be applied to this node.
	@param  {number} fY The new y-axis force to be applied to this node.
	@param  {number} vX The new x-axis velocity to be applied to this node.
	@param  {number} vY The new y-axis velocity to be applied to this node.
	@return {void} Nothing
	*/
   	this.applyForce = function(node, fX, fY, vX, vY) {
   		this.plugin.addSegment(node.id, fX, fY, vX, vY);
   	};

	/**
	Remove all physics properities from the passed node.
	@param  {object} node The node to remove physics from.
	@return {void} Nothing
	*/
   	this.removePhysics = function(node) {
   		this.plugin.removePhysics(node.id);
   	};

	/**
	Removes a named invisible physic line
	@param  {string} name The name of physics line(s) to remove
	@return {void} Nothing
	*/
	this.removeSegment = function(name) {
   		this.plugin.removeSegment(name);
   	};

	/**
	Remove the joint constraint between the parent and child node.
	@param  {object} parent The parent node to remove the constrain from.
	@param  {object} child The child node to remove the constrain from.
	@return {void} Nothing
	*/
   	this.removeJoint = function(parent, child) {
   		if( parent === "NULL" && child === "NULL") {
			return;
   		} else if(parent === "NULL") {
   			this.plugin.removeJoint(parent, child.id);
   		} else if(child === "NULL") {
   			this.plugin.removeJoint(parent.id, child);
   		} else {
   			this.plugin.removeJoint(parent.id, child.id);
   		}
   	};

	/**
	Remove the joint constraint between nodeA and nodeB.
	@param  {object} nodeA The node pair to remove collision callback from
	@param  {object} nodeB The node pair to remove collision callback from
	@return {void} Nothing
	*/
   	this.removeCollision = function(nodeA, nodeB) {
   		this.plugin.removeCollision(nodeA.id, nodeB.id);
   	};

	/**
	Remove all physics properities from everything.
	@param  {void} Nothing
	@return {void} Nothing
	*/
   	this.removeAllPhysics = function() {
   		this.plugin.removeAllPhysics();
   	};
}

/**
A wrapper class for accessing the tweener object.
@class Tweener
@param  {object} plugin The monocleGL plugin object.
@return {void} Nothing
*/
function Tweener(plugin) {
	this.plugin = plugin;

	/**
	Add a tween command to the node to change it's members over time.
	@param  {object} node The node to add the tween to.
	@param  {string} command The command to send to the plugin
	@param  {object} obj (optional) The object for JavaScript to call the callback on
	@param  {string} callback (optional) The name of the function to call when a callback occurs
	@return {void} Nothing
	*/
	this.addTween = function(node, command, obj, callback) {
   		var tween_id = this.plugin.addTween(node.id, command);
        node.bind("tween_finished", { "tween_id" : tween_id, "obj" : obj, "func" : callback });
   	};

	/**
	Remove all the tweens for this node.  Any animations in mid action will stop.
	@param  {object} node The node to remove tween from.
	@return {void} Nothing
	*/
   	this.removeTween = function(node) {
   		this.plugin.removeTween(node.id);
   	};

	/**
	Pause all the tweens for this node.
	@param  {object} node The node to pause the current tweens.
	@return {void} Nothing
	*/
	this.pauseTween = function(node) {
   		this.plugin.pauseTween(node.id);
   	};

	/**
	Resume all the tweens for this node.
	@param  {object} node The node to resume the current tweens.
	@return {void} Nothing
	*/
   	this.resumeTween = function(node) {
   		this.plugin.resumeTween(node.id);
   	};

	/**
	Remove all the tweens from every node.
	@param  {void} Nothing
	@return {void} Nothing
	*/
   	this.removeAllTweens = function() {
   		this.plugin.removeAllTweens();
   	};

	/**
	Pause all the tweens from every node.
	@param  {void} Nothing
	@return {void} Nothing
	*/
	this.pauseAllTweens = function() {
   		this.plugin.pauseAllTweens();
   	};

	/**
	Resume all the tweens from every node.
	@param  {void} Nothing
	@return {void} Nothing
	*/
   	this.resumeAllTweens = function() {
   		this.plugin.resumeAllTweens();
   	};
}

// Setup class protoypes
BaseSprite.prototype = new Osmosis();
Sprite.prototype = new BaseSprite();
BaseLabel.prototype = new Osmosis();
Label.prototype = new BaseLabel();
Primitive.prototype = new Osmosis();
Layer.prototype = new Osmosis();
Scene.prototype = new Osmosis();
DropDown.prototype = new Osmosis();
ScrollBar.prototype = new Osmosis();
Button.prototype = new BaseSprite();
TextBox.prototype = new BaseLabel();
Bezier.prototype = new Osmosis();
Checkbox.prototype = new Osmosis();
RadioButton.prototype = new Osmosis();
Line.prototype = new Osmosis();
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
}/*! THM_publisher_light.js */
// ---------------------------------------------------------------------
// The comunication layer between the demo and our server
// Author: Ethan Greavette
// Date: 7/07/2010
// Comments: This is a "lite" version of the publisher used on our website.
// ---------------------------------------------------------------------


/*
Math.uuid.js (v1.4)
http://www.broofa.com
mailto:robert@broofa.com

Copyright (c) 2010 Robert Kieffer
Dual licensed under the MIT and GPL licenses.
*/

/*
 * Generate a random uuid.
 *
 * USAGE: Math.uuid(length, radix)
 *   length - the desired number of characters
 *   radix  - the number of allowable values for each character.
 *
 * EXAMPLES:
 *   // No arguments  - returns RFC4122, version 4 ID
 *   >>> Math.uuid()
 *   "92329D39-6F5C-4520-ABFC-AAB64544E172"
 *
 *   // One argument - returns ID of the specified length
 *   >>> Math.uuid(15)     // 15 character ID (default base=62)
 *   "VcydxgltxrVZSTV"
 *
 *   // Two arguments - returns ID of the specified length, and radix. (Radix must be <= 62)
 *   >>> Math.uuid(8, 2)  // 8 character ID (base=2)
 *   "01001010"
 *   >>> Math.uuid(8, 10) // 8 character ID (base=10)
 *   "47473046"
 *   >>> Math.uuid(8, 16) // 8 character ID (base=16)
 *   "098F4D35"
 */
(function() {
  // Private array of chars to use
  var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');

  Math.uuid = function (len, radix) {
	var chars = CHARS, uuid = [];
	radix = radix || chars.length;

	if (len) {
	  // Compact form
	  for (var i = 0; i < len; i++) uuid[i] = chars[0 | Math.random()*radix];
	} else {
	  // rfc4122, version 4 form
	  var r;

	  // rfc4122 requires these characters
	  uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
	  uuid[14] = '4';

	  // Fill in random data.  At i==19 set the high bits of clock sequence as
	  // per rfc4122, sec. 4.1.5
	  for (i = 0; i < 36; i++) {
		if (!uuid[i]) {
		  r = 0 | Math.random()*16;
		  uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
		}
	  }
	}

	return uuid.join('');
  };

  // A more performant, but slightly bulkier, RFC4122v4 solution.  We boost performance
  // by minimizing calls to random()
  Math.uuidFast = function() {
	var chars = CHARS, uuid = new Array(36), rnd=0, r;
	for (var i = 0; i < 36; i++) {
	  if (i==8 || i==13 ||  i==18 || i==23) {
		uuid[i] = '-';
	  } else if (i==14) {
		uuid[i] = '4';
	  } else {
		if (rnd <= 0x02) rnd = 0x2000000 + (Math.random()*0x1000000)|0;
		r = rnd & 0xf;
		rnd = rnd >> 4;
		uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
	  }
	}
	return uuid.join('');
  };

  // A more compact, but less performant, RFC4122v4 solution:
  Math.uuidCompact = function() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	  var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
	  return v.toString(16);
	}).toUpperCase();
  };
})();

// If no jQuery then don't load server code
if(typeof jQuery !== "undefined") {
	/*************************
	jquery-json
	*************************/

	(function($){$.toJSON=function(o)
	{var type;
	if(typeof(JSON)=='object'&&JSON.stringify)
	return JSON.stringify(o);type=typeof(o);if(o===null)
	return"null";if(type=="undefined")
	return undefined;if(type=="number"||type=="boolean")
	return o+"";if(type=="string")
	return $.quoteString(o);if(type=='object')
	{if(typeof o.toJSON=="function")
	return $.toJSON(o.toJSON());if(o.constructor===Date)
	{var month=o.getUTCMonth()+1;if(month<10)month='0'+month;var day=o.getUTCDate();if(day<10)day='0'+day;var year=o.getUTCFullYear();var hours=o.getUTCHours();if(hours<10)hours='0'+hours;var minutes=o.getUTCMinutes();if(minutes<10)minutes='0'+minutes;var seconds=o.getUTCSeconds();if(seconds<10)seconds='0'+seconds;var milli=o.getUTCMilliseconds();if(milli<100)milli='0'+milli;if(milli<10)milli='0'+milli;return'"'+year+'-'+month+'-'+day+'T'+
	hours+':'+minutes+':'+seconds+'.'+milli+'Z"';}
	if(o.constructor===Array)
	{var ret=[];for(var i=0;i<o.length;i++)
	ret.push($.toJSON(o[i])||"null");return"["+ret.join(",")+"]";}
	var pairs=[];for(var k in o){var name;type=typeof k;if(type=="number")
	name='"'+k+'"';else if(type=="string")
	name=$.quoteString(k);else
	continue;if(typeof o[k]=="function")
	continue;var val=$.toJSON(o[k]);pairs.push(name+":"+val);}
	return"{"+pairs.join(", ")+"}";}};$.evalJSON=function(src)
	{if(typeof(JSON)=='object'&&JSON.parse)
	return JSON.parse(src);return eval("("+src+")");};$.secureEvalJSON=function(src)
	{if(typeof(JSON)=='object'&&JSON.parse)
	return JSON.parse(src);var filtered=src;filtered=filtered.replace(/\\["\\\/bfnrtu]/g,'@');filtered=filtered.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,']');filtered=filtered.replace(/(?:^|:|,)(?:\s*\[)+/g,'');if(/^[\],:{}\s]*$/.test(filtered))
	return eval("("+src+")");else
	throw new SyntaxError("Error parsing JSON, source is not valid.");};$.quoteString=function(string)
	{if(string.match(_escapeable))
	{return'"'+string.replace(_escapeable,function(a)
	{var c=_meta[a];if(typeof c==='string')return c;c=a.charCodeAt();return'\\u00'+Math.floor(c/16).toString(16)+(c%16).toString(16);})+'"';}
	return'"'+string+'"';};var _escapeable=/["\\\x00-\x1f\x7f-\x9f]/g;var _meta={'\b':'\\b','\t':'\\t','\n':'\\n','\f':'\\f','\r':'\\r','"':'\\"','\\':'\\\\'};})(jQuery);

	/**
	An ajax push for when a demo questions is answered
	@class submit_demo_quiz_answer
	@param  {string} demo_name The name of this demo
	@param  {string} quiz_name The name of the question in this demo being answered
	@param  {boolean} is_correct True if the answer was correct and false otherwise
	@param  {object} callback The function to call on success
	@return {void} Nothing
	*/
	function submit_demo_quiz_answer(demo_name, quiz_name, is_correct, callback) {
	    var uuid = Math.uuid();
	    var timestamp = timestamp = (new Date()).getTime()/1000.0;
	    var publisherURL = "http://" + targetURL + "/epublisher/";
	    var data = [{
	        "module_id": "demo",
	        "command_id": "student_submit_demo_question_answer",
	        "command_uuid": uuid,
	        "timestamp": timestamp,
	        "data": "",
	        "args": {
	            "demo_name": demo_name,
	            "question_name": quiz_name,
	            "is_correct": is_correct
	        }
	    }];
	    data = $.toJSON(data);
	    $.ajax({
	        "url": publisherURL,
	        "type": "POST",
	        "data": { data: data },
	        "success": callback
    	});
	}

	/**
	An ajax push the register new questions.
	@class submit_demo_quiz_answer
	@param  {string} demo_name The name of this demo.
	@param  {number} number_of_questions The total number of quizzes in this demo.
	@param  {array} quiz_names The array of all the question names in this demo.
	@return {boolean} Returns true if user has teacher role and false otherwise.
	*/
	function register_questions(demo_name, number_of_questions, question_names){
        if( typeof window.site_data !== "undefined" ) {
        		if( window.site_data.settings.THM_USER_ROLE  != "teacher" ) { return false; }

			var uuid = Math.uuid();
			var timestamp = timestamp = (new Date()).getTime()/1000.0;
			var publisherURL = "http://" + targetURL + "/epublisher/";
			var data = [{
			    "module_id": "demo",
			    "command_id": "add_demo_questions",
			    "command_uuid": uuid,
			    "timestamp": timestamp,
			    "data": "",
			    "args": {
			        "demo_target_id": demo_name,
			        "array_of_demo_question_names": question_names
			    }
			}];
			data = $.toJSON(data);
			$.ajax({
			    "url": publisherURL,
			    "type": "POST",
			    "data": { data: data }
			});
		}
		return true;
	}
}
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
/*! THP_Template.js */
// ---------------------------------------------------------------------
// THP_Template.js
// Author: Anson MacKeracher, Ethan Greavette
// Date: 6/21/2010
// Comments: This template script constructs the demo template that the
//           demo lives in. Please note that THP_Template.js requires
//           the presence of osmosis.js compatibility layer to function
//           properly!
// ---------------------------------------------------------------------
/**
The main object of the demo
@class THP_Template
@param  {object} plugin The monocleGL plugin object
@param  {number} width The width of the sprite
@param  {number} height The height of the sprite
@param  {number} sceneDescriptor The number of scenes in this demo
@return {void} Nothing
*/
function THP_Template(plugin, width, height, sceneDescriptor) {
    var that = this;
	if (typeof jQuery === "undefined")	{
		logDebug("Demo on local server");
		this.boolSimulate = true;
	} else {
		logDebug("Demo on THM server");
		this.boolSimulate = false;
	}

	if(typeof plugin.isMobile !== "undefined") {
		this.boolMobile = plugin.isMobile();
	} else {
		// TODO use only isMobile once implemented
		this.boolMobile = true;
	}

	if(typeof plugin.getPluginVersion === "undefined") {
		logDebug("No plugin found");
	 	return false;
    }
	logDebug("monocleGL version: " + plugin.getPluginVersion() );

	// Record plugin infromation
    this.plugin = plugin; // Keep a reference to the plugin object
    this.width = width;
    this.height = height;
	this.travelTime = 0.25;

	// Set demo spefic varibles
    this.totalFinished = 0;
    this.plugin.setInteractive(true);
	this.demo_name = window.demo_name;
	this.submissionRetryID = 0;


	// Setup explore mode varibles
	this.funcExploreInit = null;
	this.funcExploreCleanUp = null;
	this.scnExplore = new Scene(this.plugin, false);
	this.boolExplore = false;
	this.boolExploring = false;
	this.expLayer = new Layer(this.plugin, 0, 0, 480, 320);
	this.expLayer.setColor(0, 0, 0, 0);
	this.scnLast;

	// Create the scene array if the user entered a number for the # of questions
	this.currentScene = 0;
    this.totalScenes = 0;
	if( typeof sceneDescriptor === "number") {
		this.totalScenes = sceneDescriptor;
		sceneDescriptor = new Array();

		// Push a 1 for each question in the demo
		for(i = 0; i < this.totalScenes; i++) {
			sceneDescriptor.push(1);
		}
	} else {
		// Record of the total number of questions
		for(i = 0; i < sceneDescriptor.length; i++) {
			this.totalScenes = this.totalScenes + sceneDescriptor[i];
		}
	}

    // ---------------------------------------------------------------------
    // Set up demo layers and sprites

 	// Create the very back layer
    this.preload_layer = new Layer(this.plugin, 0, 0, 480, 320);

	// Create the background image
    this.preload_sprite = new Sprite(this.plugin, "thm_loader.png", 0, 0, 480, 320);

	// Create the progress bar
    this.preload_loadingbar_container = new Primitive(this.plugin, "rectangle", 115, 30, 250, 20);
    this.preload_loadingbar_container.setColor(0.7, 0.7, 0.7, 0.7);
    this.preload_loadingbar = new Primitive(this.plugin, "rectangle", 118, 33, 0, 14);
    this.preload_loadingbar.setColor(0.3, 0.3, 0.9, 1.0);

	// Create the loading label
    this.preload_label = new Label(this.plugin, "Loading...", 2, 115, 30, 250, 20);
    this.preload_label.setColor(0.0, 0.0, 0.0, 0.0);
    this.preload_label.setCaptionColor(0.0, 0.0, 0.0, 1.0);
    this.preload_label.setCaptionColor(0.0, 0.0, 0.0, 1.0);
    this.preload_label.setAnchor("center");

	// Make a new scene and add all the childern
    this.preload_scene = new Scene(this.plugin, false);
    this.preload_scene.addChild(this.preload_layer);
    this.preload_layer.addChild(this.preload_sprite);
    this.preload_layer.addChild(this.preload_loadingbar_container);
    this.preload_layer.addChild(this.preload_loadingbar);
    this.preload_layer.addChild(this.preload_label);
    this.plugin.setScene(this.preload_scene.getId());

    // Demo background
    this.layoutFrameSprite = new Sprite(this.plugin, "demo_layout_frame.png", 0, 0, 480, 320);

    // Set up menus and their callbacks.
    this.answerPanelLayer = new Layer(this.plugin, 480, 0, 65, 320);
    this.answerPanelLayer.setColor(0.0, 0.0, 0.0, 0.0);

    // Submit answer button
    this.submitButton = new Button(this.plugin, "submit", 0, 250, 60, 39);
    this.submitButton.subscribe();
    this.submitButton.clickCallback(this, "submitAnswer");

    // Answer button appears once the tries are used up
    this.answerButton = new Button(this.plugin, "answer", 0, 250, 60, 39);
    this.answerButton.clickCallback(this, "showAnswer");
	this.answerButton.setVisibility(false);
    this.answerButton.setActive(false);

    // Explore button appears once the tries are used up
    this.readyButton = new Button(this.plugin, "ready", 0, 250, 60, 39);
    this.readyButton.clickCallback(this, "endExplore");
	this.readyButton.setVisibility(false);
	this.readyButton.setActive(false);


	// The "wifi connecting" indicator
    this.wifiGreySprite = new Sprite(this.plugin, "wifiGrey.png", 35, 230, 20, 20);
    this.wifiGreySprite.setVisibility(false);

	// The "wifi connected" indicator
    this.wifiGreenSprite = new Sprite(this.plugin, "wifiGreen.png", 35, 230, 20, 20);
    this.wifiGreenSprite.setVisibility(false);

	// The "wifi simulated" indicator
    this.wifiBlueSprite = new Sprite(this.plugin, "wifiBlue.png", 35, 230, 20, 20);
    this.wifiBlueSprite.setVisibility(false);

    // The "correct answer" indicator
    this.checkSprite = new Sprite(this.plugin, "check.png", 6, 230, 24, 20);
    this.checkSprite.setVisibility(false);

    // The "incorrect answer" indicator
    this.crossSprite = new Sprite(this.plugin, "cross.png", 10, 230, 20, 20);
    this.crossSprite.setVisibility(false);

	// The answer panel graphics
    this.answerPanelSprite = new Sprite(this.plugin, "demo_menu_right.png", 0, 0, 65, 320);

	// The label "title" on the progress bar
    this.questionLabel = new Label(this.plugin, "", 12,  10, 210, 460, 80);
    this.questionLabel.setColor(0.0, 0.0, 0.0, 0.0);
    this.questionLabel.setCaptionColor(0.0, 0.0, 0.0, 1.0);
	this.questionLabel.setVisibility(true);
	this.questionLabel.setWrap(true);

	// The label "title" on the progress bar
    this.titleLabel = new Label(this.plugin, "", 12, -320, 290, 315, 20);
    this.titleLabel.setColor(0.0, 0.0, 0.0, 0.0);
    this.titleLabel.setCaptionColor(0.0, 0.0, 0.0, 1.0);
    this.titleLabel.setVisibility(true);
    this.titleLabel.setAnchor("right");

	// Add all the childern to the answer panel layer
    this.answerPanelLayer.addChild(this.answerPanelSprite);
    this.answerPanelLayer.addChild(this.titleLabel);
    this.answerPanelLayer.addChild(this.submitButton);
    this.answerPanelLayer.addChild(this.answerButton);
	this.answerPanelLayer.addChild(this.readyButton);
	this.answerPanelLayer.addChild(this.wifiGreySprite);
	this.answerPanelLayer.addChild(this.wifiGreenSprite);
	this.answerPanelLayer.addChild(this.wifiBlueSprite);
    this.answerPanelLayer.addChild(this.checkSprite);
    this.answerPanelLayer.addChild(this.crossSprite);

	// Create the bottom panel layer
    this.bottomPanelLayer = new Layer(this.plugin, 0, -51, 480, 51);
    this.bottomPanelLayer.setColor(0.0, 0.0, 0.0, 0.0);

	// The bottom panel graphic
    this.menuBottomSprite = new Sprite(this.plugin, "demo_menu_bottom.png", 0, 0, 480, 51);

	// The status bar for showing user how many questions they have
    this.demoStatusSprite = new Sprite(this.plugin, "demo_status_white.png", 45, 6, 259, 26);

	// The previous scene button
    this.previousSceneButton = new Button(this.plugin, "prevScene", 3, 10, 39, 39);
    this.previousSceneButton.upCallback(this, "prevScene");
	this.previousSceneButton.setActive(false);

	// The next scene button
    this.nextSceneButton = new Button(this.plugin, "nextScene", 437, 10, 39, 39);
    this.nextSceneButton.upCallback(this, "nextScene");
	this.nextSceneButton.setActive(false);

	// The reset scene button
    this.refreshButton = new Button(this.plugin, "refresh", 320, 6, 42, 27);
    this.refreshButton.upCallback(this, "resetButtonClickCallback");
	this.refreshButton.setActive(true);

	// The explore button
    this.exploreButton = new Button(this.plugin, "explore", 360, 6, 42, 27);
	this.exploreButton.clickCallback(this, "gotoExplore");
	this.exploreButton.setActive(false);

	// Set up the tries & status labels
    this.triesLabel = new Label(this.plugin, "Quiz: Submission chances left 3", 1, 50, 12, 200, 20);
    this.triesLabel.setColor(1.0, 1.0, 1.0, 0.0);
    this.triesLabel.setCaptionColor(0.0, 0.0, 0.0, 1.0);

	// Add all the childern to the bottom panel layer
    this.bottomPanelLayer.addChild(this.menuBottomSprite);
    this.bottomPanelLayer.addChild(this.nextSceneButton);
    this.bottomPanelLayer.addChild(this.previousSceneButton);
    this.bottomPanelLayer.addChild(this.demoStatusSprite);
    this.bottomPanelLayer.addChild(this.refreshButton);
    this.bottomPanelLayer.addChild(this.exploreButton);
    this.bottomPanelLayer.addChild(this.triesLabel);

	// Add the arrows pointing up to the bottom of the screen
    this.bottomPanelHoverSprite = new Sprite(this.plugin, "", 0, 0, this.width, 32);
    this.bottomPanelHoverSprite.subscribe();
    this.bottomPanelHoverSprite.overCallback(this, "bottomPanelHoverCallback");
	this.bottomPanelHoverSprite.clickCallback(this, "bottomPanelHoverCallback");

	// Add the arrows pointing left to the right of the screen
    this.answerPanelHoverSprite = new Sprite(this.plugin, "", 460, 0, 20, this.height);
    this.answerPanelHoverSprite.subscribe();
    this.answerPanelHoverSprite.overCallback(this, "answerPanelHoverCallback");
	this.answerPanelHoverSprite.clickCallback(this, "answerPanelHoverCallback");

	// Add to the middle of the screen from moving panel back
    this.problemAreaHoverSprite = new Sprite(this.plugin, "", 0, 50, 400, 270);
    this.problemAreaHoverSprite.subscribe();
    this.problemAreaHoverSprite.overCallback(this, "problemAreaHoverCallback");
	this.problemAreaHoverSprite.clickCallback(this, "problemAreaHoverCallback");

	// The arrow on the answer and bottom panel
    this.bottomPanelHoverArrowSprite = new Sprite(this.plugin, "btnSmallArrowUpGrey.png", 230, 0, 20, 20);
    this.answerPanelHoverArrowSprite = new Sprite(this.plugin, "btnSmallArrowLeftGrey.png", 460, 150, 20, 20);

	// Back to PhoneGap button
    // TODO: Make the functionality of this button more obvious
    this.backToPG = new Button(this.plugin, "prevScene", 10, 285, 30, 30);
    this.backToPG.bind("mouse_up", function() {
            that.plugin.loadPhoneGap();
        });
    this.backToPG.subscribe();

	var xOffset = 0;
	if(this.boolMobile) xOffset = 30;

	// The progress bar sprite
    this.progressBarSprite = new Sprite(this.plugin, "demo_progress_red.png", 15 + xOffset, 290, 110, 20);

	// The label "update" on the progress bar
    this.progressBarLabel = new Label(this.plugin, "Progress ", 1, 28 + xOffset, 292, 40, 20);
    this.progressBarLabel.setColor(0.0, 0.0, 0.0, 0.0);
    this.progressBarLabel.setCaptionColor(1.0, 1.0, 1.0, 1.0);

	// The label to update how many quizzes the user has finished
    this.progressBarCount = new Label(this.plugin, "(" + this.totalFinished + "/" + this.totalScenes + ")", 1, 80 + xOffset, 292, 30, 20);
    this.progressBarCount.setColor(0.0, 0.0, 0.0, 0.0);
    this.progressBarCount.setCaptionColor(1.0, 1.0, 1.0, 1.0);

    // Add the left "cap" to the progress bar
    this.progressLeftSprite = new Sprite(this.plugin, "demo_progress_left.png", 15 + xOffset, 290, 8, 20);
    this.progressLeftSprite.setVisibility(false);

    // Add the right "cap" to the progress bar
    this.progressRightSprite = new Sprite(this.plugin, "demo_progress_right.png", 120 + xOffset, 290, 8, 20);
    this.progressRightSprite.setVisibility(false);

    // Add the "middle" sprite to the progress bar
    this.progressMiddleSprite = new Sprite(this.plugin, "demo_progress_middle.png", 17 + xOffset, 290, 8, 0);

	// Add the instruct sprite at the beginning
    this.instructionsSprite = new Sprite(this.plugin, "demo_instructions_bg.png", 115, 65, 250, 200);
    this.instructionsSprite.setVisibility(false);

	// Add the "ok" button the allow the user to continue
    this.instructionsButton = new Button(this.plugin, "ok", 318, 79, 36, 28);
    this.instructionsButton.subscribe();
    this.instructionsButton.setVisibility(false);
    this.instructionsButton.upCallback(this, "hideInstructions");

	// Add the label for "Instructions:"
    this.instructionsLabel = new Label(this.plugin, "Instructions:", 3, 130, 200, 200, 50);
    this.instructionsLabel.setColor(1.0, 1.0, 1.0, 0.0);
    this.instructionsLabel.setCaptionColor(0.0, 0.0, 0.0, 1.0);
    this.instructionsLabel.setVisibility(false);

	// Add the label for the instruction text
    this.instructionsTextLabel = new Label(this.plugin, "Placeholder", 1, 130, 100, 200, 100);
    this.instructionsTextLabel.setColor(1.0, 1.0, 1.0, 0.0);
    this.instructionsTextLabel.setCaptionColor(0.0, 0.0, 0.0, 1.0);
    this.instructionsTextLabel.setVisibility(false);
    this.instructionsTextLabel.setWrap(true);

    // Setup the promblem area label layers
    this.problemLayer = new Layer(this.plugin, 0, 0, 480, 320);
    this.problemLayer.setColor(0.88, 0.88, 0.88, 1.0);
    this.problemLayer.addChild(this.layoutFrameSprite);
    this.problemLayer.addChild(this.bottomPanelHoverArrowSprite);
    this.problemLayer.addChild(this.answerPanelHoverArrowSprite);

    // Setup the curtain layer to darken the screen
    this.curtainLayer = new Layer(this.plugin, 0, 0, this.width, this.height);
    this.curtainLayer.setColor(0.0, 0.0, 0.0, 0.0);
    this.curtainLayer.addChild(this.instructionsSprite);
    this.curtainLayer.addChild(this.instructionsButton);

    this.panelState = {
        RETRACTED  : 0,
        EXTENDING  : 1,
        EXTENDED   : 2,
        RETRACTING : 3
    };

    // Initialize the state machine
    this.bottomPanelState = this.panelState.RETRACTED;
    this.answerPanelState = this.panelState.RETRACTED;

    // Controls whether the panels are locked
	this.bottomPanelLock = false;
    this.answerPanelLock = false;

	// Setup the scene array
    this.sceneArray = [];
	this.quizNames = [];
    for(var j = 0; j < sceneDescriptor.length; j++) {
        this.sceneArray[j] = new Scene(this.plugin);
		this.quizNames.push("Q"+(j+1));
		logDebug("Scene created " + this.quizNames);
    }

    // CLIPPING INFORMATION FOR PLUGIN
    // Ask Anson before fux0ring with this plz
    this.headerClipping = 60;
    this.footerClipping = 25;

	// -------------------------------------------------------------------------
    // Functions

	/**
	Returns the cliping information for the top and the bottom of the plugin
	@param  {void} Nothing
	@return {array} An array with the 1st element the header clipping value and the 2nd element being the footer clipping value.
	*/
    this.getWindowClipping = new function() {
    		logDebug("Clipping infromation called, header: "+ this.headerClipping + " footer: " + this.footerClipping);
        return [this.headerClipping, this.footerClipping];
    };

	/**
	Set up callback functions for when the show answer button is pressed.
	@param  {number} x The x position of the mouse.
	@param  {number} y The y position of the mouse.
	@return {void} Nothing.
	*/
    this.showAnswer = function(x, y) {
   		var scene = this.getCurrentScene();
		scene.showCorrectAnswer();
	};

    /**
	Set up callback functions for when the submit button is pressed.
	@param  {void} Nothing.
	@return {void} Nothing.
	*/
    this.submitAnswer = function() {
        if( this.totalFinished === this.totalScenes || this.getCurrentScene().getCompleted() ) {
        		logError("The demo tried to submit a question after it's done answering all the questions.");
            return;
        }

		// Check if answer is right or not
        if(this.getCurrentScene().checkAnswer()) {

			// If the user was correct then update progress and set scene bits
			logDebug("Check answer true");
			this.totalFinished = this.totalFinished + 1;
			this.updateProgress();
			this.getCurrentScene().setCorrect(true);
			this.getCurrentScene().setCompleted(true);

			// Send the correct message to the server
			this.persistentSubmission(this);
		} else {

			// If the user was incorrect subtract a try from the scene
			logDebug("Check answer false");
            this.getCurrentScene().decrementTries();
            if(this.getCurrentScene().getTries() === 0) {

            		// Update progress and set scene bits
				this.totalFinished = this.totalFinished + 1;
				this.updateProgress();
				this.getCurrentScene().setCorrect(false);
				this.getCurrentScene().setCompleted(true);

				// Send the correct message to the server and show the answer
				this.persistentSubmission(this);
				this.showAnswer();
            }
        }

        // Update the UI to reflect the new state changes
        this.drawUI();
    };

	/**
	Set up the callback function to extend the bottom panel when the mouse goes over the bottom part of the screen.
	@param  {number} x The x position of the mouse.
	@param  {number} y The y position of the mouse.
	@return {void} Nothing.
	*/
    this.bottomPanelHoverCallback = function(x, y) {
    		// Check if state of bottom panel is retracted then extend the bottom panel
        if(this.bottomPanelState === this.panelState.RETRACTED) {
            this.extendBottomPanel();
        }
    };

	/**
	Set up the callback function to extend the answer panel when the mouse goes over the right part of the screen.
	@param  {number} x The x position of the mouse.
	@param  {number} y The y position of the mouse.
	@return {void} Nothing.
	*/
    this.answerPanelHoverCallback = function(x, y) {
    		// Check if state of answer panel is retracted then extend the answer panel
        if(this.answerPanelState === this.panelState.RETRACTED) {
            this.extendAnswerPanel();
        }
    };

	/**
	Set up the callback function to retract the answer and bottom panels when the mouse goes over the middle of the screen.
	@param  {number} x The x position of the mouse.
	@param  {number} y The y position of the mouse.
	@return {void} Nothing.
	*/
    this.problemAreaHoverCallback = function(x, y) {
    		// Check if the answer panel is extended then retract the answer panel
        if(this.answerPanelState === this.panelState.EXTENDED) {
            this.retractAnswerPanel();
        // Check if the answer panel is extending then set the waiting bit to retract after extension
        } else if(this.answerPanelState === this.panelState.EXTENDING) {
            this.waitingToRetractAnswer = true;
        }

        // Check if the bottom panel is extended then retract the bottom panel
        if(this.bottomPanelState === this.panelState.EXTENDED) {
            this.retractBottomPanel();
        // Check if the bottom panel is extending then set the waiting bit to retract after extension
        } else if(this.bottomPanelState === this.panelState.EXTENDING) {
            this.waitingToRetractBottom = true;
        }
    };

	/**
	Retract the answer panel if it's extended and is not currently being tweened.
	@param  {void} Nothing.
	@return {void} Nothing.
	*/
	this.retractAnswerPanel = function() {
		// Check if the answer panel is locked before retracting it
        if(!this.answerPanelLock) {
        		// Set the answer panel state to retracting and the arrows the by visible
            this.answerPanelState = this.panelState.RETRACTING;
			this.answerPanelHoverArrowSprite.setVisibility(true);

			// Set the tweens to retract the answer panel and a callback when complete
			this.answerPanelLayer.addTween("x:480,persistent:true,transition:ease_out,time:"+this.travelTime);
			setTimeout(this.answerMoveDone, (this.travelTime * 1000) + 250, this);
        }
	};

	/**
	Extend the answer panel if it's retracted and is not currently being tweened.
	@param  {void} Nothing.
	@return {void} Nothing.
	*/
	this.extendAnswerPanel = function() {
		// Check if the answer panel is locked before extending it
        if(!this.answerPanelLock) {
        		// Set the answer panel state to extending and the arrows the by invisible
            this.answerPanelState = this.panelState.EXTENDING;
			this.answerPanelHoverArrowSprite.setVisibility(false);

			// Set the tweens to extend the answer panel and a callback when complete
			this.answerPanelLayer.addTween("x:415,persistent:true,transition:ease_out,time:"+this.travelTime);
			setTimeout(this.answerMoveDone, (this.travelTime * 1000) + 250, this);
        }
	};

	/**
	Retract the bottom panel if it's extended and is not currently being tweened.
	@param  {void} Nothing.
	@return {void} Nothing.
	*/
	this.retractBottomPanel = function() {
		// Check if the bottom panel is locked before retracting it
        if(!this.bottomPanelLock) {
      		// Set the bottom panel state to retracting and the arrows the by visible
            this.bottomPanelState = this.panelState.RETRACTING;
            this.bottomPanelHoverArrowSprite.setVisibility(true);

            // Set the tweens to retract the bottom panel and a callback when complete
            this.bottomPanelLayer.addTween("y:-51,persistent:true,transition:ease_out,time:"+this.travelTime);
			setTimeout(this.bottomMoveDone, (this.travelTime * 1000) + 250, this);
        }
	};

	/**
	Extend the bottom panel if it's retracted and is not currently being tweened.
	@param  {void} Nothing.
	@return {void} Nothing.
	*/
	this.extendBottomPanel = function() {
		// Check if the bottom panel is locked before extending it
        if(!this.bottomPanelLock) {
        		// Set the bottom panel state to extending and the arrows the by invisible
            this.bottomPanelState = this.panelState.EXTENDING;
            this.bottomPanelHoverArrowSprite.setVisibility(false);

            // Set the tweens to retract the answer panel and a callback when complete
            this.bottomPanelLayer.addTween("y:0,persistent:true,transition:ease_out,time:"+this.travelTime);
			setTimeout(this.bottomMoveDone, (this.travelTime * 1000) + 250, this);
        }
	};

    /**
	Called when the answer panel is done moving.
	@param  {object} instance The reference to this template object instance.
	@return {void} Nothing.
	*/
	this.answerMoveDone = function(instance) {
		// Check if the answer panel is state is extending
        if(instance.answerPanelState === instance.panelState.EXTENDING) {
			// Check if the waitingToRetractAnswer bit is set
            if(instance.waitingToRetractAnswer) {
            		// Start answer panel retraction and turn off the bit
                instance.retractAnswerPanel();
                instance.waitingToRetractAnswer = false;
            } else {
            		// Change the answer panel state to be fully extended
                instance.answerPanelState = instance.panelState.EXTENDED;
            }
        // Check if the answer panel is state is retracting
        } else if (instance.answerPanelState === instance.panelState.RETRACTING) {
        		// Change the answer panel state to be fully retracted
            instance.answerPanelState = instance.panelState.RETRACTED;
        }
	};

	/**
	Called when the bottom panel is done moving.
	@param  {object} instance The reference to this template object instance.
	@return {void} Nothing.
	*/
	this.bottomMoveDone = function(instance) {
		// Check if the bottom panel is state is extending
        if(instance.bottomPanelState === instance.panelState.EXTENDING) {
       		// Check if the waitingToRetractBottom bit is set
            if(instance.waitingToRetractBottom) {
            		// Start bottom panel retraction and turn off the bit
                instance.retractBottomPanel();
                instance.waitingToRetractBottom = false;
            } else {
            		// Change the bottom panel state to be fully extended
                instance.bottomPanelState = instance.panelState.EXTENDED;
            }
        // Check if the bottom panel is state is retracting
        } else if (instance.bottomPanelState === instance.panelState.RETRACTING) {
        		// Change the bottom panel state to be fully retracted
            instance.bottomPanelState = instance.panelState.RETRACTED;
        }
	};

    /**
	Callback for when the reset button is pressed.
	@param  {number} x The x position of the mouse.
	@param  {number} y The y position of the mouse.
	@return {void} Nothing.
	*/
	this.resetButtonClickCallback = function(x, y) {
		// Check if in explore mode
		if(this.boolExploring === true) {
			// Reset explore mode
			this.scnExplore.resetQuiz();
			// Run the init script for explore mode
			if(this.funcExploreInit !== null) this.funcExploreInit();
		} else {
			// Reset the question and run the load quiz again
			this.getCurrentScene().resetQuiz();
  	  	}
    };

    /**
	Change the title displayed at the top left corner of the demo.
	@param  {string} title The string to replace the current title with.
	@return {void} Nothing.
	*/
    this.setTitle = function(title) {
        this.titleLabel.setText(title);
    };

    /**
	Change the number of tries allowed for the passed in scene.
	@param  {number} tries The new number of tries allowed for the passed in scene.
	@param  {object} scene The scene to change the number of tries in.
	@return {void} Nothing.
	*/
	this.setTries = function(tries, scene) {
        if(typeof tries !== "number") {
			logError("Demo tried to set the number of tries with a non-numeric varible.");
            return;
        }
        scene.setTries(tries);
    };

    /**
	Return the scene object for the scene number passed in.
	@param  {number} scene The scene number starting at 0.
	@param  {number} step Depercated, used for scene with multiple steps.
	@return {object} The scene object for the scene number passed in.
	*/
	this.getScene = function(scene, step) {
        return this.sceneArray[scene];
    };

    /**
	Returns the scene object currently being presented.
	@param  {void} Nothing.
	@return {object} The scene object for the scene currently being presented.
	*/
    this.getCurrentScene = function() {
        return this.getScene( this.currentScene );
    };

    /**
	Returns the scene number currently being presented.
	@param  {void} Nothing.
	@return {number} The scene number for the scene currently being presented.
	*/
    this.getSceneNumber = function() {
        return this.currentScene;
    };

	/**
	Returns a flat array with each scene's id.
	@param  {void} Nothing.
	@return {array} Returns a array of all the scene id's.
	*/
    this.getFlatSceneIdList = function() {
        var flatSceneIdList = new Array();
		flatSceneIdList.push(this.scnExplore.getId());

        // Populate the flat ID array with the ID with the ID for every scene
        for (var i = 0; i < this.sceneArray.length; i++) {
            flatSceneIdList.push(this.sceneArray[i].getId());
        }
        return flatSceneIdList;
    };

	/**
	Returns a flat array with each scene.
	@param  {void} Nothing.
	@return {array} Returns a array of all the scene objects.
	*/
    this.getFlatSceneList = function() {
        var flatSceneList = new Array();
		flatSceneList.push(this.scnExplore);

        // Populate the flat scene array with the refence for every scene
        for (var i = 0; i < this.sceneArray.length; i++) {
            flatSceneList.push(this.sceneArray[i]);
        }
        return flatSceneList;
    };

	/**
	Called when the preloader has finished completely.
	@param  {void} Nothing.
	@return {void} Nothing.
	*/
    this.donePreload = function() {
		// Show 100% complete progress bar
        that.preload_loadingbar.setDimensions(240, 14);

		that.plugin.setScene(that.sceneArray[0].getId());
        that.showInstructions();

        logDebug("Preload complete");
    };

	/**
	Called when the preloader has finished loading a single resource
	@param  {void} Nothing.
	@return {void} Nothing.
	*/
    this.updatePreload = function(increment, total) {
		// Update the width based on precent done
        var width = 240 * (increment/total);
        that.preload_loadingbar.setDimensions(width, 14);
        logDebug("loaded: " + increment / total);
    };

    /**
	Start the demo by preload all the images and running the initQuiz functions
	@param  {void} Nothing.
	@return {void} Nothing.
	*/
    this.begin = function() {
        plugin.hideSpinner();

		// Create the flat scene list and id list
        sceneIdArray = this.getFlatSceneIdList();
        sceneArray = this.getFlatSceneList();

		// Register questions with the
		if (typeof register_questions === "function") {
			register_questions(this.demo_name, this.js_getNumberOfQuizzes(), this.js_getQuizNames());
		}

		// Build up explore mode
		if (this.funcExploreInit !== null) this.funcExploreInit();
		if (this.boolExplore) this.scnExplore.initQuiz();
		this.buildExplore();

		// Build up each scene and call initQuiz function
		for(var i = 0; i < this.sceneArray.length; i++) {
			this.sceneArray[i].initQuiz();
			this.buildScene(this.sceneArray[i]);
        }

		// Start the preload
        logDebug("starting preload");
        this.preload_layer.bind("preload_update", this.updatePreload);
        this.preload_layer.bind("preload_complete", this.donePreload);
        this.plugin.preload(this.preload_layer.getId(), sceneIdArray);
    };

    /**
	Change the current scene to the next scene
	@param  {void} Nothing.
	@return {void} Nothing.
	*/
    this.nextScene = function() {
		clearTimeout(this.submissionRetryID);

        // Check if current scene is the last one
        if(this.currentScene  === this.totalScenes) {
            return;
        }
        this.getCurrentScene().cleanUp();

        // We are out of steps
        if(this.currentScene == this.sceneArray.length - 1) {
            this.nextSceneButton.setActive(false);
            return;
        }

        // Increment the scene and change it
        this.currentScene++;
        this.changeScene(this.sceneArray[this.currentScene]);

		// If the question is complete but it doesn't has the response on the server then try to resend
		if( this.getCurrentScene().getCompleted() && !this.getCurrentScene().getServerStatus() ) {
			this.submissionRetryID = setTimeout(this.persistentSubmission, 8000, this);
			logDebug("Submissive number = " + this.submissionRetryID);
		}
    };

	/**
	Change the current scene to the one provided
	@param  {object} scene The new scene to change to.
	@return {void} Nothing.
	*/
    this.changeScene = function(scene) {
        this.plugin.setScene(scene.getId());
        this.drawUI();
		this.getCurrentScene().loadQuiz();
    };

    /**
	Change the current scene to the previous scene
	@param  {void} Nothing.
	@return {void} Nothing.
	*/
    this.prevScene = function() {
		clearTimeout(this.submissionRetryID);

		// Is this the frist step
        if(this.currentScene === 0) {
        		logDebug("Frist scene");
            return;
        // Decrement the scene and change it
        } else {
       		this.getCurrentScene().cleanUp();
            this.currentScene--;
            this.changeScene(this.sceneArray[this.currentScene]);
        }

		// If the question is complete but it doesn't has the response on the server then try to resend
		if( this.getCurrentScene().getCompleted() && !this.getCurrentScene().getServerStatus() ) {
			this.submissionRetryID = setTimeout(this.persistentSubmission,8000, this);
			logDebug("Submissive number = " + this.submissionRetryID);
		}
    };

    /**
	Draw the current scene as well as the controls & menus.
	@param  {void} Nothing.
	@return {void} Nothing.
	*/
    this.drawUI = function() {
        var scene = this.getCurrentScene();

		if(scene.strInstruction === "") {
			this.questionLabel.setVisibility(false);
		} else {
			this.questionLabel.setVisibility(true);
			this.questionLabel.setText(scene.strInstruction);
		}

        // Update correct/incorrect indicators
        if(scene.getCompleted()) {
            if(scene.getCorrect()) {
				// is correct so show check
                this.crossSprite.setVisibility(false);
                this.checkSprite.setVisibility(true);
            } else {
				// Is incorrect so shown 'X'
                this.crossSprite.setVisibility(true);
                this.checkSprite.setVisibility(false);
            }

			if( scene.getServerStatus() && this.boolSimulate ) {
				// received by server (simulated)
				this.wifiGreenSprite.setVisibility(false);
				this.wifiBlueSprite.setVisibility(true);
				this.wifiGreySprite.setVisibility(false);
				// receive by server
			} else if ( scene.getServerStatus() && !this.boolSimulate ) {
				this.wifiGreenSprite.setVisibility(true);
                this.wifiBlueSprite.setVisibility(false);
				this.wifiGreySprite.setVisibility(false);
            } else {
				// not received by server
				this.wifiGreenSprite.setVisibility(false);
                this.wifiBlueSprite.setVisibility(false);
				this.wifiGreySprite.setVisibility(true);
            }

			// Activate the answer button
            this.submitButton.setActive(false);
			this.answerButton.setActive(true);
			this.readyButton.setActive(false);

			// Set the answer button to be visible
	  	  	this.submitButton.setVisibility(false);
		    this.answerButton.setVisibility(true);
		    this.readyButton.setVisibility(false);
        } else {
			// Set check and "X" icon off
			this.crossSprite.setVisibility(false);
            this.checkSprite.setVisibility(false);

			// Set all the wifi icons off
			this.wifiGreySprite.setVisibility(false);
			this.wifiGreenSprite.setVisibility(false);
			this.wifiBlueSprite.setVisibility(false);

			// Show grey wifi if the user has tried at least once
			if(scene.getTries() != 3) {
				this.wifiGreySprite.setVisibility(true);
				this.crossSprite.setVisibility(true);
			}

			// Activate the submit button
			this.submitButton.setActive(true);
			this.answerButton.setActive(false);
			this.readyButton.setActive(false);

			// Set the submit button to be visible
	  	  	this.submitButton.setVisibility(true);
		    this.answerButton.setVisibility(false);
		    this.readyButton.setVisibility(false);
        }

        // Update the next scene buttons
        if( !(this.currentScene === this.sceneArray.length - 1) ) {
			// If the question is complete and not at the end of the demo set next button to be active
            if(scene.getCompleted()) {
                this.nextSceneButton.setActive(true);
            //Else set next button to be inactive
            } else {
                this.nextSceneButton.setActive(false);
            }
        // If on the last question set next button to be inactive
        } else {
            this.nextSceneButton.setActive(false);
        }

        // Update the previous scene buttons
        if(!(this.currentScene === 0)) {
        		// If NOT on the frist question set previous button to be active
            this.previousSceneButton.setActive(true);
        } else {
       	 	// If on the frist question set previous button to be inactive
            this.previousSceneButton.setActive(false);
        }

		//
        this.triesLabel.setText("Quiz: Submission chances left " + scene.getTries());
    };

	/**
	Update the progress bar to reflect the current state of the demo.
	@param  {void} Nothing.
	@return {void} Nothing.
	*/
    this.updateProgress = function() {
        	var progressWidth = 0;
        if(this.totalFinished === 0) {
			logError("The demo has tried to up date the progress with 0 totalFinished");
            return;
        }

		// Set the progress bar text to update the totalFinished
        this.progressBarCount.setText("(" + this.totalFinished + "/" + this.totalScenes + ")");

		if(this.totalFinished === 1 && this.totalScenes !== 1) {
            // Remaining percentage of scenes
			progressWidth = (this.totalFinished / this.totalScenes)*94;
            this.progressMiddleSprite.setDimensions(progressWidth, 20);

            // Add the left "cap" to the progress bar
            this.progressLeftSprite.setVisibility(true);
        } else if (this.totalFinished == this.totalScenes) {

        		// Setup the middle and right cap to make it look complete
            this.progressMiddleSprite.setDimensions(109, 20);
            this.progressRightSprite.setVisibility(true);
        } else {

            // We are somewhere in the middle of the scene list
            progressWidth = (this.totalFinished / this.totalScenes)*94;
            this.progressMiddleSprite.setDimensions(progressWidth, 20);
            this.progressRightSprite.setVisibility(false);
            this.progressLeftSprite.setVisibility(true);
        }
    };

	/**
	Show the curtain and disable the interactive events
	@param  {void} Nothing.
	@return {void} Nothing.
	*/
	this.showCurtain = function() {
		this.curtainLayer.setColor(0.0, 0.0, 0.0, 0.25);
		this.plugin.setInteractive(false);
	};

	/**
	Hide the curtain and enable the interactive events.
	@param  {void} Nothing.
	@return {void} Nothing.
	*/
	this.hideCurtain = function() {
		this.curtainLayer.setColor(0.0, 0.0, 0.0, 0.0);
		this.plugin.setInteractive(true);
	};

    /**
	Show the instructions panel (auto-show the curtain).
	@param  {void} Nothing.
	@return {void} Nothing.
	*/
    this.showInstructions = function() {
		// Make the OK button active during the curtain
        this.plugin.addSpecial(this.instructionsButton.getId());
        this.showCurtain();

		// Set the instruction box to be visible
        this.instructionsSprite.setVisibility(true);
        this.instructionsLabel.setVisibility(true);
        this.instructionsTextLabel.setVisibility(true);
        this.instructionsButton.setVisibility(true);
        this.instructionsButton.subscribe();
    };

    /**
	Hide the instructions panel (auto-hide the curtain).
	@param  {void} Nothing.
	@return {void} Nothing.
	*/
    this.hideInstructions = function() {
   		// Make the OK button active during the curtain
        this.plugin.removeSpecial(this.instructionsButton.getId());
        this.hideCurtain();

        // Set the instruction box to be invisible
        this.instructionsSprite.setVisibility(false);
        this.instructionsLabel.setVisibility(false);
        this.instructionsTextLabel.setVisibility(false);
        this.instructionsButton.setVisibility(false);
        this.instructionsButton.unsubscribe();

        // Test if explore mode has been defined otherwise goto question 1
        if (this.funcExploreInit !== null || this.boolExplore) {
       	 	this.startExplore();
        } else {
			this.changeScene(this.sceneArray[0]);
        }
    };

    /**
	Change the actual text displayed in the instructions panel.
	@param  {string} text The text to be displayed intstruction panel.
	@return {void} Nothing.
	*/
    this.setInstructionText = function(text) {
        if(typeof text != "string") {
            logError("Cannnot set text of label to non-string value");
            return;
        }
        this.instructionsTextLabel.setText(text);
    };

	/**
	Change scene to the scene number passed in.
	@param  {number} numQ The scene number starting at 0.
	@param  {number} numS Depercated, used for scene with multiple steps.
	@return {void} Nothing.
	*/
	this.gotoScene = function(numQ, numS) {
		var scene = this.getScene(numQ, numS);
		this.currentScene = numQ;
		this.changeScene(scene);
	};

	/**
	Calls the current scenes clean up frist and then displays the explore mode scene.
	@param  {void} Nothing.
	@return {void} Nothing.
	*/
    this.gotoExplore = function() {
    	this.getCurrentScene().cleanUp();
    	this.startExplore();
    };

    /**
	Builds up the passed in scene as well as the controls & menus
    @param  {object} scene The scene object to add all the template resources to.
	@return {void} Nothing.
	*/
    this.buildScene = function(scene) {
		// Add the problem layer, developer background the the question label
		scene.addChild(this.problemLayer);
   		scene.addChild(scene.bgLayer);
        scene.addChild(this.questionLabel);

		// Add the panels
        scene.addChild(this.answerPanelLayer);
        scene.addChild(this.bottomPanelLayer);

        // Add the progress bar
		scene.addChild(this.progressBarSprite);
		scene.addChild(this.progressMiddleSprite);
		scene.addChild(this.progressLeftSprite);
		scene.addChild(this.progressRightSprite);
    	scene.addChild(this.progressBarLabel);
        scene.addChild(this.progressBarCount);

        // Add back to phone gap button if mobile
        if(this.boolMobile) scene.addChild(this.backToPG);

		// Add the curtain and everything that should be displayed over it
        scene.addChild(this.curtainLayer);
        scene.addChild(this.instructionsLabel);
        scene.addChild(this.instructionsTextLabel);
	};

	/**
	Builds up the explore mode scene as well as the controls & menus
    @param  {void} Nothing.
	@return {void} Nothing.
	*/
	this.buildExplore = function() {
		logDebug("Building up explore mode");

		// Add the problem layer, developer backgrond the the question label
		this.scnExplore.addChild(this.problemLayer);
		this.scnExplore.addChild(this.expLayer);
		this.scnExplore.addChild(this.scnExplore.bgLayer);
		this.scnExplore.addChild(this.questionLabel);

		// Add the panels
		this.scnExplore.addChild(this.answerPanelLayer);
        this.scnExplore.addChild(this.bottomPanelLayer);

		// Add the progress bar
	    this.scnExplore.addChild(this.progressBarSprite);
  	  	this.scnExplore.addChild(this.progressMiddleSprite);
  	  	this.scnExplore.addChild(this.progressLeftSprite);
   	 	this.scnExplore.addChild(this.progressRightSprite);
        this.scnExplore.addChild(this.progressBarLabel);
        this.scnExplore.addChild(this.progressBarCount);

        // Add back to phone gap button if mobile
        if(this.boolMobile) this.scnExplore.addChild(this.backToPG);

		// Add the curtain and everything that should be displayed over it
        this.scnExplore.addChild(this.curtainLayer);
        this.scnExplore.addChild(this.instructionsLabel);
        this.scnExplore.addChild(this.instructionsTextLabel);
	};

	/**
	Cleans up all previous scenes and display explore mode
    @param  {void} Nothing.
	@return {void} Nothing.
	*/
    this.startExplore = function() {
		logDebug("Starting in explore mode");

		// Record the current scene and change to explore mode
    		this.scnLast = this.getCurrentScene();
		this.plugin.setScene(this.scnExplore.getId());

		// Use the internal instruction unless it is empty
		if(this.scnExplore.strInstruction === "") {
			this.questionLabel.setVisibility(false);
		} else {
			this.questionLabel.setVisibility(true);
			this.questionLabel.setText(this.scnExplore.strInstruction);
		}

        	// Set the ready button to be active
		this.submitButton.setActive(false);
		this.answerButton.setActive(false);
		this.readyButton.setActive(true);
		this.exploreButton.setActive(false);

		// Set the ready button to be visible
  	  	this.submitButton.setVisibility(false);
        this.answerButton.setVisibility(false);
        this.readyButton.setVisibility(true);

		// Set the all the status symbols to false
		this.crossSprite.setVisibility(false);
		this.checkSprite.setVisibility(false);
		this.wifiGreenSprite.setVisibility(false);
        this.wifiBlueSprite.setVisibility(false);
		this.wifiGreySprite.setVisibility(false);

		// Run explore mode load function
		if(this.funcExploreInit !== null) {
			this.funcExploreInit();
		}
		this.boolExploring = true;
		this.scnExplore.loadQuiz();
    };

    /**
	Cleans up explore mode and displays the previous scene
    @param  {void} Nothing.
	@return {void} Nothing.
	*/
    this.endExplore = function() {
		logDebug("Exiting explore mode");

		// Set the subbit button to be active
        this.submitButton.setVisibility(true);
		this.answerButton.setVisibility(false);
        this.readyButton.setVisibility(false);

		// Set the subbit button to be visible
		this.submitButton.setActive(true);
		this.answerButton.setActive(false);
		this.readyButton.setActive(false);
		this.exploreButton.setActive(true);

		// Run the clean function for explore mode
		if(this.funcExploreCleanUp !== null) {
			this.funcExploreCleanUp();
		}
		this.boolExploring = false;
		this.scnExplore.cleanUp();

		// Return to the original question
		if(typeof this.scnLast !== 'undefined') this.changeScene(this.scnLast);
    };

    /**
	Get the demo name for this quiz
	@param  {void} Nothing.
	@return {string} Return the demo's name string.
	*/
    this.js_getDemoName = function() {
		return this.demo_name;
	};

	/**
	Set the demo name for this quiz
	@param  {string} passName The new demo's name string.
	@return {void} Nothing.
	*/
    this.js_setDemoName = function(passName) {
		this.demo_name = passName;
	};

    /**
	Gets the number of quizzes in demo
	@param  {void} Nothing.
	@return {number} Returns the number of quizzes in this demo
	*/
    this.js_getNumberOfQuizzes = function() {
		return this.sceneArray.length;
	};

	/**
	Gets the number of quizzes in demo
	@param  {void} Nothing.
	@return {array} Return an array of each question's name.
	*/
    this.js_getQuizNames = function() {
		return this.quizNames;
	};

	/**
	Called by the server when it's confirming it has recieved a submission.
	@param  {string} result1 The name of the question that the server is confirming.
	@param  {string} result2 The server returns "true" or "false" and if sent locally it will be "simulate".
	@return {void} Nothing.
	*/
	this.js_onQuizSubmit = function( result1, result2 ) {
		// Set server status to true
		var intQuiz = parseInt(result1.substr(1), 10) - 1;
		this.sceneArray[intQuiz].serverStatus = true;

		// Clear previous timer
		clearTimeout(this.submissionRetryID);

		if (result2 ==  "Simulate") {
			//  Set wifi to the blue symbol
			this.boolSimulate = true;
		} else {
			//  Set wifi to the green symbol
			this.boolSimulate = false;
		}

		this.drawUI();
	};

    /**
	Once this functions is called it will retry to sent the answer submission to the server every 8 seconds.
	@param  {object} that The reference to this template object instance.
	@return {void} Nothing.
	*/
	this.persistentSubmission = function(that) {
		// Clear previous timer
		clearTimeout(that.submissionRetryID);
		var strQuiz = "Q" + (that.currentScene + 1);

		// If the javascript is not on a remote server then use server simulation
		if (this.boolSimulate)	{
			that.js_onQuizSubmit(strQuiz, "Simulate");
			that.boolSimulate = true;
			return;
		} else {
			submit_demo_quiz_answer(that.demo_name, strQuiz, that.getCurrentScene().getCorrect(), function() { that.js_onQuizSubmit(strQuiz, "THM"); });
			that.boolSimulate = false;
		}

		// Set timer to try sending data again in 8 seconds
		that.submissionRetryID = setTimeout(that.persistentSubmission,8000, that);
		logDebug(that.submissionRetryID + " id: Try submission");

		return;
	};

	return true;
}
