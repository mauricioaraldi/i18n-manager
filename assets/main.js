// Imports
const fs = require('fs');

// Consts
const LOCALES_PATH = 'locales';
const IDENTATION_STRING = '	';

// Globals
/**
 * Contains LOCALES as keys, and their value are the content of the locale files,
 * but as an array where each index is a line
 * 
 * @type {Object}
 */
LOCALES_AS_TEXT = {};

/**
 * Contains LOCALES as keys, and their value are the content of the locale files,
 * as objects also
 * 
 * @type {Object}
 */
LOCALES_AS_OBJECT = {};

// Body
loadLocales().then(
	result => drawLoadedLocales(LOCALES_AS_OBJECT),
	error => alert(error)
);

// Binds
window.onload = () => {
	document.querySelector('#verifySort').addEventListener('click', () => {
		let diff = [];

		for (let locale in LOCALES_AS_OBJECT) {
			let sortedValue = sortObject(LOCALES_AS_OBJECT[locale]),
				currentDiff = createSortingDiffFromMap(sortedValue);

			if (currentDiff.length) {
				diff.push(`<h2>${locale}</h2>`);
				diff.push(...currentDiff);
			}
		}

		printDiff(diff);

		document.querySelector('#applySort').classList.remove('hidden');
	});

	document.querySelector('#applySort').addEventListener('click', () => {
		let localesQuantity = 0,
			localesWritten = 0;

		for (let locale in LOCALES_AS_OBJECT) {
			let sortedValue = sortObject(LOCALES_AS_OBJECT[locale]);

			localesQuantity++;

			writeMapToFile(locale, sortedValue).then(
				resolve => {
					if (++localesWritten === localesQuantity) {
						alert('Sort applied!');
					}
				},
				error => alert(error)
			);
		}

		document.querySelector('#applySort').classList.add('hidden');
	});

	document.querySelector('#verifyIntegrity').addEventListener('click', () => {
		const comparisonResults = compareObjects(LOCALES_AS_OBJECT),
			diff = createIntegrityDiffFromObjects(comparisonResults);

		printDiff(diff);

		document.querySelector('#fixIntegrity').classList.remove('hidden');
	});

	document.querySelector('#fixIntegrity').addEventListener('click', () => {
		const fixedObjects = fixIntegrity(LOCALES_AS_OBJECT);

		let localesQuantity = 0,
			localesWritten = 0;

		for (let locale in fixedObjects) {
			localesQuantity++;

			writeObjectToFile(locale, fixedObjects[locale]).then(
				resolve => {
					if (++localesWritten === localesQuantity) {
						alert('Fix applied!');
					}
				},
				error => alert(error)
			);
		}

		document.querySelector('#fixIntegrity').classList.add('hidden');
	});
};

// Functions
/**
 * Writes an object into a file
 * 
 * @author mauricio.araldi
 * @since 0.0.1
 * 
 * @param {String} key The key that representes the locale (e.g. en-us, pt-br, etc)
 * @param {Object} object Object to be written in the file
 * @returns {Promise} Promise with the result of the operation
 */
function writeObjectToFile(key, object) {
	return new Promise((resolve, reject) => {
		let textContent = getLinesArrayFromObject(object).join('\n');

		fs.writeFile(`${LOCALES_PATH}/${key}.json`, textContent, err => {
			if (err) {
				return reject(err);
			};

			resolve(true);
		});
	});
}

/**
 * Get an array of lines from an object
 * 
 * @author mauricio.araldi
 * @since 0.0.1
 * 
 * @param {Object} object The object to be transformed into an array of lines
 * @param {Number} [identation = 1] The indentation to be used in text
 * @return {Array<String>} Lines representing the object
 */
function getLinesArrayFromObject(object, identation = 1) {
	let curObjAsArray = [];

	for (let key in object) {
		let value = object[key],
			curIdentation = IDENTATION_STRING.repeat(identation);

		if (!value) {
			continue;
		}

		if (typeof value === 'object') {
			value = getLinesArrayFromObject(value, identation + 1);

			curObjAsArray.push(`${curIdentation}"${key}": {`);
			curObjAsArray.push(...value);
			curObjAsArray.push(`${curIdentation}},`);
		} else {
			curObjAsArray.push(`${curIdentation}"${key}": "${value}",`);
		}
	}

	if (curObjAsArray.length) {
		// Removes last comma, because of JSON validity
		curObjAsArray[curObjAsArray.length - 1] = curObjAsArray[curObjAsArray.length - 1].slice(0, -1);
	}

	if (identation === 1) {
		curObjAsArray = ['{'].concat(curObjAsArray).concat(['}']);
	}

	return curObjAsArray;
}

/**
 * Fix the integrity of objects. At the moment, this means adding (never removing)
 * strings to make all objects equal
 * 
 * @author mauricio.araldi
 * @since 0.0.1
 * 
 * @param {Object} objects Objects to be fixed
 * @return {Object} Fixed objects
 */
