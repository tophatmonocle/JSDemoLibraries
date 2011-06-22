//------------------------------------------------------------------------------
// Safely read JSON objects within a browser with out stopping on error
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
		logError("ERROR reading JSON " + strError);
		rObject = objDefault;
	} else {
		rObject = jObject;
	}

	// Return the JSON object value or an error message
	return rObject;
}
