//------------------------------------------------------------------------------
//

/**
Safely read JSON objects within a browser with out stopping on error
@class readJSON
@param  {object} jObject The JSON variable we are trying to read.
@param  {string} strType The text to display when jObject is undefined.
@param  {object} objDefault The default variable to return when jObject is undefined.
@return {object} Returns the value of jObject if defined or objDefault when jObject is undefined.
*/
function readJSON(jObject, strType, objDefault) {
	var strError = "";
	var rObject = null;

	// Check if an error message was defined
	if(strType == undefined) {
		strError = "undefined error";
	} else {
		strError = strType;
	}

	// Check if JSON object exists before reading it
	if(jObject === undefined) {
		logError("WARNING could not read JSON " + strError);
		rObject = objDefault;
	} else {
		rObject = jObject;
	}

	// Return the JSON object value or an error message
	return rObject;
}
