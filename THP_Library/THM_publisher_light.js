/*! THM_publisher_light.js */
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