function fixIntegrity(objects) {
	let results = JSON.parse(JSON.stringify(objects));

	for (let masterKey in objects) {
		let masterValue = results[masterKey];

		for (let comparisonKey in objects) {
			let comparisonValue = results[comparisonKey];

			if (comparisonKey === masterKey) {
				continue;
			}

			for (let key in masterValue) {
				if (!comparisonValue[key]) {
					results[comparisonKey][key] = results[masterKey][key];
				}

				if (typeof masterValue[key] === 'object') {
					let newVerification = {},
						newResults;

					newVerification[masterKey] = masterValue[key];
					newVerification[comparisonKey] = comparisonValue[key];

					newResults = fixIntegrity(newVerification);

					results[comparisonKey][key] = newResults[comparisonKey];
				}
			}
		}
	}

	return results;
}

/**
 * Creates a integrity diff from locale objects
 * 
 * @author mauricio.araldi
 * @since 0.0.1
 * 
 * @param {Object} object The objects with results of integrity comparison
 * @return {Array<String>} Diff of the objects
 */
function createIntegrityDiffFromObjects(object) {
	let diff = [],
		diffByKey = {};

	for (let key in object) {
		let value = object[key];

		for (let innerKey in value) {
			let innerValue = value[innerKey];

			diffByKey[innerKey] = [];

			innerValue.forEach(entry => {
				diffByKey[innerKey].push(`${entry} (present in ${key})`);
			});
		}
	}

	for (let key in diffByKey) {
		let value = diffByKey[key];

		if (!value.length) {
			continue;
		}

		diff.push(`<h2>${key}</h2>`);
		diff.push(...value);
	}

	return diff;
}

/**
 * Compare objects and return a diff
 * 
 * @author mauricio.araldi
 * @since 0.0.1
 *
 * @param {Object} objects Object with objects to compare. The key will be used
 * to separate results
 * @param {String} previousKey Key that preceds the objects being compared (used to 
 * create a path, like 'one.two.three')
 * @return {Object<Array<String>>} All the results of the comparison, by key
 */
function compareObjects(objects, previousKey) {
	let results = {};

	for (let masterKey in objects) {
		let masterValue = objects[masterKey];

		results[masterKey] = {};

		for (let comparisonKey in objects) {
			let comparisonValue = objects[comparisonKey];

			if (comparisonKey === masterKey) {
				continue;
			}

			results[masterKey][comparisonKey] = [];

			for (let key in masterValue) {
				if (!comparisonValue[key]) {
					results[masterKey][comparisonKey].push(
						`Missing <span class="diff-key">${previousKey ? `${previousKey}.` : ''}${key}</span>`
					);

					continue;
				}

				if (typeof masterValue[key] === 'object') {
					let newComparison = {},
						newResults;

					newComparison[masterKey] = masterValue[key];
					newComparison[comparisonKey] = comparisonValue[key];

					newResults = compareObjects(newComparison, `${previousKey ? `${previousKey}.` : ''}${key}`);

					results[masterKey][comparisonKey].push(...newResults[masterKey][comparisonKey]);
				}
			}
		}
	}

	return results;
}

/**
 * Writes a map into a file
 * 
 * @author mauricio.araldi
 * @since 0.0.1
 * 
 * @param {String} key The key that representes the locale (e.g. en-us, pt-br, etc)
 * @param {Map<String, any>} map Map of to be written in the file
 * @returns {Promise} Promise with the result of the operation
 */
function writeMapToFile(key, map) {
	return new Promise((resolve, reject) => {
		let textContent = getLinesArrayFromMap(map).join('\n');

		fs.writeFile(`${LOCALES_PATH}/${key}.json`, textContent, err => {
			if (err) {
				return reject(err);
			};

			resolve(true);
		});
	});
}

/**
 * Creates a sorting diff directly from map
 * 
 * @author mauricio.araldi
 * @since 0.0.1
 * 
 * @param {Map} map The object to generate diff
 * @return {Array<String>} Lines representing the diff
 */
function createSortingDiffFromMap(map) {
	let diff = [];

	for (entry of map) {
		let [key, data] = entry;

		if (typeof data.value === 'object') {
			diff.push(...createSortingDiffFromMap(data.value));
		}

		if (data.previousLine !== data.newLine) {
			diff.push(`Key <span class="diff-key">${key}</span> moved from line ${data.previousLine} to line ${data.newLine}`);
		}
	}

	return diff;
}

/**
 * Get an array of lines from a map
 * 
 * @author mauricio.araldi
 * @since 0.0.1
 * 
 * @param {Map} map The map to be transformed into an array of lines
 * @param {Number} [identation = 1] The indentation to be used in text
 * @return {Array<String>} Lines representing the map
 */
