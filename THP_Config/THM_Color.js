//------------------------------------------------------------------------------
// Color storage and conversion object
function THM_Color(r, g, b, a) {

	if(r === undefined) { this.r = 0; } else { this.r = r; }
	if(g === undefined) { this.g = 0; } else { this.g = g; }
	if(b === undefined) { this.b = 0; } else { this.b = b; }
	if(a === undefined) { this.a = 0; } else { this.a = a; }

	// Convert a hexdecimal string to openGL color ranges 
	this.convertHex = function(strHex) {
		var numHex = parseInt(strHex, 16);
		
		// Check if the color is 24 or 32 bit
		if(strHex.length === 8) {
			this.r = ((numHex >> 24) & 0xFF) / 0xFF;
			this.g = ((numHex >> 16) & 0xFF) / 0xFF;
			this.b = ((numHex >> 8) & 0xFF) / 0xFF;
			this.a = (numHex & 0xFF) / 0xFF;
		} else {
			this.r = ((numHex >> 16) & 0xFF) / 0xFF;
			this.g = ((numHex >> 8) & 0xFF) / 0xFF;
			this.b = (numHex & 0xFF) / 0xFF;
			this.a = 1.0;
		}
	};

	// Convert from standard color range (0-255) to openGL color range (0-1)
	this.convertRGBA = function(newR, newG, newB, newA) {
		this.r = newR / 0xFF;
		this.g = newG / 0xFF;
		this.b = newB / 0xFF;
		this.a = newA / 0xFF;
	};

	// No conversion just a direct copy
	this.setColor = function(newR, newG, newB, newA) {
		this.r = newR;
		this.g = newG;
		this.b = newB;
		this.a = newA;
	};
}
