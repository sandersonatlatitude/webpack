/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

"use strict";

module.exports = (str, range) => {
	let v = str.length;
	let x = range;
	let y = 0;
	let z = 0;
	for (let i = 0; i < str.length; i++) {
		const c = str.charCodeAt(i);
		z = (z + v * 7 + c) % range;
		y = (y + z * 13 + c) % range;
		x = (x + y * 17 + c) % range;
		v = (v + x * 19 + c) % range;
	}
	return v;
};
