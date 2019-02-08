/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

"use strict";

const { numberToIdentifer } = require("../Template");
const { assignDeterministicIds } = require("../ids/IdHelpers");
const {
	concatComparators,
	compareSelect,
	compareStringsNumeric
} = require("../util/comparators");

/** @typedef {import("../Compiler")} Compiler */

const canMangleSomething = exportsInfo => {
	for (const exportInfo of exportsInfo.exports) {
		if (exportInfo.canMangle === true) {
			return true;
		}
	}
	return false;
};

const comparator = concatComparators(
	// Sort used before unused fields
	compareSelect(e => e.used !== false, (a, b) => (a === b ? 0 : a ? -1 : 1)),
	// Sort by name
	compareSelect(e => e.name, compareStringsNumeric)
);

class MangleExportsPlugin {
	/**
	 * @param {Compiler} compiler webpack compiler
	 * @returns {void}
	 */
	apply(compiler) {
		compiler.hooks.compilation.tap("MangleExportsPlugin", compilation => {
			const moduleGraph = compilation.moduleGraph;
			compilation.hooks.optimizeCodeGeneration.tap(
				"MangleExportsPlugin",
				modules => {
					for (const module of modules) {
						const exportsInfo = moduleGraph.getExportsInfo(module);
						if (!canMangleSomething(exportsInfo)) continue;
						const usedNames = new Set();
						const mangleableExports = [];
						// Don't rename single char exports or exports that can't be mangled
						for (const exportInfo of exportsInfo.exports) {
							const name = exportInfo.name;
							if (exportInfo.canMangle === true && /^a-zA-Z_\$$/.test(name)) {
								mangleableExports.push(exportInfo);
							} else {
								exportInfo.usedName = name;
								usedNames.add(name);
							}
						}
						assignDeterministicIds(
							mangleableExports,
							e => e.name,
							comparator,
							1,
							(e, n) => {
								const name = numberToIdentifer(n);
								const size = usedNames.size;
								usedNames.add(name);
								if (usedNames.size === size) return false;
								e.usedName = name;
								return true;
							},
							[10, 26, 52],
							52
						);
					}
				}
			);
		});
	}
}

module.exports = MangleExportsPlugin;
