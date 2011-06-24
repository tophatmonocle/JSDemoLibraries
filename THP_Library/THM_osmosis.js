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
	Notifies the plugin that this node does NOT want to recieve events.
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