function getLinesArrayFromMap(map, identation = 1) {
	let curObjAsArray = [];

	for (entry of map) {
		let [key, { value }] = entry,
			curIdentation = IDENTATION_STRING.repeat(identation);

		if (!value) {
			continue;
		}

		if (typeof value === 'object') {
			value = getLinesArrayFromMap(value, identation + 1);

			curObjAsArray.push(`${curIdentation}"${key}": {`);
			curObjAsArray.push(...value);
			curObjAsArray.push(`${curIdentation}},`);
		} else {
			curObjAsArray.push(`${curIdentation}"${key}": "${value}",`);
		}
	}

	if (curObjAsArray.length) {
		// Removes last comma, because of JSON validity
		curObjAsArray[curObjAsArray.length - 1] = curObjAsArray[curObjAsArray.length - 1].slice(0, -1);
	}

	if (identation === 1) {
		curObjAsArray = ['{'].concat(curObjAsArray).concat(['}']);
	}

	return curObjAsArray;
}

/**
 * Load locales from the locales folder
 *
 * @author mauricio.araldi
 * @since 0.0.1
 * 
 * @return {Promise<Object>} A promise with loaded locales as array of lines by locale
 */
function loadLocales() {
	return new Promise((resolve, reject) => {
		fs.readdir(LOCALES_PATH, (err, files) => {
			if (err) {
				return reject(err);
			}

			let filesLoaded = 0;

			files.forEach(file => {
				fs.readFile(`${LOCALES_PATH}/${file}`, 'UTF-8', (err, data) => {
					if (err) {
						return reject(err);
					}

					let locale = file.slice(0, file.indexOf('.'));

					LOCALES_AS_TEXT[locale] = data.split(/\n/);
					LOCALES_AS_OBJECT[locale] = JSON.parse(data);

					if (++filesLoaded == files.length) {
						resolve(true);
					}
				});
			});
		});
	});
}

/**
 * Draws locales in the "loaded locales" section
 * 
 * @author mauricio.araldi
 * @since 0.0.1
 * 
 * @param {Object} locales The locales to be drawn
 */
function drawLoadedLocales(locales) {
	let localesDiv = document.querySelector('#locales > div');

	for (let locale in locales) {
		let button = document.createElement('span');

		button.textContent = locale;
		button.setAttribute('locale', locale);

		localesDiv.appendChild(button);
	}
}

/**
 * Sorts an object by key
 * 
 * @author mauricio.araldi
 * @since 0.0.1
 * 
 * @param {Object} data The object to be sorted
 * @param {Integer} parentPosition The line which the parent starts
 * @param {Integer} parentNewPosition The position to which the parent has gonne to
 * @return {Map} The object sorted
 */
function sortObject(data, parentPosition = 1, parentNewPosition = 1) {
	let sortedData = new Map(),
		keys = Object.keys(data),
		previousLinesRecord = {},
		currentLine = parentPosition + 1;

	keys.forEach((key, index) => {
		previousLinesRecord[key] = currentLine;

		if (typeof data[key] === 'object') {
			currentLine += getObjectFullSize(data[key], true);
		} else {
			currentLine++;
		}
	});

	currentLine = parentNewPosition + 1;

	keys.sort().forEach((key, index) => {
		let value = data[key];

		if (typeof value === 'object') {
			value = sortObject(value, previousLinesRecord[key], currentLine);
		}

		sortedData.set(
			key,
			{
				value,
				newLine: currentLine,
				previousLine: previousLinesRecord[key]
			}
		);

		if (typeof value === 'object') {
			currentLine += getObjectFullSize(data[key], true);
		} else {
			currentLine++;
		}
	});

	return sortedData;
}

/**
 * Get the size of an object, taking in account the size of each entry also
 * 
 * @author mauricio.araldi
 * @since 0.0.1
 *
 * @param {Object} object The object to get full size
 * @param {Integer} [countOpeningsAndClosings] Take in account the lines
 * opening and closing brackets
 * @return {Integer} Object full size
 */
function getObjectFullSize(object, countOpeningsAndClosings, isFirstLevel = true) {
	let size = 0;

	for (let key in object) {
		let value = object[key];

		size++;

		if (typeof value === 'object') {
			size += getObjectFullSize(value, countOpeningsAndClosings, false);

			if (countOpeningsAndClosings) {
				size++;
			}
		}
	}

	if (isFirstLevel) {
		size += 2;
	}

	return size;
}

/**
 * Prints a diff in screen
 * 
 * @author mauricio.araldi
 * @since 0.0.1
 * 
 * @param {Array<String>} diff The diff to be displayed on screen
 */
function printDiff(diff) {
	let messageContainer = document.querySelector('#message');

	clearMessageContainer();

	diff.forEach(entry => {
		let entryEl = document.createElement('SPAN');

		entryEl.innerHTML = entry;

		messageContainer.appendChild(entryEl);
	});
}

/**
 * Removes all content from message container
 * 
 * @author mauricio.araldi
 * @since 0.0.1
 */
function clearMessageContainer() {
	let messageContainer = document.querySelector('#message');

	// Removes all current children from container
	while (messageContainer.firstChild) {
		messageContainer.removeChild(messageContainer.firstChild);
	}
}